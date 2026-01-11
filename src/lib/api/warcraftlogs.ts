import { createClient } from '@/lib/supabase/server'

interface WarcraftLogsCharacter {
    name: string
    serverSlug: string
    serverRegion: string
}

interface WarcraftLogsData {
    bestPerfAvg: number | null
    medianPerfAvg: number | null
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
            bestParses: [],
            color: '#666666',
            error: 'Impossible de se connecter à WarcraftLogs',
        }
    }

    // Use allStars to get overall performance instead of specific zone
    const query = `
    query CharacterData($name: String!, $serverSlug: String!, $serverRegion: String!) {
      characterData {
        character(name: $name, serverSlug: $serverSlug, serverRegion: $serverRegion) {
          name
          classID
          zoneRankings
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
                    serverRegion: character.serverRegion,
                },
            }),
        })

        if (!response.ok) {
            console.error('WarcraftLogs API error:', response.status)
            return {
                bestPerfAvg: null,
                medianPerfAvg: null,
                bestParses: [],
                color: '#666666',
                error: 'Erreur API WarcraftLogs',
            }
        }

        const data = await response.json()
        const rankings = data?.data?.characterData?.character?.zoneRankings

        if (!rankings) {
            return {
                bestPerfAvg: null,
                medianPerfAvg: null,
                bestParses: [],
                color: '#666666',
                error: 'Personnage non trouvé',
            }
        }

        const bestPerfAvg = rankings.bestPerformanceAverage || null
        const medianPerfAvg = rankings.medianPerformanceAverage || null
        const color = bestPerfAvg ? getPercentileColor(bestPerfAvg) : '#666666'

        return {
            bestPerfAvg: bestPerfAvg ? Math.round(bestPerfAvg) : null,
            medianPerfAvg: medianPerfAvg ? Math.round(medianPerfAvg) : null,
            bestParses: [],
            color,
        }
    } catch (error) {
        console.error('WarcraftLogs fetch error:', error)
        return {
            bestPerfAvg: null,
            medianPerfAvg: null,
            bestParses: [],
            color: '#666666',
            error: 'Erreur lors de la récupération des données',
        }
    }
}

// Update candidate with WarcraftLogs data
export async function updateCandidateWlogsData(
    candidateId: string,
    wlogsScore: number,
    wlogsColor: string
): Promise<boolean> {
    const supabase = await createClient()

    const { error } = await supabase
        .from('candidates')
        .update({
            wlogs_score: wlogsScore,
            wlogs_color: wlogsColor,
        })
        .eq('id', candidateId)

    return !error
}
