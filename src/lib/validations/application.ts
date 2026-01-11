import { z } from 'zod'

// Step 1: Identity
export const identitySchema = z.object({
    characterName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(50),
    battleTag: z.string().optional(),
})

// Step 2: Character
export const characterSchema = z.object({
    classId: z.string().min(1, 'Veuillez sélectionner une classe'),
    specId: z.string().min(1, 'Veuillez sélectionner une spécialisation'),
    warcraftlogsLink: z.string().url('URL invalide').optional().or(z.literal('')),
    screenshotUrl: z.string().optional(),
})

// Step 3: Motivation
export const motivationSchema = z.object({
    motivation: z.string().min(50, 'Votre motivation doit contenir au moins 50 caractères').max(2000),
})

// Combined schema for full application
export const applicationSchema = identitySchema.merge(characterSchema).merge(motivationSchema)

export type IdentityFormData = z.infer<typeof identitySchema>
export type CharacterFormData = z.infer<typeof characterSchema>
export type MotivationFormData = z.infer<typeof motivationSchema>
export type ApplicationFormData = z.infer<typeof applicationSchema>
