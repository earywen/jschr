// Complete WoW Retail Classes and Specs data
// Updated with all modern classes including Death Knight, Monk, Demon Hunter, Evoker

export interface WowClass {
    id: string
    name: string
    nameFr: string
    color: string // Hex color
    blizzardId: number // Blizzard API class ID
}

export interface WowSpec {
    id: string
    classId: string
    name: string
    nameFr: string
    role: 'tank' | 'healer' | 'dps'
}

export const WOW_CLASSES: WowClass[] = [
    { id: 'warrior', name: 'Warrior', nameFr: 'Guerrier', color: '#C79C6E', blizzardId: 1 },
    { id: 'paladin', name: 'Paladin', nameFr: 'Paladin', color: '#F58CBA', blizzardId: 2 },
    { id: 'hunter', name: 'Hunter', nameFr: 'Chasseur', color: '#ABD473', blizzardId: 3 },
    { id: 'rogue', name: 'Rogue', nameFr: 'Voleur', color: '#FFF569', blizzardId: 4 },
    { id: 'priest', name: 'Priest', nameFr: 'Prêtre', color: '#FFFFFF', blizzardId: 5 },
    { id: 'death-knight', name: 'Death Knight', nameFr: 'Chevalier de la mort', color: '#C41F3B', blizzardId: 6 },
    { id: 'shaman', name: 'Shaman', nameFr: 'Chaman', color: '#0070DE', blizzardId: 7 },
    { id: 'mage', name: 'Mage', nameFr: 'Mage', color: '#40C7EB', blizzardId: 8 },
    { id: 'warlock', name: 'Warlock', nameFr: 'Démoniste', color: '#8787ED', blizzardId: 9 },
    { id: 'monk', name: 'Monk', nameFr: 'Moine', color: '#00FF96', blizzardId: 10 },
    { id: 'druid', name: 'Druid', nameFr: 'Druide', color: '#FF7D0A', blizzardId: 11 },
    { id: 'demon-hunter', name: 'Demon Hunter', nameFr: 'Chasseur de démons', color: '#A330C9', blizzardId: 12 },
    { id: 'evoker', name: 'Evoker', nameFr: 'Évocateur', color: '#33937F', blizzardId: 13 },
]

export const WOW_SPECS: WowSpec[] = [
    // Warrior
    { id: 'warrior-arms', classId: 'warrior', name: 'Arms', nameFr: 'Armes', role: 'dps' },
    { id: 'warrior-fury', classId: 'warrior', name: 'Fury', nameFr: 'Fureur', role: 'dps' },
    { id: 'warrior-protection', classId: 'warrior', name: 'Protection', nameFr: 'Protection', role: 'tank' },

    // Paladin
    { id: 'paladin-holy', classId: 'paladin', name: 'Holy', nameFr: 'Sacré', role: 'healer' },
    { id: 'paladin-protection', classId: 'paladin', name: 'Protection', nameFr: 'Protection', role: 'tank' },
    { id: 'paladin-retribution', classId: 'paladin', name: 'Retribution', nameFr: 'Vindicte', role: 'dps' },

    // Hunter
    { id: 'hunter-beastmastery', classId: 'hunter', name: 'Beast Mastery', nameFr: 'Maîtrise des bêtes', role: 'dps' },
    { id: 'hunter-marksmanship', classId: 'hunter', name: 'Marksmanship', nameFr: 'Précision', role: 'dps' },
    { id: 'hunter-survival', classId: 'hunter', name: 'Survival', nameFr: 'Survie', role: 'dps' },

    // Rogue
    { id: 'rogue-assassination', classId: 'rogue', name: 'Assassination', nameFr: 'Assassinat', role: 'dps' },
    { id: 'rogue-outlaw', classId: 'rogue', name: 'Outlaw', nameFr: 'Hors-la-loi', role: 'dps' },
    { id: 'rogue-subtlety', classId: 'rogue', name: 'Subtlety', nameFr: 'Finesse', role: 'dps' },

    // Priest
    { id: 'priest-discipline', classId: 'priest', name: 'Discipline', nameFr: 'Discipline', role: 'healer' },
    { id: 'priest-holy', classId: 'priest', name: 'Holy', nameFr: 'Sacré', role: 'healer' },
    { id: 'priest-shadow', classId: 'priest', name: 'Shadow', nameFr: 'Ombre', role: 'dps' },

    // Death Knight
    { id: 'deathknight-blood', classId: 'death-knight', name: 'Blood', nameFr: 'Sang', role: 'tank' },
    { id: 'deathknight-frost', classId: 'death-knight', name: 'Frost', nameFr: 'Givre', role: 'dps' },
    { id: 'deathknight-unholy', classId: 'death-knight', name: 'Unholy', nameFr: 'Impie', role: 'dps' },

    // Shaman
    { id: 'shaman-elemental', classId: 'shaman', name: 'Elemental', nameFr: 'Élémentaire', role: 'dps' },
    { id: 'shaman-enhancement', classId: 'shaman', name: 'Enhancement', nameFr: 'Amélioration', role: 'dps' },
    { id: 'shaman-restoration', classId: 'shaman', name: 'Restoration', nameFr: 'Restauration', role: 'healer' },

    // Mage
    { id: 'mage-arcane', classId: 'mage', name: 'Arcane', nameFr: 'Arcanes', role: 'dps' },
    { id: 'mage-fire', classId: 'mage', name: 'Fire', nameFr: 'Feu', role: 'dps' },
    { id: 'mage-frost', classId: 'mage', name: 'Frost', nameFr: 'Givre', role: 'dps' },

    // Warlock
    { id: 'warlock-affliction', classId: 'warlock', name: 'Affliction', nameFr: 'Affliction', role: 'dps' },
    { id: 'warlock-demonology', classId: 'warlock', name: 'Demonology', nameFr: 'Démonologie', role: 'dps' },
    { id: 'warlock-destruction', classId: 'warlock', name: 'Destruction', nameFr: 'Destruction', role: 'dps' },

    // Monk
    { id: 'monk-brewmaster', classId: 'monk', name: 'Brewmaster', nameFr: 'Maître brasseur', role: 'tank' },
    { id: 'monk-mistweaver', classId: 'monk', name: 'Mistweaver', nameFr: 'Tisse-brume', role: 'healer' },
    { id: 'monk-windwalker', classId: 'monk', name: 'Windwalker', nameFr: 'Marche-vent', role: 'dps' },

    // Druid
    { id: 'druid-balance', classId: 'druid', name: 'Balance', nameFr: 'Équilibre', role: 'dps' },
    { id: 'druid-feral', classId: 'druid', name: 'Feral', nameFr: 'Féral', role: 'dps' },
    { id: 'druid-guardian', classId: 'druid', name: 'Guardian', nameFr: 'Gardien', role: 'tank' },
    { id: 'druid-restoration', classId: 'druid', name: 'Restoration', nameFr: 'Restauration', role: 'healer' },

    // Demon Hunter
    { id: 'demonhunter-havoc', classId: 'demon-hunter', name: 'Havoc', nameFr: 'Dévastation', role: 'dps' },
    { id: 'demonhunter-vengeance', classId: 'demon-hunter', name: 'Vengeance', nameFr: 'Vengeance', role: 'tank' },

    // Evoker
    { id: 'evoker-devastation', classId: 'evoker', name: 'Devastation', nameFr: 'Dévastation', role: 'dps' },
    { id: 'evoker-preservation', classId: 'evoker', name: 'Preservation', nameFr: 'Préservation', role: 'healer' },
    { id: 'evoker-augmentation', classId: 'evoker', name: 'Augmentation', nameFr: 'Augmentation', role: 'dps' },
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
