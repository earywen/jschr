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

    if (wlogsData.bestPerfAvg === null && wlogsData.mythicPlusScore === null) {
        return { success: false, error: 'Aucune donnée trouvée pour ce personnage (Raid ou MM+)' }
    }

    // Update candidate in database
    const updated = await updateCandidateWlogsData(
        candidateId,
        wlogsData.bestPerfAvg,
        wlogsData.color,
        wlogsData.mythicPlusScore,
        wlogsData.ilvl ?? null,
        wlogsData.raidProgress ?? null
    )

    if (!updated) {
        return { success: false, error: 'Erreur lors de la mise à jour' }
    }

    revalidatePath(`/dashboard/candidates/${candidateId}`)

    return {
        success: true,
        score: wlogsData.bestPerfAvg || undefined,
        color: wlogsData.color,
    }
}

export async function refreshCandidateLogs(candidateId: string): Promise<FetchWlogsResult> {
    const { getUserRole } = await import('@/lib/auth/role')
    const user = await getUserRole()

    if (!user || (user.role !== 'officer' && user.role !== 'gm')) {
        return { success: false, error: 'Accès réservé aux Officiers et au Grand Maître.' }
    }

    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    const { data: candidate, error } = await supabase
        .from('candidates')
        .select('warcraftlogs_link')
        .eq('id', candidateId)
        .single()

    if (error || !candidate) {
        return { success: false, error: 'Candidature non trouvée.' }
    }

    if (!candidate.warcraftlogs_link) {
        return { success: false, error: 'Aucun lien WarcraftLogs renseigné pour cette candidature.' }
    }

    return fetchWarcraftLogsForCandidate(candidateId, candidate.warcraftlogs_link)
}
