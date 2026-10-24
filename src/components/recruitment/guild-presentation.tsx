'use client'

import { useState } from 'react'
import { BlurFade } from '@/components/ui/blur-fade'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import {
    Calendar,
    Users,
    Mic,
    Youtube,
    ChevronDown,
    ChevronUp,
    Sparkles,
    ShieldCheck,
    CheckCircle2,
    ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function GuildPresentation() {
    const [isManifestoOpen, setIsManifestoOpen] = useState(false)

    return (
        <section className="mb-10 max-w-4xl mx-auto px-4">
            <BlurFade delay={0.15}>
                <GlassCard className="border-white/10 bg-zinc-950/70 overflow-hidden" innerClassName="p-6 sm:p-8" showBorderBeam>
                    {/* Header badge & title */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
                        <div className="space-y-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-bold uppercase tracking-wider text-primary">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Pionniers du format 2 soirs · Depuis Mists of Pandaria</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                Raider peu, mais bien.
                            </h2>
                            <p className="text-xs sm:text-sm text-zinc-400 font-medium">
                                Une progression Mythique efficace respectant scrupuleusement l'équilibre avec vos vies personnelles.
                            </p>
                        </div>

                        {/* YouTube channel button */}
                        <Button
                            asChild
                            variant="outline"
                            className="h-11 px-4 rounded-xl border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-white hover:text-red-300 text-xs font-bold uppercase tracking-wider transition-all shrink-0 self-start sm:self-center group shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                        >
                            <a
                                href="https://www.youtube.com/@wowJSC/videos"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2.5"
                            >
                                <div className="flex h-5 w-5 items-center justify-center rounded bg-red-600 text-white group-hover:scale-110 transition-transform">
                                    <Youtube className="h-3.5 w-3.5 fill-current" />
                                </div>
                                <span>Nos kills en vidéo</span>
                                <ExternalLink className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100" />
                            </a>
                        </Button>
                    </div>

                    {/* Key pillars grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
                        {/* Pillar 1: Schedule */}
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 hover:border-primary/20 transition-colors">
                            <div className="flex items-center gap-2.5">
                                <div className="h-9 w-9 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
                                    <Calendar className="h-4 w-4" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">2 Soirs / Semaine</h3>
                                    <span className="text-[11px] text-zinc-400 font-medium">Jeudi & Lundi · 20h45 - 23h45</span>
                                </div>
                            </div>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                Pause de 10 min à 22h. Jamais de soirs bonus mythiques imprévus. Le mercredi est dédié au raid HM (optionnel et sans obligation).
                            </p>
                        </div>

                        {/* Pillar 2: Roster */}
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 hover:border-primary/20 transition-colors">
                            <div className="flex items-center gap-2.5">
                                <div className="h-9 w-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                                    <Users className="h-4 w-4" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">Roster de 24-25</h3>
                                    <span className="text-[11px] text-zinc-400 font-medium">Rotation équitable</span>
                                </div>
                            </div>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                Un roulement juste pour garantir l'engagement de tous. Les ajustements spécifiques par boss restent l'exception.
                            </p>
                        </div>

                        {/* Pillar 3: Vocal & Collective */}
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 hover:border-primary/20 transition-colors">
                            <div className="flex items-center gap-2.5">
                                <div className="h-9 w-9 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
                                    <Mic className="h-4 w-4" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">Micro & Décisions</h3>
                                    <span className="text-[11px] text-zinc-400 font-medium">Vocal actif & Collégialité</span>
                                </div>
                            </div>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                Micro obligatoire en raid pour la coordination. Les décisions majeures de guilde sont prises de manière collégiale.
                            </p>
                        </div>
                    </div>

                    {/* Expandable manifesto */}
                    <div className="mt-6 pt-4 border-t border-white/5">
                        <button
                            type="button"
                            onClick={() => setIsManifestoOpen(!isManifestoOpen)}
                            className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 text-xs font-bold uppercase tracking-wider text-zinc-300 transition-colors cursor-pointer"
                        >
                            <span className="flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-primary" />
                                {isManifestoOpen ? 'Masquer le manifeste de la guilde' : 'Lire le manifeste complet du Jet Set Club'}
                            </span>
                            {isManifestoOpen ? (
                                <ChevronUp className="h-4 w-4 text-zinc-400" />
                            ) : (
                                <ChevronDown className="h-4 w-4 text-zinc-400" />
                            )}
                        </button>

                        {isManifestoOpen && (
                            <div className="mt-4 p-5 rounded-2xl bg-black/40 border border-white/5 text-xs text-zinc-300 space-y-4 animate-in fade-in duration-300">
                                <div className="space-y-2">
                                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                                        Bienvenue au Jet Set Club !
                                    </h4>
                                    <p className="leading-relaxed text-zinc-400">
                                        Depuis nos premiers jours dans les brumes de Pandaria, nous avons été pionniers dans l'approche du raid deux soirs par semaine, un format mettant en avant l'efficacité tout en respectant l'équilibre entre le jeu et nos vies personnelles. Notre guilde est un groupe de joueurs soudés, dédiée à la progression dans le contenu mythique et unie par notre passion pour World of Warcraft.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                                        Philosophie de Recrutement
                                    </h4>
                                    <p className="leading-relaxed text-zinc-400">
                                        Le Jet Set Club recherche activement des joueurs passionnés et engagés, prêts à s'immerger dans notre culture de "raider peu, mais bien". Avec une équipe d'environ 24-25 joueurs à chaque palier, nous valorisons la contribution individuelle au succès collectif. Si vous êtes motivé et prêt à vous joindre à notre aventure, nous vous accueillerons à bras ouverts.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                                        Nos attentes
                                    </h4>
                                    <ul className="space-y-1.5 text-zinc-400 pl-4 list-disc">
                                        <li>
                                            <strong className="text-zinc-200">Présence aux raids :</strong> Présent les jeudis et lundis de 20h45 à 23h45, avec une pause de 10 min à 22h. Nous ne pratiquons pas de raids supplémentaires en format mythique (le mercredi est dédié au raid HM, sans obligation de présence). Nous sommes résolument une guilde 2 soirs/semaine, sans mauvaises surprises de soirs bonus.
                                        </li>
                                        <li>
                                            <strong className="text-zinc-200">Maîtrise & Amélioration :</strong> Exceller dans votre classe et poursuivre une amélioration continue. Un Cutting Edge (CE) ou des logs récents constituent un réel plus.
                                        </li>
                                        <li>
                                            <strong className="text-zinc-200">Esprit d'équipe :</strong> Participer activement à la vie de la guilde en communiquant de manière constructive.
                                        </li>
                                        <li>
                                            <strong className="text-zinc-200">Communication vocale :</strong> L'utilisation d'un micro pour communiquer en raid est obligatoire pour la coordination collective.
                                        </li>
                                    </ul>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                                        Gestion du Roster & Prise de Décisions
                                    </h4>
                                    <p className="leading-relaxed text-zinc-400">
                                        Notre équipe (24-25 joueurs) adopte une rotation équitable pour garantir l'engagement de tous. Bien que notre structure comprenne par défaut un maître de guilde / raid leader, les décisions sont majoritairement prises de manière collégiale avec l'ensemble du groupe.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </GlassCard>
            </BlurFade>
        </section>
    )
}
