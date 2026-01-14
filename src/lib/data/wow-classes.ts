// Complete WoW Retail Classes and Specs data
// Updated with all modern classes including Death Knight, Monk, Demon Hunter, Evoker

export interface WowClass {
    id: string
    name: string
    nameFr: string
    color: string // Hex color
    blizzardId: number // Blizzard API class ID
    icon: string
}

export interface WowSpec {
    id: string
    classId: string
    name: string
    nameFr: string
    role: 'tank' | 'healer' | 'dps'
    icon: string
}

export const WOW_CLASSES: WowClass[] = [
    { id: 'warrior', name: 'Warrior', nameFr: 'Guerrier', color: '#C79C6E', blizzardId: 1, icon: 'classicon_warrior' },
    { id: 'paladin', name: 'Paladin', nameFr: 'Paladin', color: '#F58CBA', blizzardId: 2, icon: 'classicon_paladin' },
    { id: 'hunter', name: 'Hunter', nameFr: 'Chasseur', color: '#ABD473', blizzardId: 3, icon: 'classicon_hunter' },
    { id: 'rogue', name: 'Rogue', nameFr: 'Voleur', color: '#FFF569', blizzardId: 4, icon: 'classicon_rogue' },
    { id: 'priest', name: 'Priest', nameFr: 'Prêtre', color: '#FFFFFF', blizzardId: 5, icon: 'classicon_priest' },
    { id: 'death-knight', name: 'Death Knight', nameFr: 'Chevalier de la mort', color: '#C41F3B', blizzardId: 6, icon: 'spell_deathknight_classicon' },
    { id: 'shaman', name: 'Shaman', nameFr: 'Chaman', color: '#0070DE', blizzardId: 7, icon: 'classicon_shaman' },
    { id: 'mage', name: 'Mage', nameFr: 'Mage', color: '#40C7EB', blizzardId: 8, icon: 'classicon_mage' },
    { id: 'warlock', name: 'Warlock', nameFr: 'Démoniste', color: '#8787ED', blizzardId: 9, icon: 'classicon_warlock' },
    { id: 'monk', name: 'Monk', nameFr: 'Moine', color: '#00FF96', blizzardId: 10, icon: 'classicon_monk' },
    { id: 'druid', name: 'Druid', nameFr: 'Druide', color: '#FF7D0A', blizzardId: 11, icon: 'classicon_druid' },
    { id: 'demon-hunter', name: 'Demon Hunter', nameFr: 'Chasseur de démons', color: '#A330C9', blizzardId: 12, icon: 'achievement_boss_illidan' },
    { id: 'evoker', name: 'Evoker', nameFr: 'Évocateur', color: '#33937F', blizzardId: 13, icon: 'classicon_evoker' },
]

export const WOW_SPECS: WowSpec[] = [
    // Warrior
    { id: 'warrior-arms', classId: 'warrior', name: 'Arms', nameFr: 'Armes', role: 'dps', icon: 'ability_warrior_savageblow' },
    { id: 'warrior-fury', classId: 'warrior', name: 'Fury', nameFr: 'Fureur', role: 'dps', icon: 'ability_warrior_innerrage' },
    { id: 'warrior-protection', classId: 'warrior', name: 'Protection', nameFr: 'Protection', role: 'tank', icon: 'ability_warrior_defensivestance' },

    // Paladin
    { id: 'paladin-holy', classId: 'paladin', name: 'Holy', nameFr: 'Sacré', role: 'healer', icon: 'spell_holy_holybolt' },
    { id: 'paladin-protection', classId: 'paladin', name: 'Protection', nameFr: 'Protection', role: 'tank', icon: 'ability_paladin_protection' },
    { id: 'paladin-retribution', classId: 'paladin', name: 'Retribution', nameFr: 'Vindicte', role: 'dps', icon: 'spell_holy_auraoflight' },

    // Hunter
    { id: 'hunter-beastmastery', classId: 'hunter', name: 'Beast Mastery', nameFr: 'Maîtrise des bêtes', role: 'dps', icon: 'ability_hunter_bestialdiscipline' },
    { id: 'hunter-marksmanship', classId: 'hunter', name: 'Marksmanship', nameFr: 'Précision', role: 'dps', icon: 'ability_hunter_focusedaim' },
    { id: 'hunter-survival', classId: 'hunter', name: 'Survival', nameFr: 'Survie', role: 'dps', icon: 'ability_hunter_camouflage' },

    // Rogue
    { id: 'rogue-assassination', classId: 'rogue', name: 'Assassination', nameFr: 'Assassinat', role: 'dps', icon: 'ability_rogue_deadlybrew' },
    { id: 'rogue-outlaw', classId: 'rogue', name: 'Outlaw', nameFr: 'Hors-la-loi', role: 'dps', icon: 'ability_rogue_waylay' },
    { id: 'rogue-subtlety', classId: 'rogue', name: 'Subtlety', nameFr: 'Finesse', role: 'dps', icon: 'ability_stealth' },

    // Priest
    { id: 'priest-discipline', classId: 'priest', name: 'Discipline', nameFr: 'Discipline', role: 'healer', icon: 'spell_holy_powerwordshield' },
    { id: 'priest-holy', classId: 'priest', name: 'Holy', nameFr: 'Sacré', role: 'healer', icon: 'spell_holy_guardianspirit' },
    { id: 'priest-shadow', classId: 'priest', name: 'Shadow', nameFr: 'Ombre', role: 'dps', icon: 'spell_shadow_shadowwordpain' },

    // Death Knight
    { id: 'deathknight-blood', classId: 'death-knight', name: 'Blood', nameFr: 'Sang', role: 'tank', icon: 'spell_deathknight_bloodpresence' },
    { id: 'deathknight-frost', classId: 'death-knight', name: 'Frost', nameFr: 'Givre', role: 'dps', icon: 'spell_deathknight_frostpresence' },
    { id: 'deathknight-unholy', classId: 'death-knight', name: 'Unholy', nameFr: 'Impie', role: 'dps', icon: 'spell_deathknight_unholypresence' },

    // Shaman
    { id: 'shaman-elemental', classId: 'shaman', name: 'Elemental', nameFr: 'Élémentaire', role: 'dps', icon: 'spell_nature_lightning' },
    { id: 'shaman-enhancement', classId: 'shaman', name: 'Enhancement', nameFr: 'Amélioration', role: 'dps', icon: 'spell_shaman_improvedstormstrike' },
    { id: 'shaman-restoration', classId: 'shaman', name: 'Restoration', nameFr: 'Restauration', role: 'healer', icon: 'spell_nature_magicimmunity' },

    // Mage
    { id: 'mage-arcane', classId: 'mage', name: 'Arcane', nameFr: 'Arcanes', role: 'dps', icon: 'spell_holy_magicalsentry' },
    { id: 'mage-fire', classId: 'mage', name: 'Fire', nameFr: 'Feu', role: 'dps', icon: 'spell_fire_firebolt02' },
    { id: 'mage-frost', classId: 'mage', name: 'Frost', nameFr: 'Givre', role: 'dps', icon: 'spell_frost_frostbolt02' },

    // Warlock
    { id: 'warlock-affliction', classId: 'warlock', name: 'Affliction', nameFr: 'Affliction', role: 'dps', icon: 'spell_shadow_deathcoil' },
    { id: 'warlock-demonology', classId: 'warlock', name: 'Demonology', nameFr: 'Démonologie', role: 'dps', icon: 'spell_shadow_metamorphosis' },
    { id: 'warlock-destruction', classId: 'warlock', name: 'Destruction', nameFr: 'Destruction', role: 'dps', icon: 'spell_shadow_rainoffire' },

    // Monk
    { id: 'monk-brewmaster', classId: 'monk', name: 'Brewmaster', nameFr: 'Maître brasseur', role: 'tank', icon: 'spell_monk_brewmaster' },
    { id: 'monk-mistweaver', classId: 'monk', name: 'Mistweaver', nameFr: 'Tisse-brume', role: 'healer', icon: 'spell_monk_mistweaver' },
    { id: 'monk-windwalker', classId: 'monk', name: 'Windwalker', nameFr: 'Marche-vent', role: 'dps', icon: 'spell_monk_windwalker_spec' },

    // Druid
    { id: 'druid-balance', classId: 'druid', name: 'Balance', nameFr: 'Équilibre', role: 'dps', icon: 'spell_nature_starfall' },
    { id: 'druid-feral', classId: 'druid', name: 'Feral', nameFr: 'Féral', role: 'dps', icon: 'ability_druid_catform' },
    { id: 'druid-guardian', classId: 'druid', name: 'Guardian', nameFr: 'Gardien', role: 'tank', icon: 'ability_racial_bearform' },
    { id: 'druid-restoration', classId: 'druid', name: 'Restoration', nameFr: 'Restauration', role: 'healer', icon: 'spell_nature_healingtouch' },

    // Demon Hunter
    { id: 'demonhunter-havoc', classId: 'demon-hunter', name: 'Havoc', nameFr: 'Dévastation', role: 'dps', icon: 'ability_demonhunter_specdps' },
    { id: 'demonhunter-vengeance', classId: 'demon-hunter', name: 'Vengeance', nameFr: 'Vengeance', role: 'tank', icon: 'ability_demonhunter_spectank' },

    // Evoker
    { id: 'evoker-devastation', classId: 'evoker', name: 'Devastation', nameFr: 'Dévastation', role: 'dps', icon: 'classicon_evoker_devastation' },
    { id: 'evoker-preservation', classId: 'evoker', name: 'Preservation', nameFr: 'Préservation', role: 'healer', icon: 'classicon_evoker_preservation' },
    { id: 'evoker-augmentation', classId: 'evoker', name: 'Augmentation', nameFr: 'Augmentation', role: 'dps', icon: 'classicon_evoker_augmentation' },
]

export function getSpecsByClass(classId: string): WowSpec[] {
    return WOW_SPECS.filter(spec => spec.classId === classId)
}

export function getClassById(classId: string): WowClass | undefined {
    return WOW_CLASSES.find(c => c.id === classId)
}

export function getClassByBlizzardId(blizzardId: number): WowClass | undefined {
    return WOW_CLASSES.find(c => c.blizzardId === blizzardId)
}

// Map French class names from Battle.net API to our class IDs
export function getClassIdFromName(className: string): string | undefined {
    const normalized = className.toLowerCase().trim()

    const nameMap: Record<string, string> = {
        // English
        'warrior': 'warrior',
        'paladin': 'paladin',
        'hunter': 'hunter',
        'rogue': 'rogue',
        'priest': 'priest',
        'death knight': 'death-knight',
        'shaman': 'shaman',
        'mage': 'mage',
        'warlock': 'warlock',
        'monk': 'monk',
        'druid': 'druid',
        'demon hunter': 'demon-hunter',
        'evoker': 'evoker',
        // Common variations
        'deathknight': 'death-knight',
        'demonhunter': 'demon-hunter',
        // French
        'guerrier': 'warrior',
        'chasseur': 'hunter',
        'voleur': 'rogue',
        'prêtre': 'priest',
        'chevalier de la mort': 'death-knight',
        'chaman': 'shaman',
        'démoniste': 'warlock',
        'moine': 'monk',
        'druide': 'druid',
        'chasseur de démons': 'demon-hunter',
        'évocateur': 'evoker',
    }

    return nameMap[normalized]
}

/**
 * Get class English name from our internal ID
 * Used for database lookups and Discord notifications
 */
export function getClassNameFromId(classId: string): string {
    const wowClass = WOW_CLASSES.find(c => c.id === classId)
    return wowClass?.name || classId
}

/**
 * Get spec English name from our internal ID (format: "classId-specName")
 * Used for database lookups and Discord notifications
 */
export function getSpecNameFromId(specId: string): string {
    const spec = WOW_SPECS.find(s => s.id === specId)
    return spec?.name || specId
}
