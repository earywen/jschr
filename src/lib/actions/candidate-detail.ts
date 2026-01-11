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

    return data as CandidateWithDetails
}
