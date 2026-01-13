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
}

export async function sendDiscordNotification(payload: DiscordWebhookPayload): Promise<boolean> {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL

    if (!webhookUrl) {
        console.warn('Discord webhook URL not configured')
        return false
    }

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })

        if (!response.ok) {
            console.error('Discord webhook failed:', response.status, await response.text())
            return false
        }

        return true
    } catch (error) {
        console.error('Discord webhook error:', error)
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
    const classColor = CLASS_COLORS[className.toLowerCase()] || 0x5865F2
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const dashboardLink = `${appUrl}/dashboard/candidates/${candidateId}`

    const fields = [
        {
            name: '⚔️ Classe',
            value: className,
            inline: true,
        },
        {
            name: '🎯 Spécialisation',
            value: specName,
            inline: true,
        },
    ]

    // Add stats row if available
    if (data?.ilvl) {
        fields.push({
            name: '🛡️ iLvl',
            value: `**${data.ilvl}**`,
            inline: true,
        })
    }

    if (data?.progress) {
        fields.push({
            name: '🏰 Raid',
            value: `**${data.progress}**`,
            inline: true,
        })
    }

    // Force a line break if needed or let Discord wrap, but usually 3 per line.
    // To ensure specific grid, we can stick to simple inline order.

    if (data?.bestPerfAvg !== undefined && data?.bestPerfAvg !== null) {
        fields.push({
            name: '📊 Best Avg',
            value: `${getPerfEmoji(data.bestPerfAvg, 'parse')} **${Math.round(data.bestPerfAvg)}%**`,
            inline: true,
        })
    }

    if (data?.score) {
        fields.push({
            name: '🔑 Score MM+',
            value: `${getPerfEmoji(data.score, 'score')} **${Math.round(data.score)}**`,
            inline: true,
        })
    }

    // Add links row
    let linksValue = `[Dashboard](${dashboardLink})`
    if (data?.wlogsLink) linksValue += ` • [WarcraftLogs](${data.wlogsLink})`
    if (data?.screenshotUrl) linksValue += ` • [Interface](${data.screenshotUrl})`

    // Add Voter link specifically
    linksValue += ` • [🗳️ Voter](${dashboardLink}#vote-section)`

    fields.push({
        name: '🔗 Liens',
        value: linksValue,
        inline: false,
    })

    // Text Fields
    // Helper to truncate text
    const truncate = (str: string, max: number) => str.length > max ? str.substring(0, max) + '...' : str

    fields.push({
        name: '📜 Expérience XP / Guildes',
        value: truncate(raidExperience, 1024),
        inline: false,
    })

    fields.push({
        name: '👤 À propos',
        value: truncate(aboutMe, 1024),
        inline: false,
    })

    fields.push({
        name: '🎯 Pourquoi JSC ?',
        value: truncate(whyJSC, 1024),
        inline: false,
    })

    fields.push({
        name: '💬 Mot de la fin',
        value: truncate(motivation, 1024),
        inline: false,
    })

    const embed: DiscordEmbed = {
        title: '📥 Nouvelle Candidature !',
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

    return sendDiscordNotification({
        username: 'JSC HR Bot',
        embeds: [embed],
    })
}
