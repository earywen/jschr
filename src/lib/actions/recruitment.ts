'use server'

import { createClient } from '@/lib/supabase/server'
import { WOW_CLASSES, WOW_SPECS, WowSpec } from '@/lib/data/wow-classes'

export type RecruitmentNeed = {
    specId: string
    priority: 'high' | 'medium' | 'low' | 'closed'
    updatedAt: string
    spec: WowSpec
    class: { name: string; color: string; icon: string }
}

export async function getRecruitmentNeeds() {
    const supabase = await createClient()

    // Join with wow_specs and wow_classes to get names and colors
    const { data, error } = await supabase
        .from('recruitment_needs')
        .select(`
            spec_id,
            priority,
            updated_at,
            spec:wow_specs!inner (
                name,
                role,
                class:wow_classes!inner (
                    name,
                    color
                )
            )
        `)
        .neq('priority', 'closed')

    // If table doesn't exist or empty, return empty
    if (error) {
        console.error('Error fetching recruitment needs:', error)
        return []
    }

    if (!data) return []

    // Enrich with static data from wow-classes.ts for icons
    const enriched = data.map(item => {
        // We have the spec name from DB (e.g. "Arms") and Class Name (e.g. "Warrior")
        // We need to find the matching static spec to get the icon
        const specName = item.spec.name
        const className = item.spec.class.name

        // Find match in our static data
        // Note: Our static data has normalized names, so we try to find by name match
        const staticSpec = WOW_SPECS.find(s =>
            s.name === specName &&
            WOW_CLASSES.find(c => c.id === s.classId)?.name === className
        )

        // Fallback if not found (should rarely happen if data is synced)
        // Use a default icon or generic class icon if possible
        const icon = staticSpec?.icon || 'inv_misc_questionmark'

        return {
            specId: item.spec_id,
            priority: item.priority,
            updatedAt: item.updated_at,
            spec: {
                id: staticSpec?.id || item.spec_id, // Use static slug ID if found, else UUID
                classId: staticSpec?.classId || 'unknown',
                name: specName,
                nameFr: staticSpec?.nameFr || specName, // Fallback
                role: item.spec.role as "tank" | "healer" | "dps",
                icon: icon
            },
            class: {
                name: className,
                color: item.spec.class.color,
                icon: WOW_CLASSES.find(c => c.name === className)?.icon || 'inv_misc_questionmark'
            }
        }
    }).filter((item): item is RecruitmentNeed => item !== null)

    // Sort by priority (High > Medium > Low) then by Class Name
    return enriched.sort((a, b) => {
        const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2, closed: 3 }
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[a.priority] - priorityOrder[b.priority]
        }
        return a.class.name.localeCompare(b.class.name)
    })
}
