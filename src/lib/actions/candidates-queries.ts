'use server'

import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database.types'

type Candidate = Database['public']['Tables']['candidates']['Row']
type CandidateStatus = Database['public']['Enums']['candidate_status']

export interface CandidateWithDetails extends Candidate {
    wlogs_mythic_plus_score?: number | null
    wlogs_ilvl?: number | null
    wlogs_raid_progress?: string | null
    wow_class: {
        id: string
        name: string
        color: string
    } | null
    wow_spec: {
        id: string
        name: string
        role: string
    } | null
    approval_rate?: number
}

export async function getCandidates(
    status?: CandidateStatus
): Promise<CandidateWithDetails[]> {
    const supabase = await createClient()

    let query = supabase
        .from('candidates')
        .select(`
      *,
      wow_class:wow_classes(id, name, color),
      wow_spec:wow_specs(id, name, role)
    `)
        .order('created_at', { ascending: false })

    if (status) {
        query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
        console.error('Error fetching candidates:', error)
        return []
    }

    // Récupérer les votes pour calculer le taux d'approbation
    const candidateIds = data.map(c => c.id)
    const { data: votesData } = await supabase
        .from('votes')
        .select('candidate_id, vote')
        .in('candidate_id', candidateIds)

    const candidatesWithApproval = data.map(candidate => {
        const candidateVotes = votesData?.filter(v => v.candidate_id === candidate.id) || []
        const yes = candidateVotes.filter(v => v.vote === 'yes').length
        const total = candidateVotes.length
        const approval_rate = total > 0 ? Math.round((yes / total) * 100) : 0

        return {
            ...candidate,
            approval_rate
        }
    })

    return candidatesWithApproval as CandidateWithDetails[]
}

export async function getCandidateStats(): Promise<{
    total: number
    pending: number
    accepted: number
    rejected: number
    waitlist: number
}> {
    const supabase = await createClient()

    const { count: total } = await supabase
        .from('candidates')
        .select('*', { count: 'exact', head: true })

    const { count: pending } = await supabase
        .from('candidates')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

    const { count: accepted } = await supabase
        .from('candidates')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'accepted')

    const { count: rejected } = await supabase
        .from('candidates')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'rejected')

    const { count: waitlist } = await supabase
        .from('candidates')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'waitlist')

    return {
        total: total || 0,
        pending: pending || 0,
        accepted: accepted || 0,
        rejected: rejected || 0,
        waitlist: waitlist || 0,
    }
}
