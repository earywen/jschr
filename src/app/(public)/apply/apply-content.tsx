'use client'

import { ApplicationWizard } from '@/components/apply/application-wizard'
import { ApplicationFormData } from '@/lib/validations/application'
import { submitApplication } from '@/lib/actions/candidates' // Make sure this is safe to import in client component (it should be a server action)
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { BlurFade } from '@/components/ui/blur-fade'
import { RecruitmentBoard } from '@/components/recruitment/recruitment-board'
import { RecruitmentNeed } from '@/lib/actions/recruitment'

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
        <div className="min-h-screen bg-zinc-950 px-4 py-12 relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 transform scale-150" />
            </div>

            <div className="relative z-10">
                {/* Header */}
                <BlurFade delay={0.1}>
                    <div className="mx-auto max-w-2xl text-center mb-12">
                        <div className="flex justify-center mb-8">
                            <img
                                src="/logo jsc.png"
                                alt="Jet Set Club Logo"
                                className="h-28 w-auto object-contain drop-shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:scale-110 transition-transform duration-700"
                            />
                        </div>
                        <div className="space-y-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Formulaire d'apply</p>
                            <h1 className="text-4xl font-black text-white tracking-tighter sm:text-5xl leading-[0.9]">
                                Rejoignez le <span className="text-primary italic">Jet Set Club</span>.
                            </h1>

                        </div>
                    </div>
                </BlurFade>

                {/* Recruitment Board */}
                <RecruitmentBoard initialNeeds={needs} />

                {error && (
                    <BlurFade delay={0.2}>
                        <div className="mx-auto max-w-2xl mb-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
                            <p className="text-xs font-black uppercase tracking-widest text-red-400">{error}</p>
                        </div>
                    </BlurFade>
                )}

                {/* Wizard */}
                <ApplicationWizard onSubmit={handleSubmit} />

                <p className="mt-12 text-center text-[10px] font-bold text-zinc-700 uppercase tracking-[0.4em]">
                    &copy; 2026 JET SET CLUB
                </p>
            </div>
        </div>
    )
}
