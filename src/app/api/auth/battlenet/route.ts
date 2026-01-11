import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const clientId = process.env.BATTLENET_CLIENT_ID
    const redirectUri = `${request.nextUrl.origin}/api/auth/battlenet/callback`

    if (!clientId) {
        return NextResponse.json(
            { error: 'Battle.net not configured' },
            { status: 500 }
        )
    }

    const authUrl = new URL('https://oauth.battle.net/authorize')
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('scope', 'openid wow.profile')
    authUrl.searchParams.set('state', crypto.randomUUID())

    return NextResponse.redirect(authUrl.toString())
}
