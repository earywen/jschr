import { createAdminClient } from '@/lib/supabase/server'

interface WarcraftLogsCharacter {
    name: string
    serverSlug: string
    serverRegion: string
}

// WarcraftLogs API response types
interface WLogsRanking {
    totalKills?: number
    bestRank?: {
        ilvl?: number
    }
    allStars?: {
        points?: number
    }
}

interface WLogsRaidRankings {
    rankings?: WLogsRanking[]
    bestPerformanceAverage?: number
    medianPerformanceAverage?: number
    difficulty?: number
}

interface WLogsMythicPlusScores {
    rankings?: WLogsRanking[]
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
    // Format: https://www.warcraftlogs.com/character/eu/sulfuron/charactername
    const match = url.match(/warcraftlogs\.com\/character\/(eu|us|kr|tw|cn)\/([^\/]+)\/([^\/\?#]+)/i)

    if (!match) return null

    const rawSlug = decodeURIComponent(match[2])
    const serverSlug = rawSlug
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

    return {
        name: decodeURIComponent(match[3]).trim(),
        serverSlug,
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

// Cache active raid and M+ zones to avoid fetching worldData on every request
let cachedActiveZones: { raidZoneId: number; mplusZoneId: number; timestamp: number } | null = null

async function getActiveZones(token: string): Promise<{ raidZoneId: number; mplusZoneId: number }> {
    if (cachedActiveZones && Date.now() - cachedActiveZones.timestamp < 3600 * 1000) {
        return { raidZoneId: cachedActiveZones.raidZoneId, mplusZoneId: cachedActiveZones.mplusZoneId }
    }

    try {
        const query = `
            query {
                worldData {
                    zones {
                        id
                        name
                        frozen
                    }
                }
            }
        `
        const response = await fetch('https://www.warcraftlogs.com/api/v2/client', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ query }),
        })

        if (response.ok) {
            const data = await response.json()
            const allZones: Array<{ id: number; name: string; frozen?: boolean }> = data?.data?.worldData?.zones || []
            const unfrozen = allZones.filter(z => !z.frozen)

            const mplusZone = unfrozen.find(z => z.name.toLowerCase().includes('mythic+')) ||
                [...allZones].filter(z => z.name.toLowerCase().includes('mythic+')).sort((a, b) => b.id - a.id)[0]

            const raidZone = unfrozen.find(z =>
                !z.name.toLowerCase().includes('mythic+') &&
                !z.name.toLowerCase().includes('delve') &&
                !z.name.toLowerCase().includes('torghast')
            ) || [...allZones].filter(z =>
                !z.name.toLowerCase().includes('mythic+') &&
                !z.name.toLowerCase().includes('delve')
            ).sort((a, b) => b.id - a.id)[0]

            if (raidZone && mplusZone) {
                cachedActiveZones = {
                    raidZoneId: raidZone.id,
                    mplusZoneId: mplusZone.id,
                    timestamp: Date.now(),
                }
                return { raidZoneId: raidZone.id, mplusZoneId: mplusZone.id }
            }
        }
    } catch (err) {
        console.error('Error fetching active zones from WarcraftLogs:', err)
    }

    // Default fallback to Midnight current tier
    return { raidZoneId: 53, mplusZoneId: 55 }
}

// Query WarcraftLogs GraphQL API
export async function fetchWarcraftLogsData(
    warcraftlogsUrl: string,
    options?: {
        role?: 'tank' | 'healer' | 'dps'
        specName?: string
    }
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

    const activeZones = await getActiveZones(token)

    // Dynamic query using current active raid and M+ zones
    const query = `
    query CharacterData($name: String!, $serverSlug: String!, $serverRegion: String!, $raidZoneId: Int!, $mplusZoneId: Int!) {
      characterData {
        character(name: $name, serverSlug: $serverSlug, serverRegion: $serverRegion) {
          name
          classID
          raidRankingsDps: zoneRankings(zoneID: $raidZoneId, metric: dps)
          raidRankingsHps: zoneRankings(zoneID: $raidZoneId, metric: hps)
          mythicPlusScores: zoneRankings(zoneID: $mplusZoneId, metric: playerscore)
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
                    raidZoneId: activeZones.raidZoneId,
                    mplusZoneId: activeZones.mplusZoneId,
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

        // Determine raidRankings (HPS for healers, DPS for others, or auto-detect based on data)
        const isHealer = options?.role === 'healer'
        let raidRankings = isHealer
            ? (characterData.raidRankingsHps || characterData.raidRankingsDps)
            : (characterData.raidRankingsDps || characterData.raidRankingsHps)

        if (!options?.role) {
            const hpsAvg = characterData.raidRankingsHps?.bestPerformanceAverage
            const dpsAvg = characterData.raidRankingsDps?.bestPerformanceAverage
            if (hpsAvg && !dpsAvg) {
                raidRankings = characterData.raidRankingsHps
            } else if (dpsAvg && !hpsAvg) {
                raidRankings = characterData.raidRankingsDps
            }
        }

        const bestPerfAvg = raidRankings?.bestPerformanceAverage || null
        const medianPerfAvg = raidRankings?.medianPerformanceAverage || null

        // Extraction iLvl and Progress
        let ilvl: number | null = null
        let raidProgress: string | null = null

        if (raidRankings && raidRankings.rankings) {
            // Calculate iLvl (max of all bestRank.ilvl)
            const ilvls = raidRankings.rankings
                .map((r: WLogsRanking) => r.bestRank?.ilvl)
                .filter((v: number | undefined | null): v is number => typeof v === 'number' && v > 0)

            if (ilvls.length > 0) {
                ilvl = Math.max(...ilvls)
            }

            // Calculate Progress (killed bosses)
            const kills = raidRankings.rankings.filter((r: WLogsRanking) => (r.totalKills ?? 0) > 0).length
            const total = raidRankings.rankings.length

            // Difficulty text
            let diffText = ''
            if (raidRankings.difficulty === 5) diffText = '(MM)'
            else if (raidRankings.difficulty === 4) diffText = '(HM)'
            else if (raidRankings.difficulty === 3) diffText = '(NM)'

            if (total > 0 && kills > 0) {
                raidProgress = `${kills}/${total} ${diffText}`.trim()
            } else if (total > 0) {
                raidProgress = `0/${total}`
            }
        }

        // Mythic+ Data
        const mPlusData = characterData?.mythicPlusScores
        const mPlusRankings = mPlusData?.rankings
        let mythicPlusScore: number | null = null

        if (mPlusRankings && Array.isArray(mPlusRankings) && mPlusRankings.length > 0) {
            const totalPoints = mPlusRankings.reduce((sum: number, ranking: WLogsRanking) => {
                const points = ranking.allStars?.points || 0
                return sum + points
            }, 0)

            if (totalPoints > 0) {
                mythicPlusScore = Math.round(totalPoints)
            }
        }

        // Fallback to allStars array if totalPoints was 0
        if (!mythicPlusScore && mPlusData?.allStars && Array.isArray(mPlusData.allStars)) {
            const allStarPoints = mPlusData.allStars.map((a: any) => a.points || 0)
            if (allStarPoints.length > 0) {
                const maxScore = Math.max(...allStarPoints)
                if (maxScore > 0) {
                    mythicPlusScore = Math.round(maxScore)
                }
            }
        }

        const color = bestPerfAvg ? getPercentileColor(bestPerfAvg) : '#666666'

        return {
            bestPerfAvg: bestPerfAvg ? Math.round(bestPerfAvg * 10) / 10 : null,
            medianPerfAvg: medianPerfAvg ? Math.round(medianPerfAvg * 10) / 10 : null,
            mythicPlusScore,
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
