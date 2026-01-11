'use server'

import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database.types'

type Candidate = Database['public']['Tables']['candidates']['Row']
type CandidateStatus = Database['public']['Enums']['candidate_status']

export interface CandidateWithDetails extends Candidate {
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

    return data as CandidateWithDetails[]
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
