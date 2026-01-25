'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { applicationSchema, type ApplicationFormData } from '@/lib/validations/application'
import { notifyNewCandidate } from '@/lib/discord/notifications'
import { fetchWarcraftLogsData, updateCandidateWlogsData } from '@/lib/api/warcraftlogs'
import { getClassNameFromId, getSpecNameFromId } from '@/lib/data/wow-classes'
import { revalidatePath } from 'next/cache'

export interface SubmitApplicationResult {
    success: boolean
    error?: string
    candidateId?: string
}

export async function submitApplication(
    data: ApplicationFormData
): Promise<SubmitApplicationResult> {
    // Validate input
    const parsed = applicationSchema.safeParse(data)
    if (!parsed.success) {
        return {
            success: false,
            error: 'Données invalides: ' + parsed.error.issues.map(i => i.message).join(', '),
        }
    }

    const supabase = await createClient()

    // Get current user (optional - candidates can be anonymous)
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Look up the class UUID from the database using the name
    const { data: wowClass, error: classError } = await supabase
        .from('wow_classes')
        .select('id')
        .ilike('name', getClassNameFromId(parsed.data.classId))
        .single()

    if (classError || !wowClass) {
        return {
            success: false,
            error: 'Classe non trouvée',
        }
    }

    // Look up the spec UUID
    const specName = getSpecNameFromId(parsed.data.specId)
    const { data: wowSpec, error: specError } = await supabase
        .from('wow_specs')
        .select('id')
        .eq('class_id', wowClass.id)
        .ilike('name', specName)
        .single()

    if (specError || !wowSpec) {
        return {
            success: false,
            error: 'Spécialisation non trouvée',
        }
    }

    // Insert candidate
    // Use admin client to bypass RLS strictness during submission
    const adminSupabase = createAdminClient()
    const { data: candidate, error: insertError } = await adminSupabase
        .from('candidates')
        .insert({
            name: parsed.data.characterName,
            battle_tag: parsed.data.battleTag || null,
            discord_id: parsed.data.discordId || null,
            class_id: wowClass.id,
            spec_id: wowSpec.id,
            warcraftlogs_link: parsed.data.warcraftlogsLink || null,
            screenshot_url: parsed.data.screenshotUrl || null,
            avatar_url: parsed.data.avatarUrl || null,
            raid_experience: parsed.data.raidExperience || null,
            about_me: parsed.data.aboutMe || null,
            why_jsc: parsed.data.whyJSC || null,
            motivation: parsed.data.motivation,
            user_id: user?.id || null,
            status: 'pending',
        })
        .select('id')
        .single()

    if (insertError) {
        console.error('Insert error:', insertError)
        return {
            success: false,
            error: `Erreur lors de la soumission: ${insertError.message || JSON.stringify(insertError)}`,
        }
    }

    // Auto-fetch WarcraftLogs data if link provided
    let wlogsStats: { ilvl?: number | null, score?: number | null, progress?: string | null, bestPerfAvg?: number | null } = {}

    if (parsed.data.warcraftlogsLink) {
        try {
            const wlogsData = await fetchWarcraftLogsData(parsed.data.warcraftlogsLink)
            wlogsStats = {
                ilvl: wlogsData.ilvl,
                score: wlogsData.mythicPlusScore,
                progress: wlogsData.raidProgress,
                bestPerfAvg: wlogsData.bestPerfAvg
            }

            if (wlogsData.bestPerfAvg !== null || wlogsData.mythicPlusScore !== null) {
                await updateCandidateWlogsData(
                    candidate.id,
                    wlogsData.bestPerfAvg,
                    wlogsData.color,
                    wlogsData.mythicPlusScore,
                    wlogsData.ilvl ?? null,
                    wlogsData.raidProgress ?? null
                )
            }
        } catch (e) {
            // Silently fail - WarcraftLogs fetch is not critical
            console.error('WarcraftLogs auto-fetch failed:', e)
        }
    }

    // Send Discord webhook notification and store message ID for vote sync
    const discordMessageId = await notifyNewCandidate(
        candidate.id,
        parsed.data.characterName,
        getClassNameFromId(parsed.data.classId),
        getSpecNameFromId(parsed.data.specId),
        parsed.data.raidExperience,
        parsed.data.aboutMe,
        parsed.data.whyJSC,
        parsed.data.motivation,
        {
            ilvl: wlogsStats.ilvl,
            score: wlogsStats.score,
            progress: wlogsStats.progress,
            bestPerfAvg: wlogsStats.bestPerfAvg,
            wlogsLink: parsed.data.warcraftlogsLink,
            screenshotUrl: parsed.data.screenshotUrl,
            avatarUrl: parsed.data.avatarUrl
        }
    )

    // Store Discord message ID for future vote sync
    if (discordMessageId) {
        await adminSupabase
            .from('candidates')
            .update({ discord_message_id: discordMessageId })
            .eq('id', candidate.id)
    }

    revalidatePath('/dashboard/candidates')

    return {
        success: true,
        candidateId: candidate.id,
    }
}


export async function deleteCandidate(candidateId: string): Promise<SubmitApplicationResult> {
    const supabase = await createClient()

    // 1. Check authentication and role
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Non authentifié' }
    }

    // Check role using regular client (RLS policies now allow this)
    const { data: member } = await supabase
        .from('members')
        .select('role')
        .eq('id', user.id)
        .single()

    if (member?.role !== 'gm') {
        return { success: false, error: 'Action non autorisée (GM uniquement)' }
    }

    // 2. Delete candidate (RLS policy handles authorization)
    const { error } = await supabase
        .from('candidates')
        .delete()
        .eq('id', candidateId)

    if (error) {
        console.error('Delete error:', error)
        return { success: false, error: 'Erreur lors de la suppression' }
    }

    revalidatePath('/dashboard/candidates')
    return { success: true }
}

export async function deleteCandidates(candidateIds: string[]): Promise<SubmitApplicationResult> {
    const supabase = await createClient()

    // 1. Check authentication and role
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Non authentifié' }
    }

    // Check role using regular client (RLS policies now allow this)
    const { data: member } = await supabase
        .from('members')
        .select('role')
        .eq('id', user.id)
        .single()

    if (member?.role !== 'gm') {
        return { success: false, error: 'Action non autorisée (GM uniquement)' }
    }

    // 2. Delete candidates (RLS policy handles authorization)
    const { error } = await supabase
        .from('candidates')
        .delete()
        .in('id', candidateIds)

    if (error) {
        console.error('Delete error:', error)
        return { success: false, error: 'Erreur lors de la suppression multiple' }
    }

    return { success: true }
}

export async function createManualCandidate(
    data: import('@/lib/validations/manual-candidate').ManualCandidateFormData
): Promise<SubmitApplicationResult> {
    const { manualCandidateSchema } = await import('@/lib/validations/manual-candidate')

    // Validate input
    const parsed = manualCandidateSchema.safeParse(data)
    if (!parsed.success) {
        return {
            success: false,
            error: 'Données invalides: ' + parsed.error.issues.map(i => i.message).join(', '),
        }
    }

    const supabase = await createClient()

    // Check authentication and role
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Non authentifié' }
    }

    const { data: member } = await supabase
        .from('members')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!member || (member.role !== 'officer' && member.role !== 'gm')) {
        return { success: false, error: 'Action non autorisée (Officers/GM uniquement)' }
    }

    // Look up the class UUID from the database
    const { data: wowClass, error: classError } = await supabase
        .from('wow_classes')
        .select('id')
        .eq('id', parsed.data.classId)
        .single()

    if (classError || !wowClass) {
        return {
            success: false,
            error: 'Classe non trouvée',
        }
    }

    // Look up the spec UUID
    const { data: wowSpec, error: specError } = await supabase
        .from('wow_specs')
        .select('id')
        .eq('id', parsed.data.specId)
        .single()

    if (specError || !wowSpec) {
        return {
            success: false,
            error: 'Spécialisation non trouvée',
        }
    }

    // Auto-fetch avatar from Blizzard API if WarcraftLogs link provided
    let avatarUrl = parsed.data.avatarUrl || null
    if (parsed.data.warcraftlogsLink && !avatarUrl) {
        try {
            const { fetchAvatarFromWarcraftLogsUrl } = await import('@/lib/api/blizzard')
            const fetchedAvatar = await fetchAvatarFromWarcraftLogsUrl(parsed.data.warcraftlogsLink)
            if (fetchedAvatar) {
                avatarUrl = fetchedAvatar
            }
        } catch (e) {
            // Silently fail - Avatar fetch is not critical
            console.error('Blizzard avatar auto-fetch failed:', e)
        }
    }

    // Insert candidate using admin client to bypass RLS
    const adminSupabase = createAdminClient()
    const { data: candidate, error: insertError } = await adminSupabase
        .from('candidates')
        .insert({
            name: parsed.data.name,
            battle_tag: parsed.data.battleTag || null,
            discord_id: parsed.data.discordId || null,
            class_id: wowClass.id,
            spec_id: wowSpec.id,
            warcraftlogs_link: parsed.data.warcraftlogsLink || null,
            screenshot_url: parsed.data.screenshotUrl || null,
            avatar_url: avatarUrl,
            raid_experience: parsed.data.raidExperience || null,
            about_me: parsed.data.aboutMe || null,
            why_jsc: parsed.data.whyJSC || null,
            motivation: parsed.data.motivation,
            user_id: null, // Manual candidates are not linked to a user
            status: parsed.data.status || 'pending',
        })
        .select('id')
        .single()

    if (insertError) {
        console.error('Insert error:', insertError)
        return {
            success: false,
            error: `Erreur lors de la création: ${insertError.message || JSON.stringify(insertError)}`,
        }
    }

    // Auto-fetch WarcraftLogs data if link provided
    if (parsed.data.warcraftlogsLink) {
        try {
            const wlogsData = await fetchWarcraftLogsData(parsed.data.warcraftlogsLink)

            if (wlogsData.bestPerfAvg !== null || wlogsData.mythicPlusScore !== null) {
                await updateCandidateWlogsData(
                    candidate.id,
                    wlogsData.bestPerfAvg,
                    wlogsData.color,
                    wlogsData.mythicPlusScore,
                    wlogsData.ilvl ?? null,
                    wlogsData.raidProgress ?? null
                )
            }
        } catch (e) {
            // Silently fail - WarcraftLogs fetch is not critical
            console.error('WarcraftLogs auto-fetch failed:', e)
        }
    }

    // NOTE: We do NOT send Discord notification for manual candidates
    // as these are pre-existing applications

    revalidatePath('/dashboard/candidates')

    return {
        success: true,
        candidateId: candidate.id,
    }
}

export async function resendCandidateNotification(
    candidateId: string
): Promise<SubmitApplicationResult> {
    const supabase = await createClient()

    // Check authentication and role
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Non authentifié' }
    }

    const { data: member } = await supabase
        .from('members')
        .select('role')
        .eq('id', user.id)
        .single()

    if (member?.role !== 'gm') {
        return { success: false, error: 'Action non autorisée (GM uniquement)' }
    }

    // Fetch candidate with all details
    const { data: candidate, error: candidateError } = await supabase
        .from('candidates')
        .select(`
            *,
            wow_class:wow_classes(id, name, color),
            wow_spec:wow_specs(id, name, role)
        `)
        .eq('id', candidateId)
        .single()

    if (candidateError || !candidate) {
        return {
            success: false,
            error: 'Candidature non trouvée',
        }
    }

    // Send Discord notification
    const discordMessageId = await notifyNewCandidate(
        candidate.id,
        candidate.name,
        candidate.wow_class?.name || 'Inconnu',
        candidate.wow_spec?.name || 'Inconnu',
        candidate.raid_experience || '',
        candidate.about_me || '',
        candidate.why_jsc || '',
        candidate.motivation || '',
        {
            ilvl: (candidate as any).wlogs_ilvl,
            score: (candidate as any).wlogs_mythic_plus_score,
            progress: (candidate as any).wlogs_raid_progress,
            bestPerfAvg: candidate.wlogs_score,
            wlogsLink: candidate.warcraftlogs_link,
            screenshotUrl: candidate.screenshot_url,
            avatarUrl: candidate.avatar_url,
        }
    )

    if (!discordMessageId) {
        return {
            success: false,
            error: 'Erreur lors de l\'envoi de la notification Discord',
        }
    }

    // Store Discord message ID for future vote sync
    const adminSupabase = createAdminClient()
    await adminSupabase
        .from('candidates')
        .update({ discord_message_id: discordMessageId })
        .eq('id', candidate.id)

    return {
        success: true,
        candidateId: candidate.id,
    }
}


export async function updateCandidatesStatus(
    candidateIds: string[],
    newStatus: string
): Promise<SubmitApplicationResult> {
    const supabase = await createClient()

    // 1. Check authentication and role
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Non authentifié' }
    }

    const { data: member } = await supabase
        .from('members')
        .select('role')
        .eq('id', user.id)
        .single()

    if (member?.role !== 'gm') {
        return { success: false, error: 'Action non autorisée (GM uniquement)' }
    }

    // 2. Validate status
    const validStatuses = ['pending', 'accepted', 'rejected', 'waitlist']
    if (!validStatuses.includes(newStatus)) {
        return { success: false, error: 'Statut invalide' }
    }

    // 3. Update candidates
    const { error } = await supabase
        .from('candidates')
        .update({ status: newStatus as 'pending' | 'accepted' | 'rejected' | 'waitlist' })
        .in('id', candidateIds)

    if (error) {
        console.error('Update status error:', error)
        return { success: false, error: 'Erreur lors de la mise à jour des statuts' }
    }

    revalidatePath('/dashboard/candidates')
    return { success: true }
}
