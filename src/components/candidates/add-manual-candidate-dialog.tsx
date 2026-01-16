'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { manualCandidateSchema, type ManualCandidateFormData } from '@/lib/validations/manual-candidate'
import { createManualCandidate } from '@/lib/actions/candidates'
import { UserPlus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface AddManualCandidateDialogProps {
    classes: { id: string; name: string; color: string }[]
    specs: { id: string; name: string; class_id: string }[]
}

const statusOptions = [
    { value: 'pending', label: 'En Attente' },
    { value: 'accepted', label: 'Acceptée' },
    { value: 'waitlist', label: 'Liste d\'attente' },
    { value: 'rejected', label: 'Rejetée' },
] as const

export function AddManualCandidateDialog({ classes, specs }: AddManualCandidateDialogProps) {
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    const form = useForm<ManualCandidateFormData>({
        resolver: zodResolver(manualCandidateSchema),
        defaultValues: {
            name: '',
            classId: '',
            specId: '',
            battleTag: '',
            discordId: '',
            warcraftlogsLink: '',
            screenshotUrl: '',
            avatarUrl: '',
            raidExperience: '',
            aboutMe: '',
            whyJSC: '',
            motivation: '',
            status: 'pending',
        },
    })

    const selectedClassId = form.watch('classId')
    const filteredSpecs = specs.filter(spec => spec.class_id === selectedClassId)

    async function onSubmit(data: ManualCandidateFormData) {
        setIsSubmitting(true)
        try {
            const result = await createManualCandidate(data)

            if (result.success) {
                toast.success('Candidature créée avec succès')
                setOpen(false)
                form.reset()
                router.refresh()
            } else {
                toast.error(result.error || 'Une erreur est survenue')
            }
        } catch (error) {
            toast.error('Une erreur inattendue est survenue')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="default" size="sm">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Ajouter une candidature
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <AlertDialogHeader>
                    <AlertDialogTitle>Ajouter une candidature manuellement</AlertDialogTitle>
                    <AlertDialogDescription>
                        Pour les candidatures reçues avant la mise en ligne de l'application.
                        Les champs marqués d'un * sont obligatoires.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm">Informations de base</h3>

                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nom du personnage *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="ex: Arthas" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="classId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Classe *</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Sélectionner une classe" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {classes.map((cls) => (
                                                        <SelectItem key={cls.id} value={cls.id}>
                                                            {cls.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="specId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Spécialisation *</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                disabled={!selectedClassId}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Sélectionner une spéc" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {filteredSpecs.map((spec) => (
                                                        <SelectItem key={spec.id} value={spec.id}>
                                                            {spec.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="battleTag"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>BattleTag</FormLabel>
                                            <FormControl>
                                                <Input placeholder="ex: Joueur#1234" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="discordId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Discord ID</FormLabel>
                                            <FormControl>
                                                <Input placeholder="ex: joueur#1234" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Statut initial *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {statusOptions.map((status) => (
                                                    <SelectItem key={status.value} value={status.value}>
                                                        {status.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Optional Links */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm">Liens (optionnel)</h3>

                            <FormField
                                control={form.control}
                                name="warcraftlogsLink"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Lien WarcraftLogs</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://www.warcraftlogs.com/character/..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="screenshotUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>URL du screenshot</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="avatarUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>URL de l'avatar</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Text Fields */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm">Informations détaillées</h3>

                            <FormField
                                control={form.control}
                                name="motivation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Motivation *</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Pourquoi postuler chez JSC..."
                                                className="min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="raidExperience"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Expérience raid</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Décrivez votre expérience..."
                                                className="min-h-[80px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="aboutMe"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>À propos</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Parlez-nous de vous..."
                                                className="min-h-[80px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="whyJSC"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Pourquoi JSC</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Qu'est-ce qui vous attire chez JSC..."
                                                className="min-h-[80px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={isSubmitting}
                            >
                                Annuler
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Créer la candidature
                            </Button>
                        </div>
                    </form>
                </Form>
            </AlertDialogContent>
        </AlertDialog>
    )
}
