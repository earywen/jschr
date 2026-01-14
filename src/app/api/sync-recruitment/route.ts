import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Triggers the recruitment sync via n8n webhook on user's home server.
 * Requires N8N_WEBHOOK_URL environment variable.
 */
export async function POST() {
    try {
        // 1. Auth check
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
        }

        // Check if user is GM
        const { data: member } = await supabase
            .from('members')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!member || member.role !== 'gm') {
            return NextResponse.json({ error: 'Accès réservé au Grand Maître' }, { status: 403 })
        }

        // 2. Trigger n8n webhook
        const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL

        if (!N8N_WEBHOOK_URL) {
            return NextResponse.json({
                error: 'N8N_WEBHOOK_URL non configuré. Ajoutez-le dans vos variables d\'environnement.',
            }, { status: 500 })
        }

        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                trigger: 'manual',
                timestamp: new Date().toISOString(),
            }),
        })

        if (response.ok) {
            return NextResponse.json({
                message: 'Synchronisation lancée sur le serveur ! Elle devrait se terminer dans 1-2 minutes.',
            })
        } else {
            const errorText = await response.text().catch(() => '')
            console.error('n8n webhook error:', response.status, errorText)
            return NextResponse.json({
                error: `Erreur serveur n8n (${response.status}). Vérifiez que le serveur est accessible.`,
            }, { status: 502 })
        }

    } catch (error) {
        console.error('Sync trigger error:', error)
        return NextResponse.json({ error: 'Erreur serveur ou serveur n8n inaccessible' }, { status: 500 })
    }
}
