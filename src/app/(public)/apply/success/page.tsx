'use client'

import { CheckCircle2, Home } from 'lucide-react'
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
                                Félicitations!
                            </h1>
                        </div>
                        <p className="text-zinc-500 leading-relaxed text-sm max-w-sm mx-auto">
                            Votre profil a été envoyé au Jet Set Club. Nos officiers examineront votre demande prochainement. Surveillez vos messages sur <span className="text-white font-bold">Discord</span>.
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-4 pt-4">
                        <Button
                            asChild
                            className="h-14 w-72 bg-[#5865F2] text-white hover:bg-[#5865F2]/90 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(88,101,242,0.4)] transition-all hover:scale-105"
                        >
                            <Link href="https://discord.com/users/155437093659607040" target="_blank" rel="noopener noreferrer" className="gap-2">
                                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419z" />
                                </svg>
                                Ajouter Earywen
                            </Link>
                        </Button>

                        <Button
                            asChild
                            variant="ghost"
                            className="h-14 w-72 text-zinc-500 hover:text-white hover:bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                        >
                            <Link href="/" className="gap-2">
                                <Home className="h-4 w-4" />
                                Accueil
                            </Link>
                        </Button>
                    </div>
                </div>
            </BlurFade>
        </div>
    )
}
