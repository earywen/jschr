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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
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
import { ChevronLeft, ChevronRight, Send, User, Sword, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
    { id: 1, name: 'Identité', icon: User },
    { id: 2, name: 'Personnage', icon: Sword },
    { id: 3, name: 'Motivation', icon: MessageSquare },
]

interface WizardProps {
    onSubmit: (data: ApplicationFormData) => Promise<void>
}

interface BattleNetCharacter {
    name: string
    realm: string
    level: number
    classId: number
    className: string
    faction: string
}

// Map Blizzard class names to our internal IDs
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

export function ApplicationWizard({ onSubmit }: WizardProps) {
    const [currentStep, setCurrentStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState<Partial<ApplicationFormData>>({})
    const [fetchedCharacters, setFetchedCharacters] = useState<BattleNetCharacter[]>([])
    const [showCharacterPicker, setShowCharacterPicker] = useState(false)

    // Step 1 Form
    const step1Form = useForm<IdentityFormData>({
        resolver: zodResolver(identitySchema),
        defaultValues: formData,
    })

    // Step 2 Form
    const step2Form = useForm<CharacterFormData>({
        resolver: zodResolver(characterSchema),
        defaultValues: formData,
    })

    // Step 3 Form
    const step3Form = useForm<MotivationFormData>({
        resolver: zodResolver(motivationSchema),
        defaultValues: formData,
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
        // Auto-generate WarcraftLogs link based on character
        const realm = char.realm.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '')
        const wlogsLink = `https://www.warcraftlogs.com/character/eu/${realm}/${char.name.toLowerCase()}`
        step2Form.setValue('warcraftlogsLink', wlogsLink)
    }

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            {/* Character Picker Modal */}
            {showCharacterPicker && fetchedCharacters.length > 0 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                    <Card className="mx-4 max-h-[80vh] w-full max-w-lg overflow-hidden border-amber-500/50 bg-zinc-900">
                        <CardHeader>
                            <CardTitle className="text-white">Choisissez votre personnage</CardTitle>
                            <CardDescription className="text-zinc-400">
                                Sélectionnez le personnage que vous souhaitez inscrire
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="max-h-[50vh] overflow-y-auto space-y-2 p-4">
                            {fetchedCharacters.map((char, idx) => (
                                <button
                                    key={`${char.name}-${char.realm}-${idx}`}
                                    onClick={() => handleSelectCharacter(char)}
                                    className="flex w-full items-center justify-between rounded-lg border border-zinc-700 bg-zinc-800 p-3 text-left transition-colors hover:border-amber-500 hover:bg-zinc-700"
                                >
                                    <div>
                                        <p className="font-medium text-white">{char.name}</p>
                                        <p className="text-sm text-zinc-400">{char.realm} • {char.className}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-amber-400">Niv. {char.level}</p>
                                        <p className="text-xs text-zinc-500">{char.faction}</p>
                                    </div>
                                </button>
                            ))}
                        </CardContent>
                        <div className="border-t border-zinc-800 p-4">
                            <Button
                                variant="outline"
                                className="w-full border-zinc-700 text-zinc-300"
                                onClick={() => setShowCharacterPicker(false)}
                            >
                                Annuler
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
            {/* Progress Header */}
            <div className="space-y-4">
                <div className="flex justify-between">
                    {STEPS.map((step) => (
                        <div
                            key={step.id}
                            className={cn(
                                'flex items-center gap-2 text-sm font-medium',
                                currentStep >= step.id ? 'text-amber-400' : 'text-zinc-500'
                            )}
                        >
                            <step.icon className="h-5 w-5" />
                            <span className="hidden sm:inline">{step.name}</span>
                        </div>
                    ))}
                </div>
                <Progress value={progress} className="h-2 bg-zinc-800" />
            </div>

            {/* Step 1: Identity */}
            {currentStep === 1 && (
                <Card className="border-zinc-800 bg-zinc-900">
                    <CardHeader>
                        <CardTitle className="text-white">Identité</CardTitle>
                        <CardDescription className="text-zinc-400">
                            Comment devons-nous vous appeler ?
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Battle.net Quick Fill */}
                        <div className="rounded-lg border border-blue-600/30 bg-blue-600/5 p-4">
                            <p className="mb-3 text-sm text-blue-300">
                                🎮 Connectez-vous avec Battle.net pour remplir automatiquement
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full gap-2 border-blue-600 bg-blue-600/10 text-blue-400 hover:bg-blue-600/20"
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
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                </svg>
                                Connecter avec Battle.net
                            </Button>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-zinc-700" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-zinc-900 px-2 text-zinc-500">ou remplir manuellement</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="characterName" className="text-zinc-200">
                                Nom du personnage *
                            </Label>
                            <Input
                                id="characterName"
                                {...step1Form.register('characterName')}
                                placeholder="Thrall"
                                className="bg-zinc-950 border-zinc-800 text-white"
                            />
                            {step1Form.formState.errors.characterName && (
                                <p className="text-sm text-red-400">
                                    {step1Form.formState.errors.characterName.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="battleTag" className="text-zinc-200">
                                BattleTag (optionnel)
                            </Label>
                            <Input
                                id="battleTag"
                                {...step1Form.register('battleTag')}
                                placeholder="Joueur#1234"
                                className="bg-zinc-950 border-zinc-800 text-white"
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 2: Character */}
            {currentStep === 2 && (
                <Card className="border-zinc-800 bg-zinc-900">
                    <CardHeader>
                        <CardTitle className="text-white">Personnage</CardTitle>
                        <CardDescription className="text-zinc-400">
                            Quelle est votre classe et spécialisation ?
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-zinc-200">Classe *</Label>
                            <Select
                                value={step2Form.watch('classId') || ''}
                                onValueChange={(value) => {
                                    step2Form.setValue('classId', value)
                                    step2Form.setValue('specId', '') // Reset spec when class changes
                                }}
                            >
                                <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white">
                                    <SelectValue placeholder="Sélectionnez une classe" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-800">
                                    {WOW_CLASSES.map((wowClass) => (
                                        <SelectItem
                                            key={wowClass.id}
                                            value={wowClass.id}
                                            className="text-white hover:bg-zinc-800"
                                        >
                                            <span style={{ color: wowClass.color }}>{wowClass.name}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {step2Form.formState.errors.classId && (
                                <p className="text-sm text-red-400">
                                    {step2Form.formState.errors.classId.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-zinc-200">Spécialisation *</Label>
                            <Select
                                value={step2Form.watch('specId') || ''}
                                onValueChange={(value) => step2Form.setValue('specId', value)}
                                disabled={!selectedClassId}
                            >
                                <SelectTrigger
                                    className="bg-zinc-950 border-zinc-800 text-white"
                                    style={{ borderColor: selectedClass?.color }}
                                >
                                    <SelectValue placeholder="Sélectionnez une spécialisation" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-800">
                                    {availableSpecs.map((spec) => (
                                        <SelectItem
                                            key={spec.id}
                                            value={spec.id}
                                            className="text-white hover:bg-zinc-800"
                                        >
                                            {spec.name} ({spec.role})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {step2Form.formState.errors.specId && (
                                <p className="text-sm text-red-400">
                                    {step2Form.formState.errors.specId.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="warcraftlogsLink" className="text-zinc-200">
                                Lien WarcraftLogs (optionnel)
                            </Label>
                            <Input
                                id="warcraftlogsLink"
                                {...step2Form.register('warcraftlogsLink')}
                                placeholder="https://classic.warcraftlogs.com/character/..."
                                className="bg-zinc-950 border-zinc-800 text-white"
                            />
                            {step2Form.formState.errors.warcraftlogsLink && (
                                <p className="text-sm text-red-400">
                                    {step2Form.formState.errors.warcraftlogsLink.message}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 3: Motivation */}
            {currentStep === 3 && (
                <Card className="border-zinc-800 bg-zinc-900">
                    <CardHeader>
                        <CardTitle className="text-white">Motivation</CardTitle>
                        <CardDescription className="text-zinc-400">
                            Pourquoi souhaitez-vous rejoindre notre guilde ?
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="motivation" className="text-zinc-200">
                                Votre motivation *
                            </Label>
                            <Textarea
                                id="motivation"
                                {...step3Form.register('motivation')}
                                placeholder="Parlez-nous de vous, de votre expérience, de vos objectifs..."
                                className="min-h-[200px] bg-zinc-950 border-zinc-800 text-white"
                            />
                            {step3Form.formState.errors.motivation && (
                                <p className="text-sm text-red-400">
                                    {step3Form.formState.errors.motivation.message}
                                </p>
                            )}
                            <p className="text-xs text-zinc-500">
                                Minimum 50 caractères
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between">
                <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Retour
                </Button>

                {currentStep < 3 ? (
                    <Button
                        onClick={handleNext}
                        className="bg-amber-500 text-black hover:bg-amber-400"
                    >
                        Suivant
                        <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                ) : (
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-green-600 text-white hover:bg-green-500"
                    >
                        {isSubmitting ? 'Envoi...' : 'Soumettre'}
                        <Send className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    )
}
