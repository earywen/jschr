'use server'

import { fetchWarcraftLogsData, updateCandidateWlogsData } from '@/lib/api/warcraftlogs'
import { revalidatePath } from 'next/cache'

export interface FetchWlogsResult {
    success: boolean
    score?: number
    color?: string
    error?: string
}

export async function fetchWarcraftLogsForCandidate(
    candidateId: string,
    warcraftlogsUrl: string
): Promise<FetchWlogsResult> {
    if (!candidateId || !warcraftlogsUrl) {
        return { success: false, error: 'Paramètres manquants' }
    }

    // Fetch data from WarcraftLogs
    const wlogsData = await fetchWarcraftLogsData(warcraftlogsUrl)

    if (wlogsData.error) {
        return { success: false, error: wlogsData.error }
    }

    if (wlogsData.bestPerfAvg === null) {
        return { success: false, error: 'Aucune donnée trouvée pour ce personnage' }
    }

    // Update candidate in database
    const updated = await updateCandidateWlogsData(
        candidateId,
        wlogsData.bestPerfAvg,
        wlogsData.color
    )

    if (!updated) {
        return { success: false, error: 'Erreur lors de la mise à jour' }
    }

    revalidatePath(`/dashboard/candidates/${candidateId}`)

    return {
        success: true,
        score: wlogsData.bestPerfAvg,
        color: wlogsData.color,
    }
}
