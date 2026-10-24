'use client'

import { ApplicationWizard } from '@/components/apply/application-wizard'
import { ApplicationFormData } from '@/lib/validations/application'
import { submitApplication } from '@/lib/actions/candidates'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { BlurFade } from '@/components/ui/blur-fade'
import { RecruitmentBoard } from '@/components/recruitment/recruitment-board'
import { GuildManifestoSheet } from '@/components/recruitment/guild-presentation'
import { RecruitmentNeed } from '@/lib/actions/recruitment'
import { Youtube } from 'lucide-react'

interface ApplyContentProps {
    needs: RecruitmentNeed[]
}

export function ApplyContent({ needs }: ApplyContentProps) {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (data: ApplicationFormData) => {
        try {
            setError(null)
            const result = await submitApplication(data)

            if (!result.success) {
                setError(result.error || 'Une erreur est survenue')
                return
            }

            router.push('/apply/success')
        } catch (err) {
            setError('Une erreur est survenue. Veuillez réessayer.')
            console.error(err)
        }
    }

    return (
        <div className="min-h-screen bg-zinc-950 px-4 py-8 sm:py-12 relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 transform scale-150" />
            </div>

            <div className="relative z-10">
                {/* Header */}
                <BlurFade delay={0.05}>
                    <div className="mx-auto max-w-2xl text-center mb-6">
                        <div className="flex justify-center mb-4">
                            <img
                                src="/logo jsc.png"
                                alt="Jet Set Club Logo"
                                className="h-20 sm:h-24 w-auto object-contain drop-shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-3xl font-black text-white tracking-tighter sm:text-5xl leading-[0.9] text-balance">
                                Rejoignez le <span className="text-primary italic">Jet Set Club</span>.
                            </h1>
                        </div>
                    </div>
                </BlurFade>

                {/* Guild Presentation Drawer (Compact Pill Bar + Fixed Right Side-Tab) */}
                <GuildManifestoSheet />

                {/* Recruitment Board */}
                <RecruitmentBoard initialNeeds={needs} />

                {error && (
                    <BlurFade delay={0.1}>
                        <div className="mx-auto max-w-2xl mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-center">
                            <p className="text-xs font-black uppercase tracking-widest text-red-400">{error}</p>
                        </div>
                    </BlurFade>
                )}

                {/* Wizard (Formulaire central héros) */}
                <ApplicationWizard onSubmit={handleSubmit} needs={needs} />

                {/* Footer */}
                <div className="mt-12 flex flex-col items-center justify-center gap-2 text-center text-xs font-medium text-zinc-400 uppercase tracking-widest">
                    <a
                        href="https://www.youtube.com/@wowJSC/videos"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-red-400 transition-colors normal-case text-xs"
                    >
                        <Youtube className="w-4 h-4 text-red-500" />
                        <span>Notre chaîne Youtube</span>
                    </a>
                    <p>&copy; 2026 JET SET CLUB · TOUS DROITS RÉSERVÉS</p>
                </div>
            </div>
        </div>
    )
}
