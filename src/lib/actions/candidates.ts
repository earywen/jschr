'use server'

import { createClient } from '@/lib/supabase/server'
import { applicationSchema, type ApplicationFormData } from '@/lib/validations/application'
import { notifyNewCandidate } from '@/lib/discord/notifications'
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
    const { data: candidate, error: insertError } = await supabase
        .from('candidates')
        .insert({
            name: parsed.data.characterName,
            battle_tag: parsed.data.battleTag || null,
            class_id: wowClass.id,
            spec_id: wowSpec.id,
            warcraftlogs_link: parsed.data.warcraftlogsLink || null,
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
            error: 'Erreur lors de la soumission. Veuillez réessayer.',
        }
    }

    // Send Discord webhook notification
    await notifyNewCandidate(
        parsed.data.characterName,
        getClassNameFromId(parsed.data.classId),
        getSpecNameFromId(parsed.data.specId),
        parsed.data.motivation
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
        mage: 'Mage',
        warlock: 'Warlock',
        druid: 'Druid',
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
