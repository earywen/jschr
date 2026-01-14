import { NextRequest, NextResponse } from 'next/server'
import { fetchWarcraftLogsData, updateCandidateWlogsData } from '@/lib/api/warcraftlogs'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
    try {
        // Authentication check
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: 'Non authentifié' },
                { status: 401 }
            )
        }

        // Authorization check - only officers and GM can trigger WarcraftLogs fetch
        const { data: member, error: memberError } = await supabase
            .from('members')
            .select('role')
            .eq('id', user.id)
            .single()

        if (memberError || !member) {
            return NextResponse.json(
                { success: false, error: 'Membre non trouvé' },
                { status: 403 }
            )
        }

        if (!['officer', 'gm'].includes(member.role)) {
            return NextResponse.json(
                { success: false, error: 'Accès réservé aux officiers et au Grand Maître' },
                { status: 403 }
            )
        }

        const { candidateId, warcraftlogsUrl } = await request.json()

        if (!candidateId || !warcraftlogsUrl) {
            return NextResponse.json(
                { success: false, error: 'Paramètres manquants' },
                { status: 400 }
            )
        }

        // Fetch data from WarcraftLogs
        const wlogsData = await fetchWarcraftLogsData(warcraftlogsUrl)

        if (wlogsData.error) {
            return NextResponse.json(
                { success: false, error: wlogsData.error },
                { status: 400 }
            )
        }

        if (wlogsData.bestPerfAvg === null) {
            return NextResponse.json(
                { success: false, error: 'Aucune donnée trouvée pour ce personnage' },
                { status: 404 }
            )
        }

        // Update candidate in database
        const updated = await updateCandidateWlogsData(
            candidateId,
            wlogsData.bestPerfAvg,
            wlogsData.color,
            wlogsData.mythicPlusScore,
            wlogsData.ilvl,
            wlogsData.raidProgress
        )

        if (!updated) {
            return NextResponse.json(
                { success: false, error: 'Erreur lors de la mise à jour' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            data: {
                score: wlogsData.bestPerfAvg,
                color: wlogsData.color,
            },
        })
    } catch (error) {
        console.error('WarcraftLogs API error:', error)
        return NextResponse.json(
            { success: false, error: 'Erreur interne' },
            { status: 500 }
        )
    }
}
