'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { applicationSchema, type ApplicationFormData } from '@/lib/validations/application'
import { notifyNewCandidate } from '@/lib/discord/notifications'
import { fetchWarcraftLogsData, updateCandidateWlogsData } from '@/lib/api/warcraftlogs'
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

    // Send Discord webhook notification
    await notifyNewCandidate(
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

    revalidatePath('/dashboard/candidates')

    return {
        success: true,
        candidateId: candidate.id,
    }
}

// Helper to extract class name from our static ID
function getClassNameFromId(classId: string): string {
    const mapping: Record<string, string> = {
        warrior: 'Warrior',
        paladin: 'Paladin',
        hunter: 'Hunter',
        rogue: 'Rogue',
        priest: 'Priest',
        'death-knight': 'Death Knight',
        shaman: 'Shaman',
        mage: 'Mage',
        warlock: 'Warlock',
        monk: 'Monk',
        druid: 'Druid',
        'demon-hunter': 'Demon Hunter',
        evoker: 'Evoker',
    }
    return mapping[classId] || classId
}

// Helper to extract spec name from our static ID (format: "classId-specName")
function getSpecNameFromId(specId: string): string {
    const parts = specId.split('-')
    if (parts.length < 2) return specId

    const specName = parts.slice(1).join('-')

    // Map to proper names with spaces
    const mapping: Record<string, string> = {
        arms: 'Arms',
        fury: 'Fury',
        protection: 'Protection',
        holy: 'Holy',
        retribution: 'Retribution',
        beastmastery: 'Beast Mastery',
        marksmanship: 'Marksmanship',
        survival: 'Survival',
        assassination: 'Assassination',
        combat: 'Combat',
        subtlety: 'Subtlety',
        discipline: 'Discipline',
        shadow: 'Shadow',
        arcane: 'Arcane',
        fire: 'Fire',
        frost: 'Frost',
        affliction: 'Affliction',
        demonology: 'Demonology',
        destruction: 'Destruction',
        balance: 'Balance',
        feral: 'Feral',
        guardian: 'Guardian',
        restoration: 'Restoration',
    }

    return mapping[specName] || specName
}



export async function deleteCandidate(candidateId: string): Promise<SubmitApplicationResult> {
    const supabase = await createClient()

    // 1. Check authentication and role
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        console.log('DeleteCandidate: No user found')
        return { success: false, error: 'Non authentifié' }
    }

    // Use admin client to ensure we can read the members table
    // (RLS might prevent reading user roles efficiently if not configured for self-read)
    const adminSupabase = createAdminClient()
    const { data: member } = await adminSupabase
        .from('members')
        .select('role')
        .eq('id', user.id)
        .single()

    if (member?.role !== 'gm') {
        return { success: false, error: 'Action non autorisée (GM uniquement)' }
    }

    // 2. Delete candidate
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

    // Use admin client to ensure we can read the members table
    const adminSupabase = createAdminClient()
    const { data: member } = await adminSupabase
        .from('members')
        .select('role')
        .eq('id', user.id)
        .single()

    if (member?.role !== 'gm') {
        return { success: false, error: 'Action non autorisée (GM uniquement)' }
    }

    // 2. Delete candidates
    const { error } = await supabase
        .from('candidates')
        .delete()
        .in('id', candidateIds)

    if (error) {
        console.error('Delete error:', error)
        return { success: false, error: 'Erreur lors de la suppression multiple' }
    }

    revalidatePath('/dashboard/candidates')
    return { success: true }
}

