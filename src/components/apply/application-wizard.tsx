'use client'

import { useState, useMemo, useEffect } from 'react'
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
import { ChevronLeft, ChevronRight, Send, Sword, MessageSquare, ExternalLink, LayoutGrid, Target, User, Search, X, Check, Plus, Star, Cloud, Trash2, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlassCard } from '@/components/ui/glass-card'
import { BlurFade } from '@/components/ui/blur-fade'
import type { RecruitmentNeed } from '@/lib/actions/recruitment'

interface WizardProps {
    onSubmit: (data: ApplicationFormData) => Promise<void>
    needs?: RecruitmentNeed[]
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

const DRAFT_STORAGE_KEY = 'jsc_apply_draft_v1'

export function ApplicationWizard({ onSubmit, needs }: WizardProps) {
    const [currentStep, setCurrentStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState<Partial<ApplicationFormData>>({})
    const [fetchedCharacters, setFetchedCharacters] = useState<BattleNetCharacter[]>([])
    const [selectedBnetCharacter, setSelectedBnetCharacter] = useState<BattleNetCharacter | null>(null)
    const [showCharacterPicker, setShowCharacterPicker] = useState(false)
    const [characterSearch, setCharacterSearch] = useState('')
    const [draftRestored, setDraftRestored] = useState(false)
    const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)

    const sortedAndFilteredCharacters = useMemo(() => {
        return [...fetchedCharacters]
            .filter((char) => {
                if (!characterSearch.trim()) return true
                const q = characterSearch.toLowerCase().trim()
                const classId = getClassIdFromName(char.className)
                const wowClass = classId ? getClassById(classId) : null
                return (
                    char.name.toLowerCase().includes(q) ||
                    char.realm.toLowerCase().includes(q) ||
                    char.className.toLowerCase().includes(q) ||
                    (wowClass?.nameFr.toLowerCase().includes(q) ?? false)
                )
            })
            .sort((a, b) => b.level - a.level || a.name.localeCompare(b.name))
    }, [fetchedCharacters, characterSearch])

    const handleCloseCharacterPicker = () => {
        setShowCharacterPicker(false)
        setCharacterSearch('')
    }

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
            secondarySpecs: [],
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
    const selectedMainSpecId = step2Form.watch('specId')
    const selectedSecondarySpecs = step2Form.watch('secondarySpecs') || []
    const availableSpecs = selectedClassId ? getSpecsByClass(selectedClassId) : []
    const secondaryOptions = availableSpecs.filter(spec => spec.id !== selectedMainSpecId)
    const selectedClass = selectedClassId ? getClassById(selectedClassId) : null

    const isMainSpecClosed = useMemo(() => {
        if (!selectedMainSpecId || !needs || needs.length === 0) return false
        const match = needs.find(n => n.spec.id === selectedMainSpecId || n.specId === selectedMainSpecId)
        return !match || match.priority === 'closed'
    }, [selectedMainSpecId, needs])

    const toggleSecondarySpec = (specId: string) => {
        const current = step2Form.getValues('secondarySpecs') || []
        if (current.includes(specId)) {
            step2Form.setValue('secondarySpecs', current.filter(id => id !== specId), { shouldValidate: true })
        } else {
            step2Form.setValue('secondarySpecs', [...current, specId], { shouldValidate: true })
        }
    }

    // Restore draft from localStorage on initial mount
    useEffect(() => {
        if (typeof window === 'undefined') return
        try {
            const raw = localStorage.getItem(DRAFT_STORAGE_KEY)
            if (!raw) return
            const draft = JSON.parse(raw)
            if (!draft || draft.version !== 1) return

            const hasContent = Boolean(
                draft.step1?.characterName ||
                draft.step1?.discordId ||
                draft.step1?.battleTag ||
                draft.step2?.classId ||
                draft.step2?.raidExperience ||
                draft.step3?.aboutMe ||
                draft.step3?.motivation
            )

            if (!hasContent) return

            if (draft.step1) step1Form.reset(draft.step1)
            if (draft.step2) step2Form.reset(draft.step2)
            if (draft.step3) step3Form.reset(draft.step3)
            if (draft.selectedBnetCharacter) setSelectedBnetCharacter(draft.selectedBnetCharacter)
            if (draft.currentStep && draft.currentStep >= 1 && draft.currentStep <= 3) {
                setCurrentStep(draft.currentStep)
            }
            if (draft.updatedAt) setLastSavedAt(new Date(draft.updatedAt))
            setDraftRestored(true)
        } catch (e) {
            console.error('Failed to restore draft from localStorage:', e)
        }
    }, [step1Form, step2Form, step3Form])

    // Auto-save draft whenever values, step or character change
    useEffect(() => {
        if (typeof window === 'undefined') return

        const saveDraft = () => {
            try {
                const s1 = step1Form.getValues()
                const s2 = step2Form.getValues()
                const s3 = step3Form.getValues()

                const hasContent = Boolean(
                    s1.characterName ||
                    s1.discordId ||
                    s1.battleTag ||
                    s2.classId ||
                    s2.raidExperience ||
                    s3.aboutMe ||
                    s3.motivation
                )

                if (hasContent) {
                    const draft = {
                        version: 1,
                        currentStep,
                        updatedAt: Date.now(),
                        selectedBnetCharacter,
                        step1: s1,
                        step2: s2,
                        step3: s3,
                    }
                    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft))
                    setLastSavedAt(new Date())
                }
            } catch (err) {
                console.warn('Failed to auto-save application draft:', err)
            }
        }

        let timer: NodeJS.Timeout
        const debouncedSave = () => {
            clearTimeout(timer)
            timer = setTimeout(saveDraft, 400)
        }

        const sub1 = step1Form.watch(debouncedSave)
        const sub2 = step2Form.watch(debouncedSave)
        const sub3 = step3Form.watch(debouncedSave)

        // Save on step or character change
        debouncedSave()

        return () => {
            clearTimeout(timer)
            sub1.unsubscribe()
            sub2.unsubscribe()
            sub3.unsubscribe()
        }
    }, [currentStep, selectedBnetCharacter, step1Form, step2Form, step3Form])

    // Warn before accidental window close if form has data
    useEffect(() => {
        if (typeof window === 'undefined') return
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isSubmitting) return
            const s1 = step1Form.getValues()
            const s2 = step2Form.getValues()
            const s3 = step3Form.getValues()
            const hasData = Boolean(
                s1.characterName ||
                s1.discordId ||
                s2.classId ||
                s2.raidExperience ||
                s3.aboutMe ||
                s3.motivation
            )
            if (hasData) {
                e.preventDefault()
                e.returnValue = ''
            }
        }
        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [isSubmitting, step1Form, step2Form, step3Form])

    const handleClearDraft = () => {
        if (confirm('Voulez-vous vraiment effacer votre brouillon et recommencer à zéro ?')) {
            if (typeof window !== 'undefined') {
                try {
                    localStorage.removeItem(DRAFT_STORAGE_KEY)
                } catch (e) {}
            }
            step1Form.reset({ characterName: '', battleTag: '', discordId: '' })
            step2Form.reset({
                classId: '',
                specId: '',
                secondarySpecs: [],
                warcraftlogsLink: '',
                screenshotUrl: '',
                avatarUrl: '',
                raidExperience: '',
            })
            step3Form.reset({ aboutMe: '', whyJSC: '', motivation: '' })
            setSelectedBnetCharacter(null)
            setFormData({})
            setCurrentStep(1)
            setDraftRestored(false)
            setLastSavedAt(null)
        }
    }

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
                ...step1Form.getValues(),
                ...step2Form.getValues(),
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
            if (typeof window !== 'undefined') {
                try {
                    localStorage.removeItem(DRAFT_STORAGE_KEY)
                } catch (e) {}
            }
            setIsSubmitting(false)
        }
    }

    const progress = (currentStep / STEPS.length) * 100

    const handleSelectCharacter = (char: BattleNetCharacter) => {
        setSelectedBnetCharacter(char)
        step1Form.setValue('characterName', char.name)
        // Use centralized class mapping from wow-classes.ts
        const classSlug = getClassIdFromName(char.className)
        if (classSlug) {
            step2Form.setValue('classId', classSlug)
            step2Form.setValue('specId', '')
            step2Form.setValue('secondarySpecs', [])
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
        setCharacterSearch('')
    }

    return (
        <div className="mx-auto max-w-2xl space-y-10 py-4">
            {/* Character Picker Modal */}
            {showCharacterPicker && fetchedCharacters.length > 0 && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/85 backdrop-blur-md p-4 sm:p-6"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) handleCloseCharacterPicker()
                    }}
                >
                    <BlurFade className="w-full max-w-lg">
                        <GlassCard
                            className="w-full max-h-[85vh] flex flex-col border-white/10 bg-zinc-950/90 shadow-2xl overflow-hidden rounded-3xl"
                            innerClassName="p-0 flex flex-col h-full min-h-0"
                            showBorderBeam
                        >
                            {/* Header */}
                            <div className="relative p-6 pb-4 border-b border-white/5">
                                <button
                                    type="button"
                                    onClick={handleCloseCharacterPicker}
                                    className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                                    aria-label="Fermer"
                                >
                                    <X className="h-5 w-5" />
                                </button>

                                <div className="text-center max-w-xs mx-auto">
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0074e0]/10 border border-[#0074e0]/25 text-xs font-bold uppercase tracking-wider text-[#00AEFF] mb-2">
                                        Battle.net
                                    </div>
                                    <h2 className="text-2xl font-bold text-white tracking-tight">
                                        Choisissez votre personnage
                                    </h2>
                                    <p className="mt-1 text-xs text-zinc-400 font-medium leading-relaxed">
                                        Sélectionnez le champion avec lequel vous candidatez.
                                    </p>
                                </div>

                                {/* Search Bar */}
                                {fetchedCharacters.length > 3 && (
                                    <div className="relative mt-4">
                                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                                        <Input
                                            type="text"
                                            value={characterSearch}
                                            onChange={(e) => setCharacterSearch(e.target.value)}
                                            placeholder="Filtrer par nom, classe, serveur..."
                                            className="h-10 pl-10 pr-9 bg-white/[0.04] border-white/10 text-xs text-white placeholder:text-zinc-500 rounded-xl focus:border-primary/50"
                                        />
                                        {characterSearch && (
                                            <button
                                                type="button"
                                                onClick={() => setCharacterSearch('')}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white rounded-md"
                                                aria-label="Effacer la recherche"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Character List */}
                            <div className="relative flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5 custom-scrollbar">
                                {sortedAndFilteredCharacters.map((char, idx) => {
                                    const classId = getClassIdFromName(char.className)
                                    const wowClass = classId ? getClassById(classId) : null
                                    const classColor = wowClass?.color || (char.faction === 'HORDE' ? '#ef4444' : '#3b82f6')
                                    const classIconUrl = wowClass ? `https://render.worldofwarcraft.com/eu/icons/56/${wowClass.icon}.jpg` : null
                                    const isMaxLevel = char.level >= 80

                                    return (
                                        <button
                                            key={`${char.name}-${char.realm}-${idx}`}
                                            type="button"
                                            onClick={() => handleSelectCharacter(char)}
                                            className="group relative flex w-full items-center gap-3.5 rounded-2xl border border-white/5 bg-white/[0.02] p-3 text-left transition-all hover:bg-white/[0.06] hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-primary/40"
                                        >
                                            {/* Avatar or Class Icon Fallback */}
                                            <div className="relative h-12 w-12 flex-shrink-0">
                                                <div
                                                    className="relative h-full w-full overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-md transition-transform group-hover:scale-105"
                                                    style={{ borderColor: `${classColor}40` }}
                                                >
                                                    {char.avatarUrl ? (
                                                        <img
                                                            src={char.avatarUrl}
                                                            alt={char.name}
                                                            className="h-full w-full object-cover"
                                                            onError={(e) => {
                                                                if (classIconUrl) {
                                                                    (e.target as HTMLImageElement).src = classIconUrl
                                                                } else {
                                                                    (e.target as HTMLImageElement).style.display = 'none'
                                                                }
                                                            }}
                                                        />
                                                    ) : classIconUrl ? (
                                                        <img
                                                            src={classIconUrl}
                                                            alt={wowClass?.nameFr || char.className}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center font-bold text-white bg-zinc-800">
                                                            {char.name.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Class Color Indicator */}
                                                <div
                                                    className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-zinc-950 shadow-sm"
                                                    style={{ backgroundColor: classColor }}
                                                    title={wowClass?.nameFr || char.className}
                                                />
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-white text-base tracking-tight group-hover:text-primary transition-colors truncate">
                                                        {char.name}
                                                    </span>
                                                    <span className={cn(
                                                        "px-2 py-0.5 rounded-md text-[11px] font-semibold shrink-0",
                                                        isMaxLevel
                                                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                                            : "bg-white/5 text-zinc-400 border border-white/5"
                                                    )}>
                                                        Niv. {char.level}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-0.5 text-xs">
                                                    <span className="text-zinc-400 font-medium truncate">{char.realm}</span>
                                                    <span className="w-1 h-1 rounded-full bg-zinc-700 shrink-0" />
                                                    <span
                                                        className="font-semibold shrink-0"
                                                        style={{ color: classColor }}
                                                    >
                                                        {wowClass?.nameFr || char.className}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Action Icon */}
                                            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all text-xs font-semibold text-primary flex items-center gap-1 pr-1">
                                                <span className="hidden sm:inline">Sélectionner</span>
                                                <ChevronRight className="h-4 w-4" />
                                            </div>
                                        </button>
                                    )
                                })}

                                {sortedAndFilteredCharacters.length === 0 && (
                                    <div className="py-12 text-center">
                                        <p className="text-sm font-medium text-zinc-400">
                                            Aucun personnage trouvé pour « {characterSearch} »
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setCharacterSearch('')}
                                            className="mt-2 text-xs font-semibold text-primary hover:underline"
                                        >
                                            Effacer le filtre
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="relative p-3.5 px-6 bg-zinc-950/70 border-t border-white/5 flex items-center justify-between text-xs">
                                <span className="text-zinc-400 font-medium">
                                    {sortedAndFilteredCharacters.length} personnage{sortedAndFilteredCharacters.length > 1 ? 's' : ''} disponible{sortedAndFilteredCharacters.length > 1 ? 's' : ''}
                                </span>
                                <Button
                                    variant="ghost"
                                    className="h-8 px-3 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg"
                                    onClick={handleCloseCharacterPicker}
                                >
                                    Fermer
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
                                    : "border-zinc-800 bg-zinc-900 text-zinc-400"
                            )}>
                                <step.icon className="h-6 w-6" />
                            </div>
                            <span className={cn(
                                "text-xs font-bold uppercase tracking-wider",
                                currentStep >= step.id ? "text-primary" : "text-zinc-400"
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
                <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium px-1">
                    <span>Étape {currentStep} sur {STEPS.length}</span>
                    <span className="inline-flex items-center gap-1.5 text-zinc-400">
                        <Cloud className="h-3.5 w-3.5 text-emerald-400" />
                        {lastSavedAt ? 'Sauvegarde automatique active' : 'Sauvegarde automatique'}
                    </span>
                </div>
            </div>

            {/* Restored Draft Banner */}
            {draftRestored && (
                <BlurFade delay={0.05}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-primary/10 border border-primary/25 backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <span className="flex h-2.5 w-2.5 rounded-full bg-primary animate-pulse shrink-0" />
                            <div className="text-xs">
                                <span className="font-bold text-white">Brouillon restauré automatiquement</span>
                                <p className="text-[11px] text-zinc-400">
                                    Vos réponses précédentes ont été récupérées. Vous pouvez continuer votre saisie.
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleClearDraft}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors self-start sm:self-center shrink-0 cursor-pointer"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            Effacer et recommencer
                        </button>
                    </div>
                </BlurFade>
            )}

            {/* Step Layering */}
            <div className="relative">
                {/* Step 1: Identity */}
                {currentStep === 1 && (
                    <BlurFade delay={0.1}>
                        <GlassCard className="border-white/5" innerClassName="p-8" showBorderBeam>
                            <div className="mb-8">
                                <h1 className="text-3xl font-black text-white mb-2">Formulaire d'apply chez Jet Set Club</h1>
                                <p className="text-zinc-400 font-medium">Veuillez utiliser ce formulaire pour faire une demande d'apply à la guilde Jet Set Club.
                                    Ce formulaire est votre première prise de contact avec nous, prenez en soin! L'ensemble des membres du roster recevront votre apply, pour concertation avant d'aller plus loin!</p>
                            </div>

                            <div className="space-y-8">
                                {/* Battle.net Quick Fill */}
                                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0074e0]/10 via-primary/5 to-transparent p-6 transition-all">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold uppercase tracking-wider text-[#00AEFF]">Battle.net</span>
                                                <span className="text-xs text-zinc-400">· Optionnel</span>
                                            </div>
                                            <p className="text-sm text-zinc-300 font-medium leading-relaxed text-pretty">
                                                Récupérez automatiquement les informations de vos personnages via Battle.net.
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            className="h-11 px-5 shrink-0 gap-2.5 bg-[#0074e0] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#0074e0]/90 shadow-lg rounded-xl"
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
                                            <div className="flex h-5 w-5 items-center justify-center rounded bg-white/10 text-white">
                                                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current"><path d="M19.92 10.76s2.58 1.48 2.58 3.13c0 1.61-3 2.17-6.32 2.01c0 0-1.41 1.97-2.76 2.8c1.46 2.74 2.58 3.8 2.55 3.8c0 0-.74.19-2.97-3.46c-1.34.85-2.83 1.19-3.44.66c-.62-.53-.14-1.42.12-1.85c-.27.15-1.68.98-2.93.98c-1.49 0-1.7-1.11-1.7-1.68C5.05 15 7.12 12 7.12 12s-.96-2.12-1.07-3.78c-1.88-.16-4.05.17-4.52.32c-.13 0 .31-.32.47-.36c.15-.05 1.91-.51 4-.51c0-1.74.35-3.34 1.41-3.34c.72 0 1.3 1.12 1.3 1.12S8.7 1.5 10.74 1.5C12.8 1.5 15 6.11 15 6.11s2.22.21 3.85.98c.65-1.36 1.24-1.98 1.96-4.09c.19.7-.61 2.5-1.46 4.3c0 0 2.3 1.2 2.3 2.53c0 1.01-1.73.93-1.73.93m-9.24 7.82c.68.11 1.73-.48 1.72-.48l-.82-1.53l-1.18.83c-.01.01-.76.98.28 1.18m9.47-8.82c0-.66-1.2-1.41-1.34-1.49l-.92 1.48l1.28.62c.42-.03.98-.02.98-.61M8 5.63c-.3 0-.91.44-.91 2.01l1.74.06l-.11-1.4C8.6 6 8.3 5.63 8 5.63m2.18 10.15c-1.26-.65-2.02-1.72-2.64-2.88c0 0-1.58 2.65-.57 3.32c1.03.67 2.67-.06 3.21-.44m2.79 1.98c1.14-.87 4.22-3.03 4.48-6.68c-2.88-1.64-6.83-2.37-6.83-2.37s-.01-.5.08-.85c.94.11 3.89.61 6.33 1.57c-.68-1.15-1.19-1.58-1.66-1.93c1.16.26 1.99 1.76 1.99 1.76l.92-1.3s-4.37-2.35-8.09-.54c-.08 2.88 1.4 7.14 1.4 7.14l-.77.33c-.52-1.05-1.19-2.8-1.82-6.22c-.3.41-.83.88-.84 2.42c-.46-1.29.5-2.66.51-2.67l-1.6-.16c.1 1.66.98 5.94 3.61 7.27c2.32-1.32 4.82-3.99 5.45-4.76l.69.51l-4.47 4.69c1.24.03 1.97-.25 2.47-.47c-.72.75-1.96.82-2.55.82c.01.02.3.75.7 1.44m1.06-11.71c-.03-.08-1.37-2.36-2.56-2.19c-.78.25-1.23 1.57-1.24 3.01c.53-.31 1.77-.87 3.8-.82m2.68 9.02S20 15 19.9 13.76c0-1.2-1.98-2.43-1.98-2.41c.01 2.12-1.21 3.72-1.21 3.72z" /></svg>
                                            </div>
                                            Se connecter avec Battle.net
                                        </Button>
                                    </div>
                                </div>

                                <div className="relative flex items-center gap-4 py-2">
                                    <div className="h-px flex-1 bg-white/5" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Saisie Manuelle</span>
                                    <div className="h-px flex-1 bg-white/5" />
                                </div>

                                <div className="grid gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="characterName" className="text-xs font-bold uppercase tracking-wider text-zinc-300">Nom de votre personnage *</Label>
                                        <Input
                                            id="characterName"
                                            {...step1Form.register('characterName')}
                                            placeholder="Thrall"
                                            className="h-12 bg-black/40 border-white/5 text-white placeholder:text-zinc-400 focus:border-primary/50 transition-all rounded-xl"
                                        />
                                        {step1Form.formState.errors.characterName && (
                                            <p className="text-xs font-bold text-destructive mt-1">{step1Form.formState.errors.characterName.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="battleTag" className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-zinc-300">
                                            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[#00AEFF]/15 border border-[#00AEFF]/30 shadow-[0_0_8px_rgba(0,174,255,0.2)] text-[#00AEFF]">
                                                <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current"><path d="M19.92 10.76s2.58 1.48 2.58 3.13c0 1.61-3 2.17-6.32 2.01c0 0-1.41 1.97-2.76 2.8c1.46 2.74 2.58 3.8 2.55 3.8c0 0-.74.19-2.97-3.46c-1.34.85-2.83 1.19-3.44.66c-.62-.53-.14-1.42.12-1.85c-.27.15-1.68.98-2.93.98c-1.49 0-1.7-1.11-1.7-1.68C5.05 15 7.12 12 7.12 12s-.96-2.12-1.07-3.78c-1.88-.16-4.05.17-4.52.32c-.13 0 .31-.32.47-.36c.15-.05 1.91-.51 4-.51c0-1.74.35-3.34 1.41-3.34c.72 0 1.3 1.12 1.3 1.12S8.7 1.5 10.74 1.5C12.8 1.5 15 6.11 15 6.11s2.22.21 3.85.98c.65-1.36 1.24-1.98 1.96-4.09c.19.7-.61 2.5-1.46 4.3c0 0 2.3 1.2 2.3 2.53c0 1.01-1.73.93-1.73.93m-9.24 7.82c.68.11 1.73-.48 1.72-.48l-.82-1.53l-1.18.83c-.01.01-.76.98.28 1.18m9.47-8.82c0-.66-1.2-1.41-1.34-1.49l-.92 1.48l1.28.62c.42-.03.98-.02.98-.61M8 5.63c-.3 0-.91.44-.91 2.01l1.74.06l-.11-1.4C8.6 6 8.3 5.63 8 5.63m2.18 10.15c-1.26-.65-2.02-1.72-2.64-2.88c0 0-1.58 2.65-.57 3.32c1.03.67 2.67-.06 3.21-.44m2.79 1.98c1.14-.87 4.22-3.03 4.48-6.68c-2.88-1.64-6.83-2.37-6.83-2.37s-.01-.5.08-.85c.94.11 3.89.61 6.33 1.57c-.68-1.15-1.19-1.58-1.66-1.93c1.16.26 1.99 1.76 1.99 1.76l.92-1.3s-4.37-2.35-8.09-.54c-.08 2.88 1.4 7.14 1.4 7.14l-.77.33c-.52-1.05-1.19-2.8-1.82-6.22c-.3.41-.83.88-.84 2.42c-.46-1.29.5-2.66.51-2.67l-1.6-.16c.1 1.66.98 5.94 3.61 7.27c2.32-1.32 4.82-3.99 5.45-4.76l.69.51l-4.47 4.69c1.24.03 1.97-.25 2.47-.47c-.72.75-1.96.82-2.55.82c.01.02.3.75.7 1.44m1.06-11.71c-.03-.08-1.37-2.36-2.56-2.19c-.78.25-1.23 1.57-1.24 3.01c.53-.31 1.77-.87 3.8-.82m2.68 9.02S20 15 19.9 13.76c0-1.2-1.98-2.43-1.98-2.41c.01 2.12-1.21 3.72-1.21 3.72z" /></svg>
                                            </div>
                                            BattleTag *
                                        </Label>
                                        <Input
                                            id="battleTag"
                                            {...step1Form.register('battleTag')}
                                            placeholder="Joueur#1234"
                                            className="h-12 bg-black/40 border-white/5 text-white placeholder:text-zinc-400 focus:border-primary/50 transition-all rounded-xl"
                                        />
                                        {step1Form.formState.errors.battleTag && (
                                            <p className="text-xs font-bold text-destructive mt-1">{step1Form.formState.errors.battleTag.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="discordId" className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-zinc-300">
                                            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[#5865F2]/15 border border-[#5865F2]/30 shadow-[0_0_8px_rgba(88,101,242,0.2)] text-[#5865F2]">
                                                <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current"><path d="m22 24l-5.25-5l.63 2H4.5A2.5 2.5 0 0 1 2 18.5v-15A2.5 2.5 0 0 1 4.5 1h15A2.5 2.5 0 0 1 22 3.5V24M12 6.8c-2.68 0-4.56 1.15-4.56 1.15c1.03-.92 2.83-1.45 2.83-1.45l-.17-.17c-1.69.03-3.22 1.2-3.22 1.2c-1.72 3.59-1.61 6.69-1.61 6.69c1.4 1.81 3.48 1.68 3.48 1.68l.71-.9c-1.25-.27-2.04-1.38-2.04-1.38S9.3 14.9 12 14.9s4.58-1.28 4.58-1.28s-.79 1.11-2.04 1.38l.71.9s2.08.13 3.48-1.68c0 0 .11-3.1-1.61-6.69c0 0-1.53-1.17-3.22-1.2l-.17.17s1.8.53 2.83 1.45c0 0-1.88-1.15-4.56-1.15m-2.07 3.79c.65 0 1.18.57 1.17 1.27c0 .69-.52 1.27-1.17 1.27c-.64 0-1.16-.58-1.16-1.27c0-.7.51-1.27 1.16-1.27m4.17 0c.65 0 1.17.57 1.17 1.27c0 .69-.52 1.27-1.17 1.27c-.64 0-1.16-.58-1.16-1.27c0-.7.51-1.27 1.16-1.27Z" /></svg>
                                            </div>
                                            ID Discord *
                                        </Label>
                                        <Input
                                            id="discordId"
                                            {...step1Form.register('discordId')}
                                            placeholder="Votre ID Discord"
                                            className="h-12 bg-black/40 border-white/5 text-white placeholder:text-zinc-400 focus:border-primary/50 transition-all rounded-xl"
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
                                <p className="text-zinc-400 font-medium">Dites-nous en plus sur votre personnage et vos faits d'armes.</p>
                            </div>

                            <div className="grid gap-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {selectedBnetCharacter && selectedClass ? (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between h-6">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-300">Classe</Label>
                                                <span className="text-[11px] font-semibold text-zinc-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md leading-none flex items-center">
                                                    Liée à {selectedBnetCharacter.name}
                                                </span>
                                            </div>
                                            <div className="h-12 w-full flex items-center justify-between px-4 rounded-xl border border-white/10 bg-white/[0.03]">
                                                <div className="flex items-center gap-2.5">
                                                    <img
                                                        src={`https://render.worldofwarcraft.com/eu/icons/56/${selectedClass.icon}.jpg`}
                                                        alt={selectedClass.nameFr}
                                                        className="w-5 h-5 rounded border border-white/10 object-cover shrink-0"
                                                    />
                                                    <span style={{ color: selectedClass.color }} className="font-bold text-sm tracking-wide">
                                                        {selectedClass.nameFr}
                                                    </span>
                                                </div>
                                                <span className="text-[11px] text-zinc-500 font-medium">Auto Battle.net</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between h-6">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-300">Classe *</Label>
                                            </div>
                                            <Select
                                                value={step2Form.watch('classId') || undefined}
                                                onValueChange={(value) => {
                                                    step2Form.setValue('classId', value, { shouldValidate: true })
                                                    step2Form.setValue('specId', '', { shouldValidate: true })
                                                    step2Form.setValue('secondarySpecs', [], { shouldValidate: true })
                                                }}
                                            >
                                                <SelectTrigger className="h-12 px-4 w-full bg-black/40 border-white/10 text-white rounded-xl focus:border-primary/50">
                                                    <SelectValue placeholder="Sélectionnez une classe" />
                                                </SelectTrigger>
                                                <SelectContent position="popper" className="bg-zinc-900 border-white/10 z-[100] rounded-xl overflow-hidden max-h-72">
                                                    {WOW_CLASSES.map((wowClass) => (
                                                        <SelectItem
                                                            key={wowClass.id}
                                                            value={wowClass.id}
                                                            className="font-medium cursor-pointer py-2"
                                                        >
                                                            <div className="flex items-center gap-2.5">
                                                                <img
                                                                    src={`https://render.worldofwarcraft.com/eu/icons/56/${wowClass.icon}.jpg`}
                                                                    alt={wowClass.nameFr}
                                                                    className="w-5 h-5 rounded border border-white/10 object-cover shrink-0"
                                                                />
                                                                <span style={{ color: wowClass.color }} className="font-semibold">
                                                                    {wowClass.nameFr}
                                                                </span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between h-6">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-zinc-300">Spécialisation principale *</Label>
                                        </div>
                                        <Select
                                            value={step2Form.watch('specId') || undefined}
                                            onValueChange={(value) => {
                                                step2Form.setValue('specId', value, { shouldValidate: true })
                                                const currentSecondary = step2Form.getValues('secondarySpecs') || []
                                                if (currentSecondary.includes(value)) {
                                                    step2Form.setValue('secondarySpecs', currentSecondary.filter(id => id !== value), { shouldValidate: true })
                                                }
                                            }}
                                            disabled={!selectedClassId}
                                        >
                                            <SelectTrigger className="h-12 px-4 w-full bg-black/40 border-white/10 text-white rounded-xl focus:border-primary/50 disabled:opacity-40 disabled:cursor-not-allowed">
                                                <SelectValue placeholder={selectedClassId ? "Sélectionnez votre spé principale" : "Choisissez d'abord une classe"} />
                                            </SelectTrigger>
                                            <SelectContent position="popper" className="bg-zinc-900 border-white/10 z-[100] rounded-xl max-h-72">
                                                {availableSpecs.map((spec) => {
                                                    const roleBadge =
                                                        spec.role === 'tank'
                                                            ? { label: 'Tank', color: 'text-blue-300 bg-blue-500/15 border-blue-500/30' }
                                                            : spec.role === 'healer'
                                                            ? { label: 'Soigneur', color: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30' }
                                                            : { label: 'DPS', color: 'text-rose-300 bg-rose-500/15 border-rose-500/30' }

                                                    return (
                                                        <SelectItem
                                                            key={spec.id}
                                                            value={spec.id}
                                                            className="font-medium cursor-pointer py-2"
                                                        >
                                                            <div className="flex items-center justify-between w-full gap-3">
                                                                <div className="flex items-center gap-2.5">
                                                                    <img
                                                                        src={`https://render.worldofwarcraft.com/eu/icons/56/${spec.icon}.jpg`}
                                                                        alt={spec.nameFr}
                                                                        className="w-5 h-5 rounded border border-white/10 object-cover shrink-0"
                                                                    />
                                                                    <span className="font-semibold text-white">{spec.nameFr}</span>
                                                                </div>
                                                                <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold border uppercase shrink-0", roleBadge.color)}>
                                                                    {roleBadge.label}
                                                                </span>
                                                            </div>
                                                        </SelectItem>
                                                    )
                                                })}
                                            </SelectContent>
                                        </Select>
                                        {step2Form.formState.errors.specId && (
                                            <p className="text-xs font-bold text-destructive mt-1">{step2Form.formState.errors.specId.message}</p>
                                        )}
                                        {isMainSpecClosed && (
                                            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs mt-2 animate-in fade-in duration-300">
                                                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                                                <div>
                                                    <span className="font-bold text-amber-300">Candidature Spontanée :</span> Le recrutement pour cette spécialisation est actuellement fermé. Votre dossier sera étudié en profil d'exception ou placé sur liste d'attente.
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {selectedClassId && selectedMainSpecId && secondaryOptions.length > 0 && (
                                    <div className="space-y-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                            <div className="flex items-center gap-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                                                    Spécialisations secondaires
                                                </Label>
                                                <span className="text-[10px] font-semibold text-zinc-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                                                    Optionnel
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-zinc-400 font-medium">
                                                Indiquez les spécialisations que vous pouvez jouer en raid si besoin
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                                            {secondaryOptions.map((spec) => {
                                                const isSelected = selectedSecondarySpecs.includes(spec.id)
                                                const roleBadge =
                                                    spec.role === 'tank'
                                                        ? { label: 'Tank', color: 'text-blue-300 bg-blue-500/15 border-blue-500/30' }
                                                        : spec.role === 'healer'
                                                        ? { label: 'Soigneur', color: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30' }
                                                        : { label: 'DPS', color: 'text-rose-300 bg-rose-500/15 border-rose-500/30' }

                                                return (
                                                    <button
                                                        key={spec.id}
                                                        type="button"
                                                        onClick={() => toggleSecondarySpec(spec.id)}
                                                        className={cn(
                                                            "group flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer",
                                                            isSelected
                                                                ? "bg-primary/10 border-primary/40 shadow-[0_0_15px_rgba(var(--primary-rgb),0.12)] text-white"
                                                                : "bg-black/30 border-white/5 text-zinc-400 hover:border-white/15 hover:text-white hover:bg-white/[0.04]"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <img
                                                                src={`https://render.worldofwarcraft.com/eu/icons/56/${spec.icon}.jpg`}
                                                                alt={spec.nameFr}
                                                                className={cn(
                                                                    "w-6 h-6 rounded border object-cover shrink-0 transition-opacity",
                                                                    isSelected ? "border-primary/50 opacity-100" : "border-white/10 opacity-70 group-hover:opacity-100"
                                                                )}
                                                            />
                                                            <div className="min-w-0">
                                                                <div className="text-xs font-bold truncate">
                                                                    {spec.nameFr}
                                                                </div>
                                                                <div className="text-[10px] text-zinc-400 truncate">
                                                                    {roleBadge.label}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="shrink-0 ml-2">
                                                            {isSelected ? (
                                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/20 border border-primary/30 px-2 py-0.5 rounded-md">
                                                                    <Check className="w-3 h-3" />
                                                                    Off-spec
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-400 group-hover:text-zinc-300">
                                                                    <Plus className="w-3 h-3" />
                                                                    Ajouter
                                                                </span>
                                                            )}
                                                        </div>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="warcraftlogsLink" className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                                            Données WarcraftLogs
                                        </Label>
                                        {step2Form.watch('warcraftlogsLink') && (
                                            <a
                                                href={step2Form.watch('warcraftlogsLink')}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline transition-colors"
                                            >
                                                <span>Tester le lien</span>
                                                <ExternalLink className="h-3.5 w-3.5" />
                                            </a>
                                        )}
                                    </div>
                                    <Input
                                        id="warcraftlogsLink"
                                        {...step2Form.register('warcraftlogsLink')}
                                        placeholder="https://www.warcraftlogs.com/character/eu/serveur/nom"
                                        className="h-12 bg-black/40 border-white/5 text-white placeholder:text-zinc-400 rounded-xl focus:border-primary/50"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="raidExperience" className="text-xs font-bold uppercase tracking-wider text-zinc-300">Résumez votre expérience de raid et votre historique de guildes *</Label>
                                    <Textarea
                                        id="raidExperience"
                                        {...step2Form.register('raidExperience')}
                                        placeholder="Inutile de nous mentionner votre expérience Vanilla/BC/Wotlk & cie, c'est chouette, mais c'est plus vraiment pertinent :)"
                                        className="min-h-[120px] bg-black/40 border-white/5 text-white placeholder:text-zinc-400 rounded-xl p-4"
                                    />
                                    {step2Form.formState.errors.raidExperience && (
                                        <p className="text-xs font-bold text-destructive mt-1">{step2Form.formState.errors.raidExperience.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-zinc-300">Capture d'écran de votre UI</Label>
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
                                <p className="text-zinc-400 font-medium">Histoire d'en savoir un peu plus!</p>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <Label htmlFor="aboutMe" className="text-xs font-bold uppercase tracking-wider text-zinc-300">Parlez-nous un peu de vous! *</Label>
                                    <p className="text-xs text-zinc-400 font-medium mb-2">
                                        L'âge, ce que vous faites dans la vie et vos intérêts en dehors de jouer à WoW
                                    </p>
                                    <Textarea
                                        id="aboutMe"
                                        {...step3Form.register('aboutMe')}
                                        placeholder="Votre histoire commence ici..."
                                        className="min-h-[100px] bg-black/40 border-white/5 text-white placeholder:text-zinc-400 rounded-xl p-4"
                                    />
                                    {step3Form.formState.errors.aboutMe && (
                                        <p className="text-xs font-bold text-destructive mt-1">{step3Form.formState.errors.aboutMe.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="whyJSC" className="text-xs font-bold uppercase tracking-wider text-zinc-300">L'Appel du Club *</Label>
                                    <p className="text-xs text-zinc-400 font-medium mb-2">
                                        Qu'est ce qu'il vous plait chez Jet Set Club?
                                    </p>
                                    <Textarea
                                        id="whyJSC"
                                        {...step3Form.register('whyJSC')}
                                        placeholder="Votre vision du Club..."
                                        className="min-h-[100px] bg-black/40 border-white/5 text-white placeholder:text-zinc-400 rounded-xl p-4"
                                    />
                                    {step3Form.formState.errors.whyJSC && (
                                        <p className="text-xs font-bold text-destructive mt-1">{step3Form.formState.errors.whyJSC.message}</p>
                                    )}
                                </div>

                                <div className="relative overflow-hidden rounded-2xl bg-primary/[0.04] p-6">
                                    <Label htmlFor="motivation" className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary mb-2">
                                        <Target className="h-4 w-4" /> Le mot de la fin *
                                    </Label>
                                    <p className="text-xs text-zinc-400 font-medium mb-4 leading-relaxed">
                                        Exprimez-vous ! C'est votre chance de capter notre attention et de nous montrer votre personnalité. <br></br>Nous y accordons beaucoup d'importance!
                                    </p>
                                    <Textarea
                                        id="motivation"
                                        {...step3Form.register('motivation')}
                                        placeholder="C'est le moment de briller..."
                                        className="min-h-[140px] bg-black/40 border-white/5 text-white placeholder:text-zinc-400 rounded-xl p-4 focus:border-primary/50"
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
                    className="h-12 px-8 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-20 rounded-xl"
                >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Retour
                </Button>

                {currentStep < 3 ? (
                    <Button
                        onClick={handleNext}
                        className="h-14 px-10 bg-white/5 border border-white/10 text-white text-xs font-bold uppercase tracking-wider hover:bg-white/10 hover:border-primary/50 transition-all rounded-xl shadow-2xl group"
                    >
                        Procéder
                        <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                ) : (
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="h-14 px-10 bg-primary text-black text-xs font-bold uppercase tracking-wider hover:scale-105 transition-all rounded-xl shadow-[0_0_30px_rgba(var(--primary),0.3)]"
                    >
                        {isSubmitting ? 'Transmission...' : 'Enrôler'}
                        <Send className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    )
}
