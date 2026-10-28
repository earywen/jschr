interface DiscordEmbed {
    author?: {
        name: string
        icon_url?: string
        url?: string
    }
    title: string
    url?: string
    description?: string
    color?: number
    fields?: Array<{
        name: string
        value: string
        inline?: boolean
    }>
    footer?: {
        text: string
    }
    timestamp?: string
    thumbnail?: {
        url: string
    }
    image?: {
        url: string
    }
}

interface DiscordWebhookPayload {
    content?: string
    embeds?: DiscordEmbed[]
    username?: string
    avatar_url?: string
    components?: any[]
}

// Updated to use Bot API for Interactive Components
// Returns the message ID on success, null on failure
export async function sendDiscordNotification(payload: DiscordWebhookPayload): Promise<string | null> {
    const botToken = process.env.DISCORD_BOT_TOKEN
    const channelId = process.env.DISCORD_CHANNEL_ID

    if (!botToken || !channelId) {
        console.warn('Discord Bot Token or Channel ID not configured')
        return null
    }

    try {
        const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bot ${botToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: payload.content,
                embeds: payload.embeds,
                components: payload.components
                // Username/Avatar ignored by Bot API
            }),
        })

        if (!response.ok) {
            console.error('Discord API failed:', response.status, await response.text())
            return null
        }

        const data = await response.json()
        return data.id || null // Return the Discord message ID
    } catch (error) {
        console.error('Discord API error:', error)
        return null
    }
}

// Update an existing Discord message (for vote sync)
export async function updateDiscordMessage(
    messageId: string,
    components: any[]
): Promise<boolean> {
    const botToken = process.env.DISCORD_BOT_TOKEN
    const channelId = process.env.DISCORD_CHANNEL_ID

    if (!botToken || !channelId || !messageId) {
        console.warn('Discord Bot Token, Channel ID, or Message ID not configured')
        return false
    }

    try {
        const response = await fetch(
            `https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`,
            {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bot ${botToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ components }),
            }
        )

        if (!response.ok) {
            console.error('Discord API update failed:', response.status, await response.text())
            return false
        }

        return true
    } catch (error) {
        console.error('Discord API update error:', error)
        return false
    }
}

// Close Discord voting by removing buttons and updating embed header
export async function closeDiscordVote(
    messageId: string,
    status: 'accepted' | 'rejected'
): Promise<boolean> {
    const botToken = process.env.DISCORD_BOT_TOKEN
    const channelId = process.env.DISCORD_CHANNEL_ID

    if (!botToken || !channelId || !messageId) {
        return false
    }

    try {
        const getRes = await fetch(
            `https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`,
            {
                headers: {
                    Authorization: `Bot ${botToken}`,
                },
            }
        )

        let embeds: any[] | undefined = undefined
        if (getRes.ok) {
            const currentMessage = await getRes.json()
            if (currentMessage.embeds && currentMessage.embeds.length > 0) {
                const embed = { ...currentMessage.embeds[0] }
                const statusTag = status === 'accepted' ? '✅ [ACCEPTÉ]' : '❌ [REFUSÉ]'
                const statusColor = status === 'accepted' ? 0x2ecc71 : 0xe74c3c
                const cleanTitle = (embed.title || 'Candidature').replace(/^(✅ \[ACCEPTÉ\]|❌ \[REFUSÉ\])\s*/, '')
                embed.title = `${statusTag} ${cleanTitle}`
                embed.color = statusColor
                embeds = [embed]
            }
        }

        const patchPayload: Record<string, any> = { components: [] }
        if (embeds) {
            patchPayload.embeds = embeds
        }

        const response = await fetch(
            `https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`,
            {
                method: 'PATCH',
                headers: {
                    Authorization: `Bot ${botToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(patchPayload),
            }
        )

        return response.ok
    } catch (error) {
        console.error('Error closing Discord vote:', error)
        return false
    }
}

// Delete an existing Discord message (on candidate deletion)
export async function deleteDiscordMessage(messageId: string): Promise<boolean> {
    const botToken = process.env.DISCORD_BOT_TOKEN
    const channelId = process.env.DISCORD_CHANNEL_ID

    if (!botToken || !channelId || !messageId) {
        return false
    }

    try {
        const response = await fetch(
            `https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`,
            {
                method: 'DELETE',
                headers: {
                    Authorization: `Bot ${botToken}`,
                },
            }
        )
        return response.ok
    } catch (error) {
        console.error('Discord API delete error:', error)
        return false
    }
}

// WoW class colors as Discord embed colors (decimal values)
const CLASS_COLORS: Record<string, number> = {
    warrior: 0xC79C6E,
    paladin: 0xF58CBA,
    hunter: 0xABD473,
    rogue: 0xFFF569,
    priest: 0xFFFFFF,
    mage: 0x40C7EB,
    warlock: 0x8787ED,
    druid: 0xFF7D0A,
    // Add missing classes for safety, defaulting to gray if unknown
    shaman: 0x0070DE,
    demonhunter: 0xA330C9,
    deathknight: 0xC41E3A,
    monk: 0x00FF96,
    evoker: 0x33937F,
}

// Helper to get emoji based on performance/score
function getPerfEmoji(value: number, type: 'parse' | 'score' = 'parse'): string {
    if (type === 'parse') {
        if (value === 100) return '👑' // Gold/100
        if (value >= 99) return '🩷' // Pink/99
        if (value >= 95) return '🧡' // Orange/Legendary
        if (value >= 75) return '💜' // Purple/Epic
        if (value >= 50) return '💙' // Blue/Rare
        if (value >= 25) return '💚' // Green/Uncommon
        return '⚪' // Gray/Common
    } else {
        // M+ Score thresholds (roughly based on current season)
        if (value >= 3500) return '👑'
        if (value >= 3300) return '🩷'
        if (value >= 3000) return '🧡'
        if (value >= 2500) return '💜'
        if (value >= 2000) return '💙'
        if (value >= 1500) return '💚'
        return '⚪'
    }
}

// Returns the Discord message ID on success, null on failure
export async function notifyNewCandidate(
    candidateId: string,
    candidateName: string,
    className: string,
    specName: string,
    raidExperience: string,
    aboutMe: string,
    whyJSC: string,
    motivation: string,
    data?: {
        ilvl?: number | null
        score?: number | null
        progress?: string | null
        bestPerfAvg?: number | null
        wlogsLink?: string | null
        screenshotUrl?: string | null
        avatarUrl?: string | null
        secondarySpecs?: string[] | null
        realm?: string | null
        alts?: string | null
    }
): Promise<string | null> {
    const classColor = CLASS_COLORS[className.toLowerCase().replace(/\s/g, '')] || 0x5865F2
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const dashboardLink = `${appUrl}/dashboard/candidates/${candidateId}`

    let description = ''

    if (raidExperience?.trim()) {
        description += `**Expérience Raid**\n${raidExperience.trim()}\n\n`
    }

    if (data?.alts?.trim()) {
        const altItems = data.alts.split(',').map(a => a.trim()).filter(Boolean)
        if (altItems.length > 0) {
            // Determine region for WarcraftLogs links (default 'eu')
            let region = 'eu'
            if (data?.wlogsLink) {
                const regMatch = data.wlogsLink.match(/warcraftlogs\.com\/character\/(eu|us|kr|tw|cn)/i)
                if (regMatch) region = regMatch[1].toLowerCase()
            }

            description += `**Rerolls**\n`
            for (const item of altItems) {
                // Match format: CharacterName (Realm) - Class (Spec)
                const match = item.match(/^([^\(\)]+?)\s*\(([^()]+)\)\s*[-—]\s*(.+)$/)
                if (match) {
                    const charName = match[1].trim()
                    const realmName = match[2].trim()
                    const classSpec = match[3].trim()
                    const realmSlug = realmName
                        .toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-+|-+$/g, '')
                    const nameSlug = encodeURIComponent(charName.toLowerCase())
                    const wlogsUrl = `https://www.warcraftlogs.com/character/${region}/${realmSlug}/${nameSlug}`
                    description += `• [${charName}](${wlogsUrl}) *(${realmName})* — ${classSpec}\n`
                } else {
                    description += `• ${item}\n`
                }
            }
            description += `\n`
        }
    }

    if (aboutMe?.trim()) {
        description += `**À propos**\n${aboutMe.trim()}\n\n`
    }

    if (whyJSC?.trim()) {
        description += `**Pourquoi le JSC ?**\n${whyJSC.trim()}\n\n`
    }

    if (motivation?.trim()) {
        description += `**Mot de la fin**\n${motivation.trim()}\n\n`
    }

    // Links section
    const linksList: string[] = []
    if (data?.wlogsLink) linksList.push(`[WarcraftLogs](${data.wlogsLink})`)
    if (data?.screenshotUrl) linksList.push(`[Interface UI](${data.screenshotUrl})`)
    linksList.push(`[Fiche Recrutement](${dashboardLink})`)

    description += `**Liens**\n${linksList.join(' • ')}`

    // Trim description if too long (Discord limit: 4096 chars)
    if (description.length > 4000) {
        description = description.substring(0, 3997) + '...'
    }

    // Perfectly balanced 2x3 inline fields grid
    const fields: DiscordEmbed['fields'] = []

    // Row 1: Spec Principale, Spé(s) Secondaire(s), Serveur
    fields.push(
        {
            name: 'Spé Principale',
            value: `**${specName}**`,
            inline: true,
        },
        {
            name: 'Spé(s) Secondaire(s)',
            value: (data?.secondarySpecs && data.secondarySpecs.length > 0)
                ? data.secondarySpecs.join(', ')
                : 'Aucune',
            inline: true,
        },
        {
            name: 'Serveur',
            value: data?.realm || 'Non précisé',
            inline: true,
        }
    )

    // Row 2: Ilvl & Progress, Best Avg Logs, Score MM+
    const ilvlStr = data?.ilvl ? `${data.ilvl} ilvl` : null
    const raidStr = data?.progress ? data.progress : null
    const gearProgressStr = [ilvlStr, raidStr].filter(Boolean).map(s => `\`${s}\``).join(' • ')

    fields.push(
        {
            name: 'Ilvl & Progress',
            value: gearProgressStr || 'Non renseigné',
            inline: true,
        },
        {
            name: 'Best Avg Logs',
            value: (data?.bestPerfAvg !== undefined && data?.bestPerfAvg !== null)
                ? `${getPerfEmoji(data.bestPerfAvg, 'parse')} **${Math.round(data.bestPerfAvg)}%**`
                : 'N/A',
            inline: true,
        },
        {
            name: 'Score MM+',
            value: (data?.score)
                ? `${getPerfEmoji(data.score, 'score')} **${Math.round(data.score)}**`
                : 'N/A',
            inline: true,
        }
    )

    const realmSuffix = data?.realm ? ` — ${data.realm}` : ''
    const embed: DiscordEmbed = {
        author: {
            name: 'Jet Set Club • Recrutement',
            icon_url: 'https://render.worldofwarcraft.com/eu/icons/56/achievement_boss_illidan.jpg',
            url: appUrl,
        },
        title: `Candidature de ${candidateName}${realmSuffix}`,
        url: dashboardLink,
        description: description,
        color: classColor,
        fields: fields,
        footer: {
            text: 'JSC HR • Vote ouvert au roster',
        },
        timestamp: new Date().toISOString(),
    }

    // Add thumbnail if avatar available
    if (data?.avatarUrl) {
        embed.thumbnail = {
            url: data.avatarUrl,
        }
    }

    // Create Action Row with Buttons (3 vote buttons + 1 direct link button)
    const components = [
        {
            type: 1, // Action Row
            components: [
                {
                    type: 2, // Button
                    style: 3, // Success (Green)
                    label: 'Pour',
                    emoji: { name: '✅' },
                    custom_id: `vote:${candidateId}:yes`
                },
                {
                    type: 2, // Button
                    style: 2, // Secondary (Grey)
                    label: 'Neutre',
                    emoji: { name: '😐' },
                    custom_id: `vote:${candidateId}:neutral`
                },
                {
                    type: 2, // Button
                    style: 4, // Danger (Red)
                    label: 'Contre',
                    emoji: { name: '🛑' },
                    custom_id: `vote:${candidateId}:no`
                },
                {
                    type: 2, // Button
                    style: 5, // Link Button
                    label: 'Fiche Complète',
                    url: dashboardLink
                }
            ]
        }
    ]

    return sendDiscordNotification({
        username: 'JSC HR Bot',
        embeds: [embed],
        components: components
    })
}
