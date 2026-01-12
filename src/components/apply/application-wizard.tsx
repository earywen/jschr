'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { WOW_CLASSES, getSpecsByClass, getClassById } from '@/lib/data/wow-classes'
import {
    identitySchema,
    characterSchema,
    motivationSchema,
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

const CLASS_NAME_MAP: Record<string, string> = {
    'Warrior': 'warrior',
    'Guerrier': 'warrior',
    'Paladin': 'paladin',
    'Hunter': 'hunter',
    'Chasseur': 'hunter',
    'Rogue': 'rogue',
    'Voleur': 'rogue',
    'Priest': 'priest',
    'Prêtre': 'priest',
    'Death Knight': 'death-knight',
    'Chevalier de la mort': 'death-knight',
    'Shaman': 'shaman',
    'Chaman': 'shaman',
    'Mage': 'mage',
    'Warlock': 'warlock',
    'Démoniste': 'warlock',
    'Monk': 'monk',
    'Moine': 'monk',
    'Druid': 'druid',
    'Druide': 'druid',
    'Demon Hunter': 'demon-hunter',
    'Chasseur de démons': 'demon-hunter',
    'Evoker': 'evoker',
    'Évocateur': 'evoker',
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
            const finalData = {
                ...formData,
                ...step3Form.getValues(),
            } as ApplicationFormData
            await onSubmit(finalData)
            setIsSubmitting(false)
        }
    }

    const progress = (currentStep / STEPS.length) * 100

    const handleSelectCharacter = (char: BattleNetCharacter) => {
        step1Form.setValue('characterName', char.name)
        const classSlug = CLASS_NAME_MAP[char.className] || ''
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <BlurFade>
                        <GlassCard className="mx-4 max-h-[80vh] w-full max-w-lg border-primary/20 bg-black/40" innerClassName="p-0">
                            <CardHeader className="p-6">
                                <CardTitle className="text-2xl font-black text-white">Choisissez votre Champion</CardTitle>
                                <CardDescription className="text-zinc-400">
                                    Sélectionnez le personnage que vous souhaitez enrôler
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="max-h-[50vh] overflow-y-auto space-y-2 p-6 pt-0">
                                {fetchedCharacters.map((char, idx) => (
                                    <button
                                        key={`${char.name}-${char.realm}-${idx}`}
                                        onClick={() => handleSelectCharacter(char)}
                                        className="group flex w-full items-center gap-4 rounded-xl border border-white/5 bg-white/5 p-4 text-left transition-all hover:border-primary/50 hover:bg-white/10"
                                    >
                                        <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border-2 border-white/10 shadow-xl group-hover:border-primary/50 group-hover:scale-105 transition-all">
                                            <div className="absolute inset-0 z-0 flex items-center justify-center bg-zinc-800 text-xl font-bold text-zinc-500">
                                                {char.name.charAt(0)}
                                            </div>
                                            {char.avatarUrl && (
                                                <img
                                                    src={char.avatarUrl}
                                                    alt={char.name}
                                                    className="relative z-10 h-full w-full object-cover"
                                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                                                />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-white group-hover:text-primary transition-colors text-lg">{char.name}</p>
                                            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{char.realm} • {char.className}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-sm font-black text-primary">Niv. {char.level}</p>
                                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">{char.faction === 'HORDE' ? '🔴 Horde' : '🔵 Alliance'}</p>
                                        </div>
                                    </button>
                                ))}
                            </CardContent>
                            <div className="border-t border-white/5 p-6">
                                <Button
                                    variant="ghost"
                                    className="w-full text-zinc-500 hover:text-white"
                                    onClick={() => setShowCharacterPicker(false)}
                                >
                                    Annuler
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
                                <h1 className="text-3xl font-black text-white mb-2">L'Aspirant</h1>
                                <p className="text-zinc-500 font-medium">Laissez votre empreinte dans les archives de Jet Set Club.</p>
                            </div>

                            <div className="space-y-8">
                                {/* Battle.net Quick Fill */}
                                <div className="group relative overflow-hidden rounded-2xl border border-primary/30 bg-primary/5 p-6 transition-all hover:bg-primary/10">
                                    <div className="absolute -right-4 -top-4 text-primary/10 opacity-20 group-hover:scale-110 transition-transform">
                                        <Sword className="h-24 w-24" />
                                    </div>
                                    <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-primary mb-2">
                                        <LayoutGrid className="h-4 w-4" /> Nexus Battle.net
                                    </h4>
                                    <p className="mb-6 text-sm text-zinc-400 font-medium leading-relaxed">
                                        Exploitez le Nexus pour synchroniser instantanément vos faits d'armes et votre identité.
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
                                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-black/10">
                                            <Send className="h-4 w-4" />
                                        </div>
                                        Synchroniser le Profil
                                    </Button>
                                </div>

                                <div className="relative flex items-center gap-4 py-2">
                                    <div className="h-px flex-1 bg-white/5" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Saisie Manuelle</span>
                                    <div className="h-px flex-1 bg-white/5" />
                                </div>

                                <div className="grid gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="characterName" className="text-xs font-black uppercase tracking-widest text-zinc-500">Nom du Champion *</Label>
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
                                        <Label htmlFor="battleTag" className="text-xs font-black uppercase tracking-widest text-zinc-500">BattleTag *</Label>
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
                                        <Label htmlFor="discordId" className="text-xs font-black uppercase tracking-widest text-zinc-500">Discord Code *</Label>
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
                                <h1 className="text-3xl font-black text-white mb-2">L'Arsenal</h1>
                                <p className="text-zinc-500 font-medium">Définissez votre spécialisation et vos accomplissements.</p>
                            </div>

                            <div className="grid gap-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-zinc-500">Vocation *</Label>
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
                                    <Label htmlFor="raidExperience" className="text-xs font-black uppercase tracking-widest text-zinc-500">Chroniques de Raid *</Label>
                                    <Textarea
                                        id="raidExperience"
                                        {...step2Form.register('raidExperience')}
                                        placeholder="Évoquez vos victoires passées et votre expérience en guilde..."
                                        className="min-h-[120px] bg-black/40 border-white/5 text-white placeholder:text-zinc-700 rounded-xl p-4"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="screenshotUrl" className="text-xs font-black uppercase tracking-widest text-zinc-500">Preuve d'Interface</Label>
                                        <a
                                            href="https://imgur.com/upload"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-tighter text-primary hover:text-primary/80 transition-all"
                                        >
                                            <ExternalLink className="h-3 w-3" /> Transmettre vers Imgur
                                        </a>
                                    </div>
                                    <Input
                                        id="screenshotUrl"
                                        {...step2Form.register('screenshotUrl')}
                                        placeholder="https://imgur.com/..."
                                        className="h-12 bg-black/40 border-white/5 text-white placeholder:text-zinc-700 rounded-xl"
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
                                <h1 className="text-3xl font-black text-white mb-2">La Stratégie</h1>
                                <p className="text-zinc-500 font-medium">Présentez l'esprit derrière le champion.</p>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <Label htmlFor="aboutMe" className="text-xs font-black uppercase tracking-widest text-zinc-500">Profil du Joueur *</Label>
                                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter mb-2">
                                        Âge, occupation, fragments de vie IRL...
                                    </p>
                                    <Textarea
                                        id="aboutMe"
                                        {...step3Form.register('aboutMe')}
                                        placeholder="Votre histoire commence ici..."
                                        className="min-h-[100px] bg-black/40 border-white/5 text-white placeholder:text-zinc-700 rounded-xl p-4"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="whyJSC" className="text-xs font-black uppercase tracking-widest text-zinc-500">L'Appel du Club *</Label>
                                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter mb-2">
                                        Qu'avez-vous ressenti en voyant l'emblème Jet Set Club ?
                                    </p>
                                    <Textarea
                                        id="whyJSC"
                                        {...step3Form.register('whyJSC')}
                                        placeholder="Votre vision du Club..."
                                        className="min-h-[100px] bg-black/40 border-white/5 text-white placeholder:text-zinc-700 rounded-xl p-4"
                                    />
                                </div>

                                <div className="relative group overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 p-6">
                                    <Label htmlFor="motivation" className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-primary mb-4">
                                        <Target className="h-4 w-4" /> Le Manifeste *
                                    </Label>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter mb-4 leading-relaxed">
                                        Ce message sera votre première transmission sur les canaux de la Guilde.
                                        Donnez-leur une raison de vous choisir. (Min. 50 char)
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
                    Backtrack
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
