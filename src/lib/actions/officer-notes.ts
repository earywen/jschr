'use server'

import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/auth/role'
import { revalidatePath } from 'next/cache'

export interface OfficerNote {
    id: string
    content: string
    created_at: string
    author: {
        id: string
        email: string
    } | null
}

export async function getNotesForCandidate(
    candidateId: string
): Promise<OfficerNote[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('officer_notes')
        .select(`
      id,
      content,
      created_at,
      author:members(id, email)
    `)
        .eq('candidate_id', candidateId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching notes:', error)
        return []
    }

    return data as OfficerNote[]
}

export interface AddNoteResult {
    success: boolean
    error?: string
}

export async function addNoteToCandidate(
    candidateId: string,
    content: string
): Promise<AddNoteResult> {
    // Check if user is officer or GM
    const user = await getUserRole()
    if (!user || (user.role !== 'officer' && user.role !== 'gm')) {
        return {
            success: false,
            error: 'Seuls les officiers et GM peuvent ajouter des notes.',
        }
    }

    if (!content.trim()) {
        return {
            success: false,
            error: 'La note ne peut pas être vide.',
        }
    }

    const supabase = await createClient()

    const { error } = await supabase
        .from('officer_notes')
        .insert({
            candidate_id: candidateId,
            author_id: user.id,
            content: content.trim(),
        })

    if (error) {
        console.error('Note insert error:', error)
        return {
            success: false,
            error: 'Erreur lors de l\'ajout de la note.',
        }
    }

    revalidatePath(`/dashboard/candidates/${candidateId}`)

    return { success: true }
}
