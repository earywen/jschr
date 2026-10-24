'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Home, Youtube, Copy, Check, ExternalLink, Clock, MessageSquare, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BlurFade } from '@/components/ui/blur-fade'

export default function ApplySuccessPage() {
    const [copiedBnet, setCopiedBnet] = useState(false)
    const [copiedDiscord, setCopiedDiscord] = useState(false)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                localStorage.removeItem('jsc_apply_draft_v1')
                localStorage.removeItem('jsc_apply_draft_v2')
            } catch (e) {}
        }
    }, [])

    const handleCopy = async (text: string, type: 'bnet' | 'discord') => {
        try {
            await navigator.clipboard.writeText(text)
            if (type === 'bnet') {
                setCopiedBnet(true)
                setTimeout(() => setCopiedBnet(false), 2000)
            } else {
                setCopiedDiscord(true)
                setTimeout(() => setCopiedDiscord(false), 2000)
            }
        } catch (e) {
            console.error('Failed to copy text', e)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-12 overflow-hidden relative">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-[140px] rounded-full pointer-events-none" />

            <BlurFade delay={0.2} className="w-full max-w-xl z-10">
                <div className="bg-black/50 backdrop-blur-xl border border-white/10 p-8 sm:p-12 rounded-[2.5rem] shadow-2xl space-y-8 text-center">
                    {/* Logo & status */}
                    <div className="flex justify-center relative">
                        <div className="relative group">
                            <img
                                src="/logo jsc.png"
                                alt="Jet Set Club Logo"
                                className="h-28 w-auto object-contain drop-shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-black p-2 rounded-xl shadow-lg border-4 border-black group-hover:scale-110 transition-transform duration-500">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                        </div>
                    </div>

                    {/* Congratulation text */}
                    <div className="space-y-3">
                        <h1 className="text-3xl font-black text-white tracking-tighter sm:text-4xl text-balance">
                            Candidature transmise !
                        </h1>
                        <p className="text-zinc-400 leading-relaxed text-sm max-w-md mx-auto">
                            Votre candidature a bien été reçue par le <span className="text-white font-bold">Jet Set Club</span>. L'ensemble des membres et officiers va pouvoir consulter votre dossier.
                        </p>
                    </div>

                    {/* Timeline & expectations card */}
                    <div className="text-left rounded-2xl bg-white/[0.03] border border-white/5 p-5 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                            <Clock className="w-4 h-4" />
                            <span>Prochaines étapes & Délais</span>
                        </div>
                        <ul className="space-y-2.5 text-xs text-zinc-300">
                            <li className="flex items-start gap-2.5">
                                <span className="flex h-5 w-5 rounded-full bg-primary/20 text-primary font-bold items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                                <div>
                                    <strong className="text-white">Vote consultatif & Examen :</strong> Votre dossier est soumis au vote consultatif du roster et à l'analyse des officiers sous <span className="text-emerald-400 font-semibold">48h à 72h</span>.
                                </div>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <span className="flex h-5 w-5 rounded-full bg-primary/20 text-primary font-bold items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                                <div>
                                    <strong className="text-white">Prise de contact :</strong> Si votre profil est retenu, nous vous contacterons directement sur Discord pour planifier un entretien vocal.
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Direct contacts with Earywen */}
                    <div className="space-y-3 text-left">
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block text-center sm:text-left">
                            Contact Recrutement (Earywen)
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Discord Contact */}
                            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#5865F2]/10 border border-[#5865F2]/25">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="h-8 w-8 rounded-lg bg-[#5865F2] text-white flex items-center justify-center shrink-0">
                                        <MessageSquare className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <span className="text-[10px] uppercase font-bold text-zinc-400 block">Discord</span>
                                        <span className="text-xs font-bold text-white truncate block">garmouzze</span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleCopy('garmouzze', 'discord')}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer shrink-0 ml-2"
                                    title="Copier le pseudo Discord"
                                >
                                    {copiedDiscord ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                                </button>
                            </div>

                            {/* BattleTag Contact */}
                            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#00AEFF]/10 border border-[#00AEFF]/25">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="h-8 w-8 rounded-lg bg-[#0074e0] text-white flex items-center justify-center shrink-0">
                                        <ShieldCheck className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <span className="text-[10px] uppercase font-bold text-zinc-400 block">BattleTag</span>
                                        <span className="text-xs font-bold text-white truncate block">GarmouZze#2322</span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleCopy('GarmouZze#2322', 'bnet')}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer shrink-0 ml-2"
                                    title="Copier le BattleTag"
                                >
                                    {copiedBnet ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* YouTube teaser */}
                    <div className="p-4 rounded-2xl bg-red-500/[0.05] border border-red-500/20 text-center space-y-2">
                        <div className="inline-flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider">
                            <Youtube className="w-4 h-4 fill-current" />
                            <span>En attendant notre réponse</span>
                        </div>
                        <p className="text-xs text-zinc-400">
                            Découvrez l'ambiance de nos raids et nos derniers boss kills en vidéo sur notre chaîne YouTube !
                        </p>
                        <Button
                            asChild
                            variant="outline"
                            className="h-10 px-4 rounded-xl border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-white text-xs font-bold uppercase tracking-wider transition-all"
                        >
                            <a
                                href="https://www.youtube.com/@wowJSC/videos"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2"
                            >
                                <span>Voir nos vidéos (@wowJSC)</span>
                                <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                        </Button>
                    </div>

                    {/* Back to Home */}
                    <div className="pt-2">
                        <Button
                            asChild
                            variant="ghost"
                            className="h-12 w-full text-zinc-400 hover:text-white hover:bg-white/5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all"
                        >
                            <Link href="/" className="gap-2 justify-center">
                                <Home className="h-4 w-4" />
                                Retour à l'accueil
                            </Link>
                        </Button>
                    </div>
                </div>
            </BlurFade>
        </div>
    )
}
