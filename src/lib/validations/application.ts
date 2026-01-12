import { z } from 'zod'

// Step 1: Identity
export const identitySchema = z.object({
    characterName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(50),
    battleTag: z.string().min(3, 'BattleTag requis (ex: Joueur#1234)'),
    discordId: z.string().min(2, 'Discord ID requis'),
})

// Step 2: Character
export const characterSchema = z.object({
    classId: z.string().min(1, 'Veuillez sélectionner une classe'),
    specId: z.string().min(1, 'Veuillez sélectionner une spécialisation'),
    warcraftlogsLink: z.string().url('URL invalide').optional().or(z.literal('')),
    screenshotUrl: z.string().optional(),
    avatarUrl: z.string().optional(),
    raidExperience: z.string().min(20, 'Décrivez votre expérience de raid (minimum 20 caractères)'),
})

// Step 3: Motivation
export const motivationSchema = z.object({
    aboutMe: z.string().min(20, 'Parlez-nous un peu de vous (minimum 20 caractères)'),
    whyJSC: z.string().min(20, 'Expliquez ce qui vous attire chez JSC (minimum 20 caractères)'),
    motivation: z.string().min(50, 'Votre message doit contenir au moins 50 caractères').max(2000),
})

// Combined schema for full application
export const applicationSchema = identitySchema.merge(characterSchema).merge(motivationSchema)

export type IdentityFormData = z.infer<typeof identitySchema>
export type CharacterFormData = z.infer<typeof characterSchema>
export type MotivationFormData = z.infer<typeof motivationSchema>
export type ApplicationFormData = z.infer<typeof applicationSchema>
