'use client'

import { useState } from 'react'
import {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import {
    Calendar,
    Users,
    Mic,
    Youtube,
    Sparkles,
    ShieldCheck,
    ExternalLink,
    ChevronRight,
    BookOpen,
} from 'lucide-react'

export function GuildManifestoSheet() {
    const [open, setOpen] = useState(false)

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            {/* Top Compact Pills Bar (Schedule & Roster size) */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8 px-4">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-[11px] sm:text-xs text-zinc-300 backdrop-blur-md">
                    <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Jeudi & Lundi · 20h45 - 23h45</span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-[11px] sm:text-xs text-zinc-300 backdrop-blur-md">
                    <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Roster de 24-25 (Rotation équitable)</span>
                </div>
            </div>

            {/* Fixed Floating Tab docked on the right side of the screen */}
            <SheetTrigger asChild>
                <button
                    type="button"
                    aria-label="Ouvrir le manifeste de la guilde"
                    className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex items-center gap-2 py-3 px-2 sm:px-2.5 rounded-l-2xl bg-zinc-950/95 border-y border-l border-primary/30 text-zinc-300 hover:text-white hover:border-primary/70 shadow-[0_0_25px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-all cursor-pointer group hover:translate-x-[-4px]"
                >
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 border border-primary/30 text-primary group-hover:scale-110 transition-transform">
                            <BookOpen className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 group-hover:text-primary transition-colors [writing-mode:vertical-lr] rotate-180 py-1">
                            L'Esprit du Club
                        </span>
                    </div>
                </button>
            </SheetTrigger>

            {/* Slide-over Sheet Content (Side Panel on the right) */}
            <SheetContent
                side="right"
                className="w-full sm:max-w-md md:max-w-lg bg-zinc-950/95 border-l border-white/10 text-white backdrop-blur-2xl overflow-y-auto p-6 sm:p-8 space-y-6 custom-scrollbar"
            >
                <SheetHeader className="p-0 space-y-2 text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-bold uppercase tracking-wider text-primary w-fit">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Depuis Mists of Pandaria</span>
                    </div>
                    <SheetTitle className="text-2xl font-black text-white tracking-tight">
                        Raider peu, mais bien.
                    </SheetTitle>
                    <SheetDescription className="text-xs text-zinc-400 font-medium leading-relaxed">
                        Notre approche pionnière du raid 2 soirs par semaine, dédiée à l'efficacité en Mythique et au respect de l'équilibre personnel.
                    </SheetDescription>
                </SheetHeader>

                {/* YouTube Callout */}
                <div className="p-4 rounded-2xl bg-red-500/[0.08] border border-red-500/25 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-red-400 uppercase tracking-wider">
                            <Youtube className="w-4 h-4 fill-current" />
                            <span>Chaîne YouTube Officielle</span>
                        </div>
                        <p className="text-[11px] text-zinc-300">
                            Découvrez nos boss kills et l'ambiance vocale du raid.
                        </p>
                    </div>
                    <Button
                        asChild
                        size="sm"
                        className="h-8 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold uppercase tracking-wider shrink-0 gap-1.5 shadow-md"
                    >
                        <a href="https://www.youtube.com/@wowJSC/videos" target="_blank" rel="noopener noreferrer">
                            <span>Voir (@wowJSC)</span>
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </Button>
                </div>

                {/* Key Pillars */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                        Nos 3 Piliers Fondamentaux
                    </h3>

                    {/* Pillar 1 */}
                    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5">
                        <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
                                <Calendar className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-xs font-bold text-white">2 Soirs / Semaine stricts</span>
                        </div>
                        <p className="text-[11px] text-zinc-300 leading-relaxed pl-9">
                            <strong className="text-white">Jeudi & Lundi (20h45 - 23h45)</strong> avec pause de 10 min à 22h. Aucun soir bonus mythique imprévu. Le mercredi est réservé au raid HM optionnel sans obligation de présence.
                        </p>
                    </div>

                    {/* Pillar 2 */}
                    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5">
                        <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                                <Users className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-xs font-bold text-white">Roster de 24 à 25 joueurs</span>
                        </div>
                        <p className="text-[11px] text-zinc-300 leading-relaxed pl-9">
                            Rotation équitable sur chaque palier pour garantir l'engagement et le temps de jeu de chacun. Les adaptations par boss restent des exceptions.
                        </p>
                    </div>

                    {/* Pillar 3 */}
                    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5">
                        <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
                                <Mic className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-xs font-bold text-white">Vocal & Collégialité</span>
                        </div>
                        <p className="text-[11px] text-zinc-300 leading-relaxed pl-9">
                            Micro obligatoire pour une coordination fluide. Les décisions majeures de guilde sont débattues et prises de manière collégiale.
                        </p>
                    </div>
                </div>

                {/* Full Manifesto Text */}
                <div className="space-y-4 pt-4 border-t border-white/5 text-xs text-zinc-300 leading-relaxed">
                    <div className="space-y-1.5">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                            Bienvenue au Jet Set Club !
                        </h4>
                        <p className="text-zinc-400 text-[11px]">
                            Depuis nos premiers jours dans les brumes de Pandaria, nous avons été pionniers dans l'approche du raid deux soirs par semaine, un format mettant en avant l'efficacité tout en respectant l'équilibre entre le jeu et nos vies personnelles. Notre guilde est un groupe de joueurs soudés, dédiée à la progression dans le contenu mythique et unie par notre passion pour World of Warcraft.
                        </p>
                    </div>

                    <div className="space-y-1.5">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                            Philosophie de Recrutement
                        </h4>
                        <p className="text-zinc-400 text-[11px]">
                            Le Jet Set Club recherche activement des joueurs passionnés et engagés, prêts à s'immerger dans notre culture de "raider peu, mais bien". Avec une équipe d'environ 24-25 joueurs à chaque palier, nous valorisons la contribution individuelle au succès collectif. Si vous êtes motivé et prêt à vous joindre à notre aventure, nous vous accueillerons à bras ouverts.
                        </p>
                    </div>

                    <div className="space-y-1.5">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                            Nos attentes envers les candidats
                        </h4>
                        <ul className="space-y-1 text-zinc-400 text-[11px] pl-3 list-disc">
                            <li><strong className="text-zinc-200">Présence :</strong> Présent jeudis et lundis 20h45-23h45. Pas de soirs bonus mythiques.</li>
                            <li><strong className="text-zinc-200">Excellence :</strong> Exceller dans votre classe, recherche d'amélioration continue. Un CE ou des logs récents sont un réel plus.</li>
                            <li><strong className="text-zinc-200">Esprit de groupe :</strong> Participer activement et sainement à la vie de la guilde.</li>
                            <li><strong className="text-zinc-200">Communication :</strong> Utilisation indispensable d'un micro opérationnel en raid.</li>
                        </ul>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
