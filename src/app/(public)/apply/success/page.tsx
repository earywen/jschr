'use client'

import { CheckCircle2, RotateCcw, Home } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BlurFade } from '@/components/ui/blur-fade'

export default function ApplySuccessPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 overflow-hidden relative">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

            <BlurFade delay={0.2} className="w-full max-w-lg z-10">
                <div className="bg-black/40 backdrop-blur-xl border border-white/5 p-12 rounded-[2.5rem] shadow-2xl space-y-8 text-center">
                    <div className="flex justify-center relative">
                        <div className="relative group">
                            <img
                                src="/logo jsc.png"
                                alt="Jet Set Club Logo"
                                className="h-32 w-auto object-contain drop-shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-black p-2 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] border-4 border-black group-hover:scale-110 transition-transform duration-500">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Candidature transmise</p>
                            <h1 className="text-4xl font-black text-white tracking-tighter sm:text-5xl">
                                Bienvenue, <span className="text-primary italic">Aspirant</span>.
                            </h1>
                        </div>
                        <p className="text-zinc-500 leading-relaxed text-sm max-w-sm mx-auto">
                            Votre profil a été envoyé au Jet Set Club. Nos officiers examineront votre demande prochainement. Surveillez vos messages sur <span className="text-white font-bold">Discord</span>.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button
                            asChild
                            variant="outline"
                            className="flex-1 h-14 bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                        >
                            <Link href="/" className="gap-2">
                                <Home className="h-4 w-4" />
                                Accueil
                            </Link>
                        </Button>
                        <Button
                            asChild
                            className="flex-1 h-14 bg-primary text-black hover:bg-primary/90 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all"
                        >
                            <Link href="/apply" className="gap-2">
                                <RotateCcw className="h-4 w-4" />
                                Recommencer
                            </Link>
                        </Button>
                    </div>
                </div>
            </BlurFade>
        </div>
    )
}
