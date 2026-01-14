'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ImageUpload } from '@/components/ui/image-upload'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { WOW_CLASSES, getSpecsByClass, getClassById, getClassIdFromName } from '@/lib/data/wow-classes'
import {
    identitySchema,
    characterSchema,
    motivationSchema,
    applicationSchema,
    type IdentityFormData,
    type CharacterFormData,
    type MotivationFormData,
    type ApplicationFormData,
} from '@/lib/validations/application'
import { ChevronLeft, ChevronRight, Send, Sword, MessageSquare, ExternalLink, LayoutGrid, Target, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlassCard } from '@/components/ui/glass-card'
import { BlurFade } from '@/components/ui/blur-fade'

interface WizardProps {
    onSubmit: (data: ApplicationFormData) => Promise<void>
}

interface BattleNetCharacter {
    name: string
    realm: string
    realmSlug: string
    level: number
    classId: number
    className: string
    faction: string
    avatarUrl: string
}

const STEPS = [
    { id: 1, name: 'Identité', icon: User },
    { id: 2, name: 'Personnage', icon: Sword },
    { id: 3, name: 'Motivation', icon: MessageSquare },
]

export function ApplicationWizard({ onSubmit }: WizardProps) {
    const [currentStep, setCurrentStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState<Partial<ApplicationFormData>>({})
    const [fetchedCharacters, setFetchedCharacters] = useState<BattleNetCharacter[]>([])
    const [showCharacterPicker, setShowCharacterPicker] = useState(false)

    // Step 1 Form
    const step1Form = useForm<IdentityFormData>({
        resolver: zodResolver(identitySchema),
        defaultValues: {
            characterName: '',
            battleTag: '',
            discordId: '',
            ...formData
        },
    })

    // Step 2 Form
    const step2Form = useForm<CharacterFormData>({
        resolver: zodResolver(characterSchema),
        defaultValues: {
            classId: '',
            specId: '',
            warcraftlogsLink: '',
            screenshotUrl: '',
            avatarUrl: '',
            raidExperience: '',
            ...formData
        },
    })

    // Step 3 Form
    const step3Form = useForm<MotivationFormData>({
        resolver: zodResolver(motivationSchema),
        defaultValues: {
            aboutMe: '',
            whyJSC: '',
            motivation: '',
            ...formData
        },
    })

    const selectedClassId = step2Form.watch('classId')
    const availableSpecs = selectedClassId ? getSpecsByClass(selectedClassId) : []
    const selectedClass = selectedClassId ? getClassById(selectedClassId) : null

    const handleNext = async () => {
        if (currentStep === 1) {
            const isValid = await step1Form.trigger()
            if (isValid) {
                setFormData({ ...formData, ...step1Form.getValues() })
                setCurrentStep(2)
            }
        } else if (currentStep === 2) {
            const isValid = await step2Form.trigger()
            if (isValid) {
                setFormData({ ...formData, ...step2Form.getValues() })
                setCurrentStep(3)
            }
        }
    }

    const handleBack = () => {
        if (currentStep === 2) {
            setFormData({ ...formData, ...step2Form.getValues() })
            setCurrentStep(1)
        } else if (currentStep === 3) {
            setFormData({ ...formData, ...step3Form.getValues() })
            setCurrentStep(2)
        }
    }

    const handleSubmit = async () => {
        const isValid = await step3Form.trigger()
        if (isValid) {
            setIsSubmitting(true)
            const rawData = {
                ...formData,
                ...step3Form.getValues(),
            }

            // Validate with full schema to ensure type safety
            const parseResult = applicationSchema.safeParse(rawData)
            if (!parseResult.success) {
                console.error('Validation failed:', parseResult.error.issues)
                setIsSubmitting(false)
                return
            }

            await onSubmit(parseResult.data)
            setIsSubmitting(false)
        }
    }

    const progress = (currentStep / STEPS.length) * 100

    const handleSelectCharacter = (char: BattleNetCharacter) => {
        step1Form.setValue('characterName', char.name)
        // Use centralized class mapping from wow-classes.ts
        const classSlug = getClassIdFromName(char.className)
        if (classSlug) {
            step2Form.setValue('classId', classSlug)
        }
        setShowCharacterPicker(false)
        // Auto-generate WarcraftLogs link based on character using realmSlug
        const realmSlug = char.realmSlug || char.realm.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '')
        const wlogsLink = `https://www.warcraftlogs.com/character/eu/${realmSlug}/${char.name.toLowerCase()}`
        step2Form.setValue('warcraftlogsLink', wlogsLink)

        // Set avatar URL if available
        if (char.avatarUrl) {
            step2Form.setValue('avatarUrl', char.avatarUrl)
        }
    }

    return (
        <div className="mx-auto max-w-2xl space-y-10 py-4">
            {/* Character Picker Modal */}
            {showCharacterPicker && fetchedCharacters.length > 0 && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/90 backdrop-blur-md px-4">
                    <BlurFade>
                        <GlassCard
                            className="w-full max-w-lg max-h-[85vh] flex flex-col border-white/10 bg-black/60 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
                            innerClassName="p-0 flex flex-col h-full min-h-0"
                            showBorderBeam
                        >
                            {/* Background Glow */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />

                            <div className="relative p-8 pb-6 text-center border-b border-white/[0.03]">
                                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary mb-3">Battle.net</p>
                                <h1 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Choisissez votre Champion</h1>
                                <p className="mt-4 text-zinc-500 font-medium text-xs max-w-[280px] mx-auto leading-relaxed">
                                    Sélectionnez le personnage que vous souhaitez enrôler pour cette candidature.
                                </p>
                            </div>

                            <div className="relative flex-1 overflow-y-auto px-6 py-6 space-y-3 custom-scrollbar">
                                {fetchedCharacters.map((char, idx) => {
                                    const classId = getClassIdFromName(char.className)
                                    const wowClass = classId ? getClassById(classId) : null
                                    const classColor = wowClass?.color || (char.faction === 'HORDE' ? '#ef4444' : '#3b82f6')

                                    return (
                                        <button
                                            key={`${char.name}-${char.realm}-${idx}`}
                                            onClick={() => handleSelectCharacter(char)}
                                            className="group relative flex w-full items-center gap-5 rounded-[1.5rem] border border-white/5 bg-white/[0.02] p-4 text-left transition-all hover:bg-white/[0.05] hover:border-primary/30"
                                        >
                                            {/* Class/Faction Accent */}
                                            <div
                                                className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 rounded-r-full transition-all duration-300"
                                                style={{
                                                    backgroundColor: classColor,
                                                    boxShadow: `0 0 15px ${classColor}`,
                                                }}
                                            />

                                            <div className="relative h-16 w-16 flex-shrink-0">
                                                <div className="absolute -inset-1 bg-gradient-to-tr from-white/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl transition-transform group-hover:scale-105">
                                                    <div className="absolute inset-0 flex items-center justify-center text-2xl font-black text-zinc-700 select-none">
                                                        {char.name.charAt(0)}
                                                    </div>
                                                    {char.avatarUrl && (
                                                        <img
                                                            src={char.avatarUrl}
                                                            alt={char.name}
                                                            className="relative z-10 h-full w-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-500"
                                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-black text-white group-hover:text-primary transition-colors text-xl tracking-tighter uppercase">
                                                        {char.name}
                                                    </p>
                                                    <span className="px-1.5 py-0.5 rounded-lg bg-white/5 border border-white/5 text-[9px] font-black text-zinc-400 uppercase tracking-wider">
                                                        Niv. {char.level}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{char.realm}</span>
                                                    <span className="w-1 h-1 rounded-full bg-zinc-800" />
                                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">{char.className}</span>
                                                </div>
                                            </div>

                                            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 mr-2">
                                                <div className="bg-primary/10 p-2 rounded-xl border border-primary/20">
                                                    <ChevronRight className="h-4 w-4 text-primary" />
                                                </div>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>

                            <div className="relative p-6 px-8 bg-zinc-950/50">
                                <Button
                                    variant="ghost"
                                    className="w-full h-12 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 hover:text-white hover:bg-white/5 transition-all rounded-2xl border border-transparent hover:border-white/5"
                                    onClick={() => setShowCharacterPicker(false)}
                                >
                                    Annuler la sélection
                                </Button>
                            </div>
                        </GlassCard>
                    </BlurFade>
                </div>
            )}

            {/* Progress Cockpit */}
            <div className="space-y-6">
                <div className="flex justify-between px-2">
                    {STEPS.map((step) => (
                        <div
                            key={step.id}
                            className={cn(
                                'flex flex-col items-center gap-3 transition-all duration-500',
                                currentStep >= step.id ? 'scale-110 opacity-100' : 'scale-90 opacity-40'
                            )}
                        >
                            <div className={cn(
                                "flex h-12 w-12 items-center justify-center rounded-2xl border-2 transition-all duration-500",
                                currentStep >= step.id
                                    ? "border-primary bg-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.3)] text-primary"
                                    : "border-zinc-800 bg-zinc-900 text-zinc-600"
                            )}>
                                <step.icon className="h-6 w-6" />
                            </div>
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-[0.2em]",
                                currentStep >= step.id ? "text-primary" : "text-zinc-600"
                            )}>
                                {step.name}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-zinc-900/50 backdrop-blur-md border border-white/5">
                    <div
                        className="h-full bg-gradient-to-r from-primary/50 to-primary transition-all duration-700 ease-out shadow-[0_0_15px_rgba(var(--primary),0.5)]"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Step Layering */}
            <div className="relative">
                {/* Step 1: Identity */}
                {currentStep === 1 && (
                    <BlurFade delay={0.1}>
                        <GlassCard className="border-white/5" innerClassName="p-8" showBorderBeam>
                            <div className="mb-8">
                                <h1 className="text-3xl font-black text-white mb-2">Formulaire d'apply chez Jet Set Club</h1>
                                <p className="text-zinc-500 font-medium">Veuillez utiliser ce formulaire pour faire une demande d'apply à la guilde Jet Set Club.
                                    Ce formulaire est votre première prise de contact avec nous, prenez en soin! L'ensemble des membres du roster recevront votre apply, pour concertation avant d'aller plus loin!</p>
                            </div>

                            <div className="space-y-8">
                                {/* Battle.net Quick Fill */}
                                <div className="group relative overflow-hidden rounded-2xl border border-primary/30 bg-primary/5 p-6 transition-all hover:bg-primary/10">
                                    <div className="absolute -right-4 -top-4 text-primary/10 opacity-20 group-hover:scale-110 transition-transform">
                                        <Sword className="h-24 w-24" />
                                    </div>
                                    <p className="mb-6 text-sm text-zinc-400 font-medium leading-relaxed">
                                        Récupérer automatiquement les informations de vos personnages avec Battle.net.
                                    </p>
                                    <Button
                                        type="button"
                                        className="h-12 w-full gap-3 bg-primary text-black font-black hover:bg-primary/90 shadow-xl"
                                        onClick={() => {
                                            window.open('/api/auth/battlenet', 'battlenet-oauth', 'width=500,height=700')
                                            const handleMessage = (event: MessageEvent) => {
                                                if (event.data.type === 'battlenet-success') {
                                                    step1Form.setValue('battleTag', event.data.userData.battletag)
                                                    if (event.data.userData.characters && event.data.userData.characters.length > 0) {
                                                        setFetchedCharacters(event.data.userData.characters)
                                                        setShowCharacterPicker(true)
                                                    }
                                                    window.removeEventListener('message', handleMessage)
                                                }
                                            }
                                            window.addEventListener('message', handleMessage)
                                        }}
                                    >
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#00AEFF]/10 border border-[#00AEFF]/20 group-hover:bg-[#00AEFF]/20 group-hover:border-[#00AEFF]/40 transition-all text-[#00AEFF]">
                                            <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-current"><path d="M19.92 10.76s2.58 1.48 2.58 3.13c0 1.61-3 2.17-6.32 2.01c0 0-1.41 1.97-2.76 2.8c1.46 2.74 2.58 3.8 2.55 3.8c0 0-.74.19-2.97-3.46c-1.34.85-2.83 1.19-3.44.66c-.62-.53-.14-1.42.12-1.85c-.27.15-1.68.98-2.93.98c-1.49 0-1.7-1.11-1.7-1.68C5.05 15 7.12 12 7.12 12s-.96-2.12-1.07-3.78c-1.88-.16-4.05.17-4.52.32c-.13 0 .31-.32.47-.36c.15-.05 1.91-.51 4-.51c0-1.74.35-3.34 1.41-3.34c.72 0 1.3 1.12 1.3 1.12S8.7 1.5 10.74 1.5C12.8 1.5 15 6.11 15 6.11s2.22.21 3.85.98c.65-1.36 1.24-1.98 1.96-4.09c.19.7-.61 2.5-1.46 4.3c0 0 2.3 1.2 2.3 2.53c0 1.01-1.73.93-1.73.93m-9.24 7.82c.68.11 1.73-.48 1.72-.48l-.82-1.53l-1.18.83c-.01.01-.76.98.28 1.18m9.47-8.82c0-.66-1.2-1.41-1.34-1.49l-.92 1.48l1.28.62c.42-.03.98-.02.98-.61M8 5.63c-.3 0-.91.44-.91 2.01l1.74.06l-.11-1.4C8.6 6 8.3 5.63 8 5.63m2.18 10.15c-1.26-.65-2.02-1.72-2.64-2.88c0 0-1.58 2.65-.57 3.32c1.03.67 2.67-.06 3.21-.44m2.79 1.98c1.14-.87 4.22-3.03 4.48-6.68c-2.88-1.64-6.83-2.37-6.83-2.37s-.01-.5.08-.85c.94.11 3.89.61 6.33 1.57c-.68-1.15-1.19-1.58-1.66-1.93c1.16.26 1.99 1.76 1.99 1.76l.92-1.3s-4.37-2.35-8.09-.54c-.08 2.88 1.4 7.14 1.4 7.14l-.77.33c-.52-1.05-1.19-2.8-1.82-6.22c-.3.41-.83.88-.84 2.42c-.46-1.29.5-2.66.51-2.67l-1.6-.16c.1 1.66.98 5.94 3.61 7.27c2.32-1.32 4.82-3.99 5.45-4.76l.69.51l-4.47 4.69c1.24.03 1.97-.25 2.47-.47c-.72.75-1.96.82-2.55.82c.01.02.3.75.7 1.44m1.06-11.71c-.03-.08-1.37-2.36-2.56-2.19c-.78.25-1.23 1.57-1.24 3.01c.53-.31 1.77-.87 3.8-.82m2.68 9.02S20 15 19.9 13.76c0-1.2-1.98-2.43-1.98-2.41c.01 2.12-1.21 3.72-1.21 3.72z" /></svg>
                                        </div>
                                        Se connecter avec Battle.net
                                    </Button>
                                </div>

                                <div className="relative flex items-center gap-4 py-2">
                                    <div className="h-px flex-1 bg-white/5" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Saisie Manuelle</span>
                                    <div className="h-px flex-1 bg-white/5" />
                                </div>

                                <div className="grid gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="characterName" className="text-xs font-black uppercase tracking-widest text-zinc-500">Nom de votre personnage *</Label>
                                        <Input
                                            id="characterName"
                                            {...step1Form.register('characterName')}
                                            placeholder="Thrall"
                                            className="h-12 bg-black/40 border-white/5 text-white placeholder:text-zinc-700 focus:border-primary/50 transition-all rounded-xl"
                                        />
                                        {step1Form.formState.errors.characterName && (
                                            <p className="text-xs font-bold text-destructive mt-1">{step1Form.formState.errors.characterName.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="battleTag" className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400">
                                            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[#00AEFF]/15 border border-[#00AEFF]/30 shadow-[0_0_8px_rgba(0,174,255,0.2)] text-[#00AEFF]">
                                                <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current"><path d="M19.92 10.76s2.58 1.48 2.58 3.13c0 1.61-3 2.17-6.32 2.01c0 0-1.41 1.97-2.76 2.8c1.46 2.74 2.58 3.8 2.55 3.8c0 0-.74.19-2.97-3.46c-1.34.85-2.83 1.19-3.44.66c-.62-.53-.14-1.42.12-1.85c-.27.15-1.68.98-2.93.98c-1.49 0-1.7-1.11-1.7-1.68C5.05 15 7.12 12 7.12 12s-.96-2.12-1.07-3.78c-1.88-.16-4.05.17-4.52.32c-.13 0 .31-.32.47-.36c.15-.05 1.91-.51 4-.51c0-1.74.35-3.34 1.41-3.34c.72 0 1.3 1.12 1.3 1.12S8.7 1.5 10.74 1.5C12.8 1.5 15 6.11 15 6.11s2.22.21 3.85.98c.65-1.36 1.24-1.98 1.96-4.09c.19.7-.61 2.5-1.46 4.3c0 0 2.3 1.2 2.3 2.53c0 1.01-1.73.93-1.73.93m-9.24 7.82c.68.11 1.73-.48 1.72-.48l-.82-1.53l-1.18.83c-.01.01-.76.98.28 1.18m9.47-8.82c0-.66-1.2-1.41-1.34-1.49l-.92 1.48l1.28.62c.42-.03.98-.02.98-.61M8 5.63c-.3 0-.91.44-.91 2.01l1.74.06l-.11-1.4C8.6 6 8.3 5.63 8 5.63m2.18 10.15c-1.26-.65-2.02-1.72-2.64-2.88c0 0-1.58 2.65-.57 3.32c1.03.67 2.67-.06 3.21-.44m2.79 1.98c1.14-.87 4.22-3.03 4.48-6.68c-2.88-1.64-6.83-2.37-6.83-2.37s-.01-.5.08-.85c.94.11 3.89.61 6.33 1.57c-.68-1.15-1.19-1.58-1.66-1.93c1.16.26 1.99 1.76 1.99 1.76l.92-1.3s-4.37-2.35-8.09-.54c-.08 2.88 1.4 7.14 1.4 7.14l-.77.33c-.52-1.05-1.19-2.8-1.82-6.22c-.3.41-.83.88-.84 2.42c-.46-1.29.5-2.66.51-2.67l-1.6-.16c.1 1.66.98 5.94 3.61 7.27c2.32-1.32 4.82-3.99 5.45-4.76l.69.51l-4.47 4.69c1.24.03 1.97-.25 2.47-.47c-.72.75-1.96.82-2.55.82c.01.02.3.75.7 1.44m1.06-11.71c-.03-.08-1.37-2.36-2.56-2.19c-.78.25-1.23 1.57-1.24 3.01c.53-.31 1.77-.87 3.8-.82m2.68 9.02S20 15 19.9 13.76c0-1.2-1.98-2.43-1.98-2.41c.01 2.12-1.21 3.72-1.21 3.72z" /></svg>
                                            </div>
                                            BattleTag *
                                        </Label>
                                        <Input
                                            id="battleTag"
                                            {...step1Form.register('battleTag')}
                                            placeholder="Joueur#1234"
                                            className="h-12 bg-black/40 border-white/5 text-white placeholder:text-zinc-700 focus:border-primary/50 transition-all rounded-xl"
                                        />
                                        {step1Form.formState.errors.battleTag && (
                                            <p className="text-xs font-bold text-destructive mt-1">{step1Form.formState.errors.battleTag.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="discordId" className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400">
                                            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[#5865F2]/15 border border-[#5865F2]/30 shadow-[0_0_8px_rgba(88,101,242,0.2)] text-[#5865F2]">
                                                <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current"><path d="m22 24l-5.25-5l.63 2H4.5A2.5 2.5 0 0 1 2 18.5v-15A2.5 2.5 0 0 1 4.5 1h15A2.5 2.5 0 0 1 22 3.5V24M12 6.8c-2.68 0-4.56 1.15-4.56 1.15c1.03-.92 2.83-1.45 2.83-1.45l-.17-.17c-1.69.03-3.22 1.2-3.22 1.2c-1.72 3.59-1.61 6.69-1.61 6.69c1.4 1.81 3.48 1.68 3.48 1.68l.71-.9c-1.25-.27-2.04-1.38-2.04-1.38S9.3 14.9 12 14.9s4.58-1.28 4.58-1.28s-.79 1.11-2.04 1.38l.71.9s2.08.13 3.48-1.68c0 0 .11-3.1-1.61-6.69c0 0-1.53-1.17-3.22-1.2l-.17.17s1.8.53 2.83 1.45c0 0-1.88-1.15-4.56-1.15m-2.07 3.79c.65 0 1.18.57 1.17 1.27c0 .69-.52 1.27-1.17 1.27c-.64 0-1.16-.58-1.16-1.27c0-.7.51-1.27 1.16-1.27m4.17 0c.65 0 1.17.57 1.17 1.27c0 .69-.52 1.27-1.17 1.27c-.64 0-1.16-.58-1.16-1.27c0-.7.51-1.27 1.16-1.27Z" /></svg>
                                            </div>
                                            ID Discord *
                                        </Label>
                                        <Input
                                            id="discordId"
                                            {...step1Form.register('discordId')}
                                            placeholder="Votre ID Discord"
                                            className="h-12 bg-black/40 border-white/5 text-white placeholder:text-zinc-700 focus:border-primary/50 transition-all rounded-xl"
                                        />
                                        {step1Form.formState.errors.discordId && (
                                            <p className="text-xs font-bold text-destructive mt-1">{step1Form.formState.errors.discordId.message}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    </BlurFade>
                )}

                {/* Step 2: Character */}
                {currentStep === 2 && (
                    <BlurFade delay={0.1}>
                        <GlassCard className="border-white/5" innerClassName="p-8" showBorderBeam>
                            <div className="mb-8">
                                <h1 className="text-3xl font-black text-white mb-2">Votre profil d'aventurier</h1>
                                <p className="text-zinc-500 font-medium">Dites-nous en plus sur votre personnage et vos faits d'armes.</p>
                            </div>

                            <div className="grid gap-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-zinc-500">Classe *</Label>
                                        <Select
                                            value={step2Form.watch('classId') || ''}
                                            onValueChange={(value) => {
                                                step2Form.setValue('classId', value)
                                                step2Form.setValue('specId', '')
                                            }}
                                        >
                                            <SelectTrigger className="h-12 bg-black/40 border-white/5 text-white rounded-xl focus:border-primary/50">
                                                <SelectValue placeholder="Classe" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900 border-white/10 z-[100] rounded-xl overflow-hidden">
                                                {WOW_CLASSES.map((wowClass) => (
                                                    <SelectItem
                                                        key={wowClass.id}
                                                        value={wowClass.id}
                                                        className="font-bold cursor-pointer transition-colors"
                                                    >
                                                        <span style={{ color: wowClass.color }}>{wowClass.nameFr}</span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-zinc-500">Spécialisation *</Label>
                                        <Select
                                            value={step2Form.watch('specId') || ''}
                                            onValueChange={(value) => step2Form.setValue('specId', value)}
                                            disabled={!selectedClassId}
                                        >
                                            <SelectTrigger
                                                className="h-12 bg-black/40 border-white/5 text-white rounded-xl focus:border-primary/50"
                                                style={{ borderColor: selectedClass?.color ? `${selectedClass.color}40` : undefined }}
                                            >
                                                <SelectValue placeholder="Spé" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900 border-white/10 z-[100] rounded-xl">
                                                {availableSpecs.map((spec) => (
                                                    <SelectItem
                                                        key={spec.id}
                                                        value={spec.id}
                                                        className="font-bold cursor-pointer"
                                                    >
                                                        {spec.nameFr}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {step2Form.formState.errors.specId && (
                                            <p className="text-xs font-bold text-destructive mt-1">{step2Form.formState.errors.specId.message}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="warcraftlogsLink" className="text-xs font-black uppercase tracking-widest text-zinc-500">Données WarcraftLogs</Label>
                                    <Input
                                        id="warcraftlogsLink"
                                        {...step2Form.register('warcraftlogsLink')}
                                        placeholder="https://www.warcraftlogs.com/character/..."
                                        className="h-12 bg-black/40 border-white/5 text-white placeholder:text-zinc-700 rounded-xl"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="raidExperience" className="text-xs font-black uppercase tracking-widest text-zinc-500">Résumez votre expérience de raid et votre historique de guildes *</Label>
                                    <Textarea
                                        id="raidExperience"
                                        {...step2Form.register('raidExperience')}
                                        placeholder="Inutile de nous mentionner votre expérience Vanilla/BC/Wotlk & cie, c'est chouette, mais c'est plus vraiment pertinent :)"
                                        className="min-h-[120px] bg-black/40 border-white/5 text-white placeholder:text-zinc-700 rounded-xl p-4"
                                    />
                                    {step2Form.formState.errors.raidExperience && (
                                        <p className="text-xs font-bold text-destructive mt-1">{step2Form.formState.errors.raidExperience.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest text-zinc-500">Capture d'écran de votre UI</Label>
                                    <ImageUpload
                                        value={step2Form.watch('screenshotUrl')}
                                        onChange={(url) => step2Form.setValue('screenshotUrl', url)}
                                        className="mt-2"
                                    />
                                </div>
                            </div>
                        </GlassCard>
                    </BlurFade>
                )}

                {/* Step 3: Motivation */}
                {currentStep === 3 && (
                    <BlurFade delay={0.1}>
                        <GlassCard className="border-white/5" innerClassName="p-8" showBorderBeam>
                            <div className="mb-8">
                                <h1 className="text-3xl font-black text-white mb-2">L'humain derrière la chaise</h1>
                                <p className="text-zinc-500 font-medium">Histoire d'en savoir un peu plus!</p>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <Label htmlFor="aboutMe" className="text-xs font-black uppercase tracking-widest text-zinc-500">Parlez-nous un peu de vous! *</Label>
                                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter mb-2">
                                        L'âge, ce que vous faites dans la vie et vos intérêts en dehors de jouer à WoW
                                    </p>
                                    <Textarea
                                        id="aboutMe"
                                        {...step3Form.register('aboutMe')}
                                        placeholder="Votre histoire commence ici..."
                                        className="min-h-[100px] bg-black/40 border-white/5 text-white placeholder:text-zinc-700 rounded-xl p-4"
                                    />
                                    {step3Form.formState.errors.aboutMe && (
                                        <p className="text-xs font-bold text-destructive mt-1">{step3Form.formState.errors.aboutMe.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="whyJSC" className="text-xs font-black uppercase tracking-widest text-zinc-500">L'Appel du Club *</Label>
                                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter mb-2">
                                        Qu'est ce qu'il vous plait chez Jet Set Club?
                                    </p>
                                    <Textarea
                                        id="whyJSC"
                                        {...step3Form.register('whyJSC')}
                                        placeholder="Votre vision du Club..."
                                        className="min-h-[100px] bg-black/40 border-white/5 text-white placeholder:text-zinc-700 rounded-xl p-4"
                                    />
                                    {step3Form.formState.errors.whyJSC && (
                                        <p className="text-xs font-bold text-destructive mt-1">{step3Form.formState.errors.whyJSC.message}</p>
                                    )}
                                </div>

                                <div className="relative group overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 p-6">
                                    <Label htmlFor="motivation" className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-primary mb-4">
                                        <Target className="h-4 w-4" /> Le mot de la fin *
                                    </Label>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter mb-4 leading-relaxed">
                                        Exprimez-vous ! C'est votre chance de capter notre attention et de nous montrer votre personnalité. <br></br>Nous y accordons beaucoup d'importance!
                                    </p>
                                    <Textarea
                                        id="motivation"
                                        {...step3Form.register('motivation')}
                                        placeholder="C'est le moment de briller..."
                                        className="min-h-[140px] bg-black/40 border-white/5 text-white placeholder:text-zinc-700 rounded-xl p-4 focus:border-primary/50"
                                    />
                                    {step3Form.formState.errors.motivation && (
                                        <p className="text-xs font-bold text-destructive mt-2">{step3Form.formState.errors.motivation.message}</p>
                                    )}
                                </div>
                            </div>
                        </GlassCard>
                    </BlurFade>
                )}
            </div>

            {/* Navigation High-Tech */}
            <div className="flex items-center justify-between gap-4 pt-4">
                <Button
                    variant="ghost"
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    className="h-12 px-8 font-black uppercase tracking-widest text-zinc-600 hover:text-white hover:bg-white/5 disabled:opacity-20 rounded-xl"
                >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Retour
                </Button>

                {currentStep < 3 ? (
                    <Button
                        onClick={handleNext}
                        className="h-14 px-10 bg-white/5 border border-white/10 text-white font-black uppercase tracking-[0.2em] hover:bg-white/10 hover:border-primary/50 transition-all rounded-xl shadow-2xl group"
                    >
                        Procéder
                        <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                ) : (
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="h-14 px-10 bg-primary text-black font-black uppercase tracking-[0.2em] hover:scale-105 transition-all rounded-xl shadow-[0_0_30px_rgba(var(--primary),0.3)]"
                    >
                        {isSubmitting ? 'Transmission...' : 'Enrôler'}
                        <Send className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    )
}
