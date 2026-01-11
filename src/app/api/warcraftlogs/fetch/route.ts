import { NextRequest, NextResponse } from 'next/server'
import { fetchWarcraftLogsData, updateCandidateWlogsData } from '@/lib/api/warcraftlogs'

export async function POST(request: NextRequest) {
    try {
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
            wlogsData.color
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
