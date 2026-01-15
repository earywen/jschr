'use server'

/**
 * Verifies if a Discord user is a member of the Jet Set Club server
 * and has the required "Jet Setter" role.
 */
export async function verifyDiscordMember(discordId: string): Promise<{
    isAuthorized: boolean
    error?: string
}> {
    const GUILD_ID = process.env.DISCORD_GUILD_ID!
    const REQUIRED_ROLE_ID = process.env.DISCORD_REQUIRED_ROLE_ID!
    const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!

    if (!GUILD_ID || !REQUIRED_ROLE_ID || !BOT_TOKEN) {
        console.error('Missing Discord configuration')
        return { isAuthorized: false, error: 'Configuration error' }
    }

    try {
        // Check if user is a member of the guild
        const response = await fetch(
            `https://discord.com/api/v10/guilds/${GUILD_ID}/members/${discordId}`,
            {
                headers: {
                    Authorization: `Bot ${BOT_TOKEN}`,
                },
            }
        )

        if (!response.ok) {
            if (response.status === 404) {
                console.log(`User ${discordId} is not a member of the guild`)
                return {
                    isAuthorized: false,
                    error: 'Not a member of Jet Set Club Discord server'
                }
            }
            throw new Error(`Discord API error: ${response.status}`)
        }

        const member = await response.json()

        // Check if user has the required role
        const hasRequiredRole = member.roles?.includes(REQUIRED_ROLE_ID)

        if (!hasRequiredRole) {
            console.log(`User ${discordId} does not have the required role`)
            return {
                isAuthorized: false,
                error: 'Missing "Jet Setter" role on Discord server'
            }
        }

        console.log(`User ${discordId} verified successfully`)
        return { isAuthorized: true }
    } catch (error) {
        console.error('Error verifying Discord member:', error)
        return {
            isAuthorized: false,
            error: 'Failed to verify Discord membership'
        }
    }
}
