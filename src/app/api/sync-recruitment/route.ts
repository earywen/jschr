import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Triggers the recruitment sync via GitHub Actions workflow_dispatch.
 * Requires a GitHub Personal Access Token with `repo` scope.
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

        // 2. Trigger GitHub Actions workflow
        const GITHUB_TOKEN = process.env.GITHUB_PAT
        const GITHUB_OWNER = 'earywen'
        const GITHUB_REPO = 'jschr'
        const WORKFLOW_ID = 'daily-recruitment-sync.yml'

        if (!GITHUB_TOKEN) {
            return NextResponse.json({
                error: 'GITHUB_PAT non configuré. Ajoutez-le dans vos variables d\'environnement.',
            }, { status: 500 })
        }

        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/workflows/${WORKFLOW_ID}/dispatches`,
            {
                method: 'POST',
                headers: {
                    'Accept': 'application/vnd.github+json',
                    'Authorization': `Bearer ${GITHUB_TOKEN}`,
                    'X-GitHub-Api-Version': '2022-11-28',
                },
                body: JSON.stringify({
                    ref: 'main', // Branch to run the workflow on
                }),
            }
        )

        if (response.status === 204) {
            return NextResponse.json({
                message: 'Synchronisation lancée ! Elle devrait se terminer dans 1-2 minutes.',
            })
        } else {
            const errorData = await response.json().catch(() => ({}))
            console.error('GitHub API error:', response.status, errorData)
            return NextResponse.json({
                error: `Erreur GitHub (${response.status}): ${errorData.message || 'Vérifiez votre token.'}`,
            }, { status: response.status })
        }

    } catch (error) {
        console.error('Sync trigger error:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}

