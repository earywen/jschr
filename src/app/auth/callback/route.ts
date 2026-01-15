
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyDiscordMember } from '@/lib/discord/verify-member'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard/candidates'

    if (code) {
        const supabase = await createClient()
        const { error, data } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && data.user) {
            // Extract Discord ID from user metadata
            const discordId = data.user.user_metadata?.provider_id

            if (!discordId) {
                console.error('No Discord ID found in user metadata')
                return NextResponse.redirect(`${origin}/auth/access-denied?reason=no-discord-id`)
            }

            // Verify Discord membership and role
            const { isAuthorized, error: verifyError } = await verifyDiscordMember(discordId)

            if (!isAuthorized) {
                // Sign out the user since they're not authorized
                await supabase.auth.signOut()

                const reason = encodeURIComponent(verifyError || 'Unauthorized')
                return NextResponse.redirect(`${origin}/auth/access-denied?reason=${reason}`)
            }

            // User is authorized, proceed to dashboard
            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
