
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function getWarcraftLogsToken() {
  const clientId = process.env.WARCRAFTLOGS_CLIENT_ID;
  const clientSecret = process.env.WARCRAFTLOGS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('Missing credentials');
    return null;
  }

  const response = await fetch('https://www.warcraftlogs.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  const data = await response.json();
  return data.access_token;
}

async function testQuery() {
  const token = await getWarcraftLogsToken();
  if (!token) return;

  const query = `
    query CharacterData($name: String!, $serverSlug: String!, $serverRegion: String!) {
      characterData {
        character(name: $name, serverSlug: $serverSlug, serverRegion: $serverRegion) {
          name
          classID
          # Looking for ilvl: often found in bestRank, rank metadata or summary data.
          # We'll check raidRankings deeply.
          raidRankings: zoneRankings(zoneID: 44)
        }
      }
    }
  `;

  // Character: Earywen / Hyjal / EU
  const variables = {
    name: 'Earywen',
    serverSlug: 'hyjal',
    serverRegion: 'EU'
  };

  console.log('Querying for iLvl and Progress...', variables);

  const response = await fetch('https://www.warcraftlogs.com/api/v2/client', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  const data = await response.json();
  const char = data?.data?.characterData?.character;
  const raid = char?.raidRankings;

  console.log('Character:', char?.name);
  console.log('Raid Best Perf Avg:', raid?.bestPerformanceAverage);
  console.log('Difficulty:', raid?.difficulty);

  if (raid?.rankings) {
    const kills = raid.rankings.filter((r: any) => r.totalKills > 0).length;
    console.log('Total Kills > 0:', kills);

    const ilvls = raid.rankings.map((r: any) => r.bestRank?.ilvl).filter((i: any) => i);
    console.log('Found iLvls:', ilvls);
  } else {
    console.log('No raid rankings found.');
  }

  // Also check Zone 38 (Nerub-ar Palace) just in case
  console.log('Checking Zone 38 (Nerub-ar Palace)...');
  const query38 = query.replace('zoneID: 44', 'zoneID: 38');
  const resp38 = await fetch('https://www.warcraftlogs.com/api/v2/client', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ query: query38, variables }),
  });
  const data38 = await resp38.json();
  const raid38 = data38?.data?.characterData?.character?.raidRankings;
  console.log('Zone 38 Best Perf Avg:', raid38?.bestPerformanceAverage);
  if (raid38?.rankings) {
    const kills38 = raid38.rankings.filter((r: any) => r.totalKills > 0).length;
    console.log('Zone 38 Total Kills:', kills38);
    const ilvls38 = raid38.rankings.map((r: any) => r.bestRank?.ilvl).filter((i: any) => i);
    console.log('Zone 38 iLvls:', ilvls38);
  }
}

testQuery();
