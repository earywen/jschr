import { NextRequest, NextResponse } from 'next/server'

interface WoWCharacter {
    name: string
    realm: string
    level: number
    classId: number
    className: string
    faction: string
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

// Map Blizzard class IDs to our internal class slugs
const CLASS_ID_MAP: Record<number, string> = {
    1: 'warrior',
    2: 'paladin',
    3: 'hunter',
    4: 'rogue',
    5: 'priest',
    6: 'death-knight',
    7: 'shaman',
    8: 'mage',
    9: 'warlock',
    10: 'monk',
    11: 'druid',
    12: 'demon-hunter',
    13: 'evoker',
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
        return new NextResponse(
            `<html><body><script>
        window.opener.postMessage({ type: 'battlenet-error', error: '${error}' }, '*');
        window.close();
      </script></body></html>`,
            { headers: { 'Content-Type': 'text/html' } }
        )
    }

    if (!code) {
        return new NextResponse(
            `<html><body><script>
        window.opener.postMessage({ type: 'battlenet-error', error: 'Code manquant' }, '*');
        window.close();
      </script></body></html>`,
            { headers: { 'Content-Type': 'text/html' } }
        )
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
                'https://eu.api.blizzard.com/profile/user/wow?namespace=profile-eu&locale=fr_FR',
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
                                    name: char.name,
                                    realm: char.realm?.name || char.realm?.slug || '',
                                    level: char.level || 0,
                                    classId: char.playable_class?.id || 0,
                                    className: char.playable_class?.name || '',
                                    faction: char.faction?.type || '',
                                })
                            }
                        }
                    }
                }

                // Sort by level descending
                characters.sort((a, b) => b.level - a.level)

                // Only keep max level characters (top 20)
                characters = characters.slice(0, 20)
            }
        } catch (wowError) {
            console.error('WoW profile fetch error:', wowError)
            // Continue without characters
        }

        // Return success to popup with characters
        const charactersJson = JSON.stringify(characters).replace(/'/g, "\\'")

        return new NextResponse(
            `<html><body><script>
        window.opener.postMessage({ 
          type: 'battlenet-success', 
          userData: {
            battletag: '${battletag}',
            characters: ${charactersJson}
          }
        }, '*');
        window.close();
      </script></body></html>`,
            { headers: { 'Content-Type': 'text/html' } }
        )
    } catch (error) {
        console.error('Battle.net OAuth error:', error)
        return new NextResponse(
            `<html><body><script>
        window.opener.postMessage({ type: 'battlenet-error', error: 'Erreur de connexion' }, '*');
        window.close();
      </script></body></html>`,
            { headers: { 'Content-Type': 'text/html' } }
        )
    }
}
