import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Security: HTML escape function to prevent XSS
function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
}

interface WoWCharacter {
    name: string
    realm: string
    realmSlug: string
    level: number
    classId: number
    className: string
    faction: string
    avatarUrl: string
}

interface WoWCharacterSummary {
    id: number
    name: string
    realm: {
        slug: string
        name: string
    }
    playable_class: {
        id: number
        name: string
    }
    level: number
    faction: {
        type: string
    }
}

// Fetch avatar URL for a single character
async function fetchCharacterAvatar(
    realmSlug: string,
    characterName: string,
    accessToken: string
): Promise<string> {
    try {
        const charNameLower = characterName.toLowerCase()
        const url = `https://eu.api.blizzard.com/profile/wow/character/${realmSlug}/${encodeURIComponent(charNameLower)}/character-media?namespace=profile-eu&locale=en_GB`

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        })

        if (response.ok) {
            const data = await response.json()
            const avatarAsset = data.assets?.find((a: { key: string; value: string }) => a.key === 'avatar')
            return avatarAsset?.value || ''
        }
    } catch {
        // Silently fail - character may not have avatar
    }
    return ''
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const state = searchParams.get('state')

    // Security: Validate OAuth state parameter to prevent CSRF
    const cookieStore = await cookies()
    const storedState = cookieStore.get('battlenet_oauth_state')?.value

    if (!state || state !== storedState) {
        return createErrorResponse('Erreur de sécurité: état OAuth invalide')
    }

    // Clear the state cookie after validation
    cookieStore.delete('battlenet_oauth_state')

    if (error) {
        return createErrorResponse(error)
    }

    if (!code) {
        return createErrorResponse('Code manquant')
    }

    const clientId = process.env.BATTLENET_CLIENT_ID
    const clientSecret = process.env.BATTLENET_CLIENT_SECRET
    const redirectUri = `${request.nextUrl.origin}/api/auth/battlenet/callback`

    try {
        // Exchange code for token
        const tokenResponse = await fetch('https://oauth.battle.net/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: redirectUri,
            }),
        })

        if (!tokenResponse.ok) {
            throw new Error('Token exchange failed')
        }

        const tokenData = await tokenResponse.json()
        const accessToken = tokenData.access_token

        // Get user info (BattleTag)
        const userResponse = await fetch('https://oauth.battle.net/userinfo', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        })

        if (!userResponse.ok) {
            throw new Error('User info fetch failed')
        }

        const userData = await userResponse.json()
        const battletag = userData.battletag || userData.battle_tag || ''

        // Get WoW profile characters
        let characters: WoWCharacter[] = []
        try {
            const wowProfileResponse = await fetch(
                'https://eu.api.blizzard.com/profile/user/wow?namespace=profile-eu&locale=en_GB',
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                }
            )

            if (wowProfileResponse.ok) {
                const wowProfile = await wowProfileResponse.json()

                // Extract characters from all accounts
                if (wowProfile.wow_accounts) {
                    for (const account of wowProfile.wow_accounts) {
                        if (account.characters) {
                            for (const char of account.characters as WoWCharacterSummary[]) {
                                characters.push({
                                    name: char.name || '',
                                    realm: char.realm?.name || char.realm?.slug || '',
                                    realmSlug: char.realm?.slug || '',
                                    level: char.level || 0,
                                    classId: char.playable_class?.id || 0,
                                    className: char.playable_class?.name || '',
                                    faction: char.faction?.type || '',
                                    avatarUrl: '',
                                })
                            }
                        }
                    }
                }

                // Sort by level descending
                characters.sort((a, b) => b.level - a.level)

                // Only keep top 15 characters
                characters = characters.slice(0, 15)

                // Fetch avatars in parallel for all characters
                const avatarPromises = characters.map(async (char, index) => {
                    const avatarUrl = await fetchCharacterAvatar(char.realmSlug, char.name, accessToken)
                    characters[index].avatarUrl = avatarUrl
                })

                await Promise.all(avatarPromises)
            }
        } catch (wowError) {
            console.error('WoW profile fetch error:', wowError)
        }

        // Create response data
        const responseData = {
            battletag,
            characters,
        }

        // Return HTML with inline script that uses postMessage
        return new NextResponse(
            `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Battle.net Login</title>
</head>
<body>
    <p>Connexion réussie, fermeture...</p>
    <script>
        (function() {
            try {
                var data = ${JSON.stringify(responseData)};
                if (window.opener) {
                    window.opener.postMessage({ 
                        type: 'battlenet-success', 
                        userData: data
                    }, window.location.origin);
                }
            } catch(e) {
                console.error('Parse error:', e);
                if (window.opener) {
                    window.opener.postMessage({ 
                        type: 'battlenet-error', 
                        error: 'Erreur parsing: ' + e.message
                    }, window.location.origin);
                }
            }
            window.close();
        })();
    </script>
</body>
</html>`,
            {
                headers: {
                    'Content-Type': 'text/html; charset=utf-8',
                }
            }
        )
    } catch (error) {
        console.error('Battle.net OAuth error:', error)
        return createErrorResponse('Erreur de connexion')
    }
}

function createErrorResponse(errorMessage: string): NextResponse {
    // Security: Escape HTML to prevent XSS attacks
    const safeMessage = escapeHtml(errorMessage)

    return new NextResponse(
        `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Erreur</title></head>
<body>
    <script>
        if (window.opener) {
            window.opener.postMessage({ type: 'battlenet-error', error: '${safeMessage}' }, window.location.origin);
        }
        window.close();
    </script>
</body>
</html>`,
        { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
}
