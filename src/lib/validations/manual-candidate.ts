import { z } from 'zod'

// Manual candidate schema - simplified version with optional fields
// for adding candidates received before the online application was available
export const manualCandidateSchema = z.object({
    // Required fields
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(50),
    classId: z.string().min(1, 'Veuillez sélectionner une classe'),
    specId: z.string().min(1, 'Veuillez sélectionner une spécialisation'),
    motivation: z.string().min(10, 'La motivation doit contenir au moins 10 caractères').max(1500, 'Maximum 1500 caractères'),

    // Optional fields
    battleTag: z.string().optional().or(z.literal('')),
    discordId: z.string().optional().or(z.literal('')),
    warcraftlogsLink: z.string().url('URL invalide').optional().or(z.literal('')),
    screenshotUrl: z.string().optional().or(z.literal('')),
    avatarUrl: z.string().optional().or(z.literal('')),
    raidExperience: z.string().max(1500, 'Maximum 1500 caractères').optional().or(z.literal('')),
    aboutMe: z.string().max(1000, 'Maximum 1000 caractères').optional().or(z.literal('')),
    whyJSC: z.string().max(1000, 'Maximum 1000 caractères').optional().or(z.literal('')),

    // Status selection - required field
    status: z.enum(['pending', 'accepted', 'rejected', 'waitlist']),
})

export type ManualCandidateFormData = z.infer<typeof manualCandidateSchema>
