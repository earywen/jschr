'use server'

import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/auth/role'
import { Database } from '@/types/database.types'
import { revalidatePath } from 'next/cache'

type VoteType = Database['public']['Enums']['vote_type']

export interface CastVoteResult {
    success: boolean
    error?: string
}

export async function castVote(
    candidateId: string,
    voteType: VoteType
): Promise<CastVoteResult> {
    const user = await getUserRole()

    // Must be at least a member to vote
    if (!user || user.role === 'pending') {
        return {
            success: false,
            error: 'Vous devez être membre pour voter.',
        }
    }

    const supabase = await createClient()

    // Check if user already voted
    const { data: existingVote } = await supabase
        .from('votes')
        .select('id')
        .eq('candidate_id', candidateId)
        .eq('voter_id', user.id)
        .single()

    if (existingVote) {
        // Update existing vote
        const { error } = await supabase
            .from('votes')
            .update({ vote: voteType })
            .eq('id', existingVote.id)

        if (error) {
            console.error('Vote update error:', error)
            return { success: false, error: 'Erreur lors de la mise à jour du vote.' }
        }
    } else {
        // Insert new vote
        const { error } = await supabase
            .from('votes')
            .insert({
                candidate_id: candidateId,
                voter_id: user.id,
                vote: voteType,
            })

        if (error) {
            console.error('Vote insert error:', error)
            return { success: false, error: 'Erreur lors de l\'enregistrement du vote.' }
        }
    }

    revalidatePath(`/dashboard/candidates/${candidateId}`)

    return { success: true }
}

export async function getMyVote(
    candidateId: string
): Promise<VoteType | null> {
    const user = await getUserRole()
    if (!user) return null

    const supabase = await createClient()

    const { data } = await supabase
        .from('votes')
        .select('vote')
        .eq('candidate_id', candidateId)
        .eq('voter_id', user.id)
        .single()

    return data?.vote || null
}

export interface VoteSynthesis {
    total: number
    yes: number
    no: number
    neutral: number
    approvalRate: number
}

export async function getVoteSynthesis(
    candidateId: string
): Promise<VoteSynthesis> {
    const supabase = await createClient()

    const { data } = await supabase
        .from('votes')
        .select('vote')
        .eq('candidate_id', candidateId)

    const votes = data || []
    const yes = votes.filter(v => v.vote === 'yes').length
    const no = votes.filter(v => v.vote === 'no').length
    const neutral = votes.filter(v => v.vote === 'neutral').length
    const total = votes.length
    const approvalRate = total > 0 ? Math.round((yes / total) * 100) : 0

    return { total, yes, no, neutral, approvalRate }
}
