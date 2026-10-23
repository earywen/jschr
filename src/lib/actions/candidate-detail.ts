'use server'

import { createClient } from '@/lib/supabase/server'
import { CandidateWithDetails } from './candidates-queries'

export async function getCandidateById(
    id: string
): Promise<CandidateWithDetails | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('candidates')
        .select(`
      *,
      wow_class:wow_classes(id, name, color),
      wow_spec:wow_specs(id, name, role)
    `)
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching candidate:', error)
        return null
    }

    // Check if spontaneous
    let is_spontaneous = false
    if (data.spec_id) {
        const { createAdminClient } = await import('@/lib/supabase/server')
        const adminSupabase = createAdminClient()
        const { data: need } = await adminSupabase
            .from('recruitment_needs')
            .select('priority')
            .eq('spec_id', data.spec_id)
            .single()
        is_spontaneous = !need || need.priority === 'closed'
    }

    return {
        ...data,
        is_spontaneous,
    } as CandidateWithDetails
}
