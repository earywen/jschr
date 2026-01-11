// Static WoW Classic Classes and Specs data
// Used for dropdown population without API calls

export interface WowClass {
    id: string
    name: string
    color: string // Hex color
}

export interface WowSpec {
    id: string
    classId: string
    name: string
    role: 'tank' | 'healer' | 'dps'
}

export const WOW_CLASSES: WowClass[] = [
    { id: 'warrior', name: 'Warrior', color: '#C79C6E' },
    { id: 'paladin', name: 'Paladin', color: '#F58CBA' },
    { id: 'hunter', name: 'Hunter', color: '#ABD473' },
    { id: 'rogue', name: 'Rogue', color: '#FFF569' },
    { id: 'priest', name: 'Priest', color: '#FFFFFF' },
    { id: 'mage', name: 'Mage', color: '#40C7EB' },
    { id: 'warlock', name: 'Warlock', color: '#8787ED' },
    { id: 'druid', name: 'Druid', color: '#FF7D0A' },
]

export const WOW_SPECS: WowSpec[] = [
    // Warrior
    { id: 'warrior-arms', classId: 'warrior', name: 'Arms', role: 'dps' },
    { id: 'warrior-fury', classId: 'warrior', name: 'Fury', role: 'dps' },
    { id: 'warrior-protection', classId: 'warrior', name: 'Protection', role: 'tank' },
    // Paladin
    { id: 'paladin-holy', classId: 'paladin', name: 'Holy', role: 'healer' },
    { id: 'paladin-protection', classId: 'paladin', name: 'Protection', role: 'tank' },
    { id: 'paladin-retribution', classId: 'paladin', name: 'Retribution', role: 'dps' },
    // Hunter
    { id: 'hunter-beastmastery', classId: 'hunter', name: 'Beast Mastery', role: 'dps' },
    { id: 'hunter-marksmanship', classId: 'hunter', name: 'Marksmanship', role: 'dps' },
    { id: 'hunter-survival', classId: 'hunter', name: 'Survival', role: 'dps' },
    // Rogue
    { id: 'rogue-assassination', classId: 'rogue', name: 'Assassination', role: 'dps' },
    { id: 'rogue-combat', classId: 'rogue', name: 'Combat', role: 'dps' },
    { id: 'rogue-subtlety', classId: 'rogue', name: 'Subtlety', role: 'dps' },
    // Priest
    { id: 'priest-discipline', classId: 'priest', name: 'Discipline', role: 'healer' },
    { id: 'priest-holy', classId: 'priest', name: 'Holy', role: 'healer' },
    { id: 'priest-shadow', classId: 'priest', name: 'Shadow', role: 'dps' },
    // Mage
    { id: 'mage-arcane', classId: 'mage', name: 'Arcane', role: 'dps' },
    { id: 'mage-fire', classId: 'mage', name: 'Fire', role: 'dps' },
    { id: 'mage-frost', classId: 'mage', name: 'Frost', role: 'dps' },
    // Warlock
    { id: 'warlock-affliction', classId: 'warlock', name: 'Affliction', role: 'dps' },
    { id: 'warlock-demonology', classId: 'warlock', name: 'Demonology', role: 'dps' },
    { id: 'warlock-destruction', classId: 'warlock', name: 'Destruction', role: 'dps' },
    // Druid
    { id: 'druid-balance', classId: 'druid', name: 'Balance', role: 'dps' },
    { id: 'druid-feral', classId: 'druid', name: 'Feral', role: 'dps' },
    { id: 'druid-guardian', classId: 'druid', name: 'Guardian', role: 'tank' },
    { id: 'druid-restoration', classId: 'druid', name: 'Restoration', role: 'healer' },
]

export function getSpecsByClass(classId: string): WowSpec[] {
    return WOW_SPECS.filter(spec => spec.classId === classId)
}

export function getClassById(classId: string): WowClass | undefined {
    return WOW_CLASSES.find(c => c.id === classId)
}
