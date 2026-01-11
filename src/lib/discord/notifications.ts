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

export async function notifyNewCandidate(
    candidateName: string,
    className: string,
    specName: string,
    motivation: string
): Promise<boolean> {
    const classColor = CLASS_COLORS[className.toLowerCase()] || 0x5865F2

    return sendDiscordNotification({
        username: 'JSC HR Bot',
        embeds: [
            {
                title: '📥 Nouvelle Candidature !',
                description: `**${candidateName}** a postulé pour rejoindre la guilde.`,
                color: classColor,
                fields: [
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
                    {
                        name: '📝 Motivation',
                        value: motivation.length > 200 ? motivation.substring(0, 200) + '...' : motivation,
                        inline: false,
                    },
                ],
                footer: {
                    text: 'JSC HR - Recrutement',
                },
                timestamp: new Date().toISOString(),
            },
        ],
    })
}
