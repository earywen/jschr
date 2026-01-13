import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
    const clientId = process.env.BATTLENET_CLIENT_ID
    const redirectUri = `${request.nextUrl.origin}/api/auth/battlenet/callback`

    if (!clientId) {
        return NextResponse.json(
            { error: 'Battle.net not configured' },
            { status: 500 }
        )
    }

    // Security: Generate state and store in secure cookie for CSRF protection
    const state = crypto.randomUUID()
    const cookieStore = await cookies()
    cookieStore.set('battlenet_oauth_state', state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 10, // 10 minutes
        path: '/',
    })

    const authUrl = new URL('https://oauth.battle.net/authorize')
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('scope', 'openid wow.profile')
    authUrl.searchParams.set('state', state)

    return NextResponse.redirect(authUrl.toString())
}
