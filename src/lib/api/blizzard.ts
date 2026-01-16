/**
 * Blizzard API utility functions for fetching character avatars
 */

interface BlizzardCharacterMedia {
    avatar_url?: string
    bust_url?: string
    render_url?: string
}

interface BlizzardApiToken {
    access_token: string
    token_type: string
    expires_in: number
}

/**
 * Get OAuth token from Blizzard API
 */
async function getBlizzardToken(): Promise<string | null> {
    const clientId = process.env.BATTLENET_CLIENT_ID
    const clientSecret = process.env.BATTLENET_CLIENT_SECRET

    if (!clientId || !clientSecret) {
        console.error('Missing Blizzard API credentials')
        return null
    }

    try {
        const response = await fetch('https://oauth.battle.net/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
            },
            body: 'grant_type=client_credentials',
        })

        if (!response.ok) {
            console.error('Failed to get Blizzard token:', response.status)
            return null
        }

        const data = (await response.json()) as BlizzardApiToken
        return data.access_token
    } catch (error) {
        console.error('Error getting Blizzard token:', error)
        return null
    }
}

/**
 * Fetch character avatar from Blizzard API using region, realm, and character name
 * @param region - Region code (eu, us, kr, tw, cn)
 * @param realm - Realm slug (e.g., 'khaz-modan')
 * @param characterName - Character name
 * @returns Avatar URL or null if not found
 */
export async function fetchBlizzardAvatar(
    region: string,
    realm: string,
    characterName: string
): Promise<string | null> {
    const token = await getBlizzardToken()
    if (!token) return null

    // Normalize inputs
    const normalizedRegion = region.toLowerCase()
    const normalizedRealm = realm.toLowerCase().replace(/\s+/g, '-')
    const normalizedName = characterName.toLowerCase()

    // Determine API host based on region
    const apiHost = normalizedRegion === 'cn'
        ? `https://gateway.battlenet.com.cn`
        : `https://${normalizedRegion}.api.blizzard.com`

    try {
        // First, get character media
        const mediaUrl = `${apiHost}/profile/wow/character/${normalizedRealm}/${normalizedName}/character-media?namespace=profile-${normalizedRegion}&locale=en_US`

        const response = await fetch(mediaUrl, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        if (!response.ok) {
            console.error(`Failed to fetch character media: ${response.status}`, await response.text())
            return null
        }

        const data = (await response.json()) as { assets?: Array<{ key: string; value: string }> }

        // Look for avatar in assets
        const avatarAsset = data.assets?.find(asset => asset.key === 'avatar')

        return avatarAsset?.value || null
    } catch (error) {
        console.error('Error fetching Blizzard avatar:', error)
        return null
    }
}

/**
 * Fetch character avatar from WarcraftLogs URL
 * Parses the URL and calls Blizzard API
 * @param warcraftlogsUrl - WarcraftLogs character URL
 * @returns Avatar URL or null if not found
 */
export async function fetchAvatarFromWarcraftLogsUrl(
    warcraftlogsUrl: string
): Promise<string | null> {
    // Import the parse function
    const { parseWarcraftLogsUrl } = await import('./warcraftlogs')

    const character = parseWarcraftLogsUrl(warcraftlogsUrl)
    if (!character) {
        console.error('Invalid WarcraftLogs URL')
        return null
    }

    return fetchBlizzardAvatar(
        character.serverRegion,
        character.serverSlug,
        character.name
    )
}
