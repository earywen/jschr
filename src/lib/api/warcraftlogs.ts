import { createClient, createAdminClient } from '@/lib/supabase/server'

interface WarcraftLogsCharacter {
    name: string
    serverSlug: string
    serverRegion: string
}

interface WarcraftLogsData {
    bestPerfAvg: number | null
    medianPerfAvg: number | null
    mythicPlusScore: number | null
    ilvl: number | null
    raidProgress: string | null
    bestParses: Array<{
        encounterName: string
        spec: string
        percentile: number
        difficulty: number
    }>
    color: string
    error?: string
}

// Get OAuth token from WarcraftLogs
async function getWarcraftLogsToken(): Promise<string | null> {
    const clientId = process.env.WARCRAFTLOGS_CLIENT_ID
    const clientSecret = process.env.WARCRAFTLOGS_CLIENT_SECRET

    if (!clientId || !clientSecret) {
        console.error('WarcraftLogs credentials not configured')
        return null
    }

    try {
        const response = await fetch('https://www.warcraftlogs.com/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: clientId,
                client_secret: clientSecret,
            }),
        })

        if (!response.ok) {
            console.error('WarcraftLogs token error:', response.status)
            return null
        }

        const data = await response.json()
        return data.access_token
    } catch (error) {
        console.error('WarcraftLogs token fetch error:', error)
        return null
    }
}

// Parse WarcraftLogs URL to extract character info
export function parseWarcraftLogsUrl(url: string): WarcraftLogsCharacter | null {
    // Format: https://classic.warcraftlogs.com/character/eu/sulfuron/charactername
    const match = url.match(/warcraftlogs\.com\/character\/(eu|us|kr|tw|cn)\/([^\/]+)\/([^\/\?]+)/i)

    if (!match) return null

    return {
        name: match[3],
        serverSlug: match[2],
        serverRegion: match[1].toLowerCase(),
    }
}

// Get percentile color
function getPercentileColor(percentile: number): string {
    if (percentile >= 99) return '#e268a8' // Pink (legendary)
    if (percentile >= 95) return '#ff8000' // Orange
    if (percentile >= 75) return '#a335ee' // Purple
    if (percentile >= 50) return '#0070dd' // Blue
    if (percentile >= 25) return '#1eff00' // Green
    return '#666666' // Gray
}


// Query WarcraftLogs GraphQL API
export async function fetchWarcraftLogsData(
    warcraftlogsUrl: string
): Promise<WarcraftLogsData> {
    const character = parseWarcraftLogsUrl(warcraftlogsUrl)

    if (!character) {
        return {
            bestPerfAvg: null,
            medianPerfAvg: null,
            mythicPlusScore: null,
            ilvl: null,
            raidProgress: null,
            bestParses: [],
            color: '#666666',
            error: 'URL WarcraftLogs invalide',
        }
    }

    const token = await getWarcraftLogsToken()

    if (!token) {
        return {
            bestPerfAvg: null,
            medianPerfAvg: null,
            mythicPlusScore: null,
            ilvl: null,
            raidProgress: null,
            bestParses: [],
            color: '#666666',
            error: 'Impossible de se connecter à WarcraftLogs',
        }
    }

    // Use zoneRankings with aliases to get both Raid (zone 44) and Mythic+ (zone 45) data
    // Zone 44: Manaforge Omega (Current Raid - Season 3)
    // Zone 45: Season 3 Mythic+
    const query = `
    query CharacterData($name: String!, $serverSlug: String!, $serverRegion: String!) {
      characterData {
        character(name: $name, serverSlug: $serverSlug, serverRegion: $serverRegion) {
          name
          classID
          mythicPlusScores: zoneRankings(zoneID: 45, metric: playerscore)
          raidRankings: zoneRankings(zoneID: 44)
        }
      }
    }
  `

    try {
        const response = await fetch('https://www.warcraftlogs.com/api/v2/client', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                query,
                variables: {
                    name: character.name,
                    serverSlug: character.serverSlug,
                    serverRegion: character.serverRegion.toUpperCase(),
                },
            }),
        })

        if (!response.ok) {
            console.error('WarcraftLogs API error:', response.status)
            return {
                bestPerfAvg: null,
                medianPerfAvg: null,
                mythicPlusScore: null,
                ilvl: null,
                raidProgress: null,
                bestParses: [],
                color: '#666666',
                error: 'Erreur API WarcraftLogs',
            }
        }

        const data = await response.json()

        if (data.errors) {
            console.error('WarcraftLogs GraphQL Errors:', data.errors)
            return {
                bestPerfAvg: null,
                medianPerfAvg: null,
                mythicPlusScore: null,
                ilvl: null,
                raidProgress: null,
                bestParses: [],
                color: '#666666',
                error: 'Erreur GraphQL WarcraftLogs',
            }
        }

        const characterData = data?.data?.characterData?.character

        if (!characterData) {
            return {
                bestPerfAvg: null,
                medianPerfAvg: null,
                mythicPlusScore: null,
                ilvl: null,
                raidProgress: null,
                bestParses: [],
                color: '#666666',
                error: 'Personnage non trouvé',
            }
        }

        // Raid Data
        const raidRankings = characterData?.raidRankings
        const bestPerfAvg = raidRankings?.bestPerformanceAverage || null
        const medianPerfAvg = raidRankings?.medianPerformanceAverage || null

        // Extraction iLvl and Progress
        let ilvl: number | null = null
        let raidProgress: string | null = null

        if (raidRankings && raidRankings.rankings) {
            // Calculate iLvl (max of all bestRank.ilvl)
            const ilvls = raidRankings.rankings
                .map((r: any) => r.bestRank?.ilvl)
                .filter((v: any) => typeof v === 'number' && v > 0)

            if (ilvls.length > 0) {
                ilvl = Math.max(...ilvls)
            }

            // Calculate Progress (killed bosses)
            const kills = raidRankings.rankings.filter((r: any) => r.totalKills > 0).length
            const total = raidRankings.rankings.length // Assume rankings list covers all bosses

            // Difficulty text
            let diffText = ''
            if (raidRankings.difficulty === 5) diffText = '(MM)'
            else if (raidRankings.difficulty === 4) diffText = '(HM)'
            else if (raidRankings.difficulty === 3) diffText = '(NM)'

            raidProgress = `${kills}/${total} ${diffText}`.trim()
        }

        // Mythic+ Data
        const mPlusRankings = characterData?.mythicPlusScores?.rankings
        let mythicPlusScore = null

        if (mPlusRankings && Array.isArray(mPlusRankings) && mPlusRankings.length > 0) {
            const totalPoints = mPlusRankings.reduce((sum: number, ranking: any) => {
                const points = ranking.allStars?.points || 0
                return sum + points
            }, 0)

            if (totalPoints > 0) {
                mythicPlusScore = totalPoints
            }
        }

        const color = bestPerfAvg ? getPercentileColor(bestPerfAvg) : '#666666'

        return {
            bestPerfAvg: bestPerfAvg ? Math.round(bestPerfAvg) : null,
            medianPerfAvg: medianPerfAvg ? Math.round(medianPerfAvg) : null,
            mythicPlusScore: mythicPlusScore ? Math.round(mythicPlusScore) : null,
            ilvl,
            raidProgress,
            bestParses: [],
            color,
        }
    } catch (error) {
        console.error('WarcraftLogs fetch error:', error)
        return {
            bestPerfAvg: null,
            medianPerfAvg: null,
            mythicPlusScore: null,
            ilvl: null,
            raidProgress: null,
            bestParses: [],
            color: '#666666',
            error: 'Erreur lors de la récupération des données',
        }
    }
}

// Update candidate with WarcraftLogs data
export async function updateCandidateWlogsData(
    candidateId: string,
    wlogsScore: number | null,
    wlogsColor: string,
    mythicPlusScore: number | null,
    ilvl: number | null,
    raidProgress: string | null
): Promise<boolean> {
    const supabase = createAdminClient()

    const { error } = await supabase
        .from('candidates')
        .update({
            wlogs_score: wlogsScore,
            wlogs_color: wlogsColor,
            wlogs_mythic_plus_score: mythicPlusScore,
            wlogs_ilvl: ilvl,
            wlogs_raid_progress: raidProgress
        } as any)
        .eq('id', candidateId)

    return !error
}
