'use server'

import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/auth/role'
import { Database } from '@/types/database.types'
import { revalidatePath } from 'next/cache'

type CandidateStatus = Database['public']['Enums']['candidate_status']

export interface UpdateStatusResult {
    success: boolean
    error?: string
}

export async function updateCandidateStatus(
    candidateId: string,
    newStatus: CandidateStatus
): Promise<UpdateStatusResult> {
    // Check if user is GM
    const user = await getUserRole()
    if (!user || user.role !== 'gm') {
        return {
            success: false,
            error: 'Seul le GM peut modifier le statut des candidatures.',
        }
    }

    const supabase = await createClient()

    const { error } = await supabase
        .from('candidates')
        .update({
            status: newStatus,
            updated_at: new Date().toISOString(),
        })
        .eq('id', candidateId)

    if (error) {
        console.error('Status update error:', error)
        return {
            success: false,
            error: 'Erreur lors de la mise à jour du statut.',
        }
    }

    revalidatePath('/dashboard/candidates')
    revalidatePath(`/dashboard/candidates/${candidateId}`)

    return { success: true }
}
