interface DiscordEmbed {
    title: string
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
export async function sendDiscordNotification(payload: DiscordWebhookPayload): Promise<boolean> {
    const botToken = process.env.DISCORD_BOT_TOKEN
    const channelId = process.env.DISCORD_CHANNEL_ID

    if (!botToken || !channelId) {
        console.warn('Discord Bot Token or Channel ID not configured')
        return false
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
            return false
        }

        return true
    } catch (error) {
        console.error('Discord API error:', error)
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
    }
): Promise<boolean> {
    const classColor = CLASS_COLORS[className.toLowerCase().replace(/\s/g, '')] || 0x5865F2
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const dashboardLink = `${appUrl}/dashboard/candidates/${candidateId}`

    const fields: DiscordEmbed['fields'] = []

    // Helper to add split fields
    const addSplitField = (name: string, value: string, inline: boolean = false) => {
        if (value.length <= 1024) {
            fields!.push({ name, value, inline })
            return
        }

        // Split logic
        const chunks = []
        let remaining = value
        const maxLength = 1000 // Leave a small buffer for safety

        while (remaining.length > 0) {
            let chunk = remaining.substring(0, maxLength)
            // Try not to cut words
            if (remaining.length > maxLength) {
                const verifiedLastSpace = chunk.lastIndexOf(' ')
                if (verifiedLastSpace > 0) {
                    chunk = remaining.substring(0, verifiedLastSpace)
                }
            }
            chunks.push(chunk)
            remaining = remaining.substring(chunk.length).trim()
        }

        chunks.forEach((chunk, index) => {
            fields!.push({
                name: `${name} (${index + 1}/${chunks.length})`,
                value: chunk,
                inline: false
            })
        })
    }

    fields.push(
        {
            name: 'Classe',
            value: className,
            inline: true,
        },
        {
            name: 'Spécialisation',
            value: specName,
            inline: true,
        }
    )

    // Add stats row if available
    if (data?.ilvl) {
        fields.push({
            name: 'iLvl',
            value: `**${data.ilvl}**`,
            inline: true,
        })
    }

    if (data?.progress) {
        fields.push({
            name: 'Raid',
            value: `**${data.progress}**`,
            inline: true,
        })
    }

    if (data?.bestPerfAvg !== undefined && data?.bestPerfAvg !== null) {
        fields.push({
            name: 'Best Avg',
            value: `${getPerfEmoji(data.bestPerfAvg, 'parse')} **${Math.round(data.bestPerfAvg)}%**`,
            inline: true,
        })
    }

    if (data?.score) {
        fields.push({
            name: 'Score MM+',
            value: `${getPerfEmoji(data.score, 'score')} **${Math.round(data.score)}**`,
            inline: true,
        })
    }

    // Text Fields with splitting logic
    addSplitField('Expérience XP / Guildes', raidExperience)
    addSplitField('À propos', aboutMe)
    addSplitField('Pourquoi JSC ?', whyJSC)
    addSplitField('Mot de la fin', motivation)

    // Add links row (Moved to end)
    let linksValue = `[Dashboard](${dashboardLink})`
    if (data?.wlogsLink) linksValue += ` • [WarcraftLogs](${data.wlogsLink})`

    fields.push({
        name: 'Liens',
        value: linksValue,
        inline: false,
    })

    const embed: DiscordEmbed = {
        title: 'Nouvelle Candidature',
        description: `**${candidateName}** a postulé pour rejoindre la guilde.`,
        color: classColor,
        fields: fields,
        footer: {
            text: 'JSC HR - Recrutement',
        },
        timestamp: new Date().toISOString(),
    }

    // Add thumbnail if avatar available
    if (data?.avatarUrl) {
        embed.thumbnail = {
            url: data.avatarUrl,
        }
    }

    // Add large image if screenshot available
    if (data?.screenshotUrl) {
        embed.image = {
            url: data.screenshotUrl,
        }
    }

    // Create Action Row with Buttons
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
