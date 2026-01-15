'use client'

import { useEffect, useState } from 'react'
import { getRecruitmentNeeds, RecruitmentNeed } from '@/lib/actions/recruitment'
import { BlurFade } from '@/components/ui/blur-fade'
import { NeonBadge as Badge } from '@/components/ui/neon-badge'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { WOW_CLASSES } from '@/lib/data/wow-classes'

// Map priorities to colors
const PRIORITY_STYLES = {
    high: 'bg-red-500/10 text-red-500 border-red-500/20',
    medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    low: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    closed: 'bg-zinc-800 text-zinc-500 border-zinc-700'
}

const PRIORITY_LABELS = {
    high: 'Urgent',
    medium: 'Ouvert',
    low: 'Faible',
    closed: 'Fermé'
}

interface RecruitmentBoardProps {
    initialNeeds: RecruitmentNeed[]
}

export function RecruitmentBoard({ initialNeeds }: RecruitmentBoardProps) {
    const [activeTooltip, setActiveTooltip] = useState<string | null>(null)
    const needs = initialNeeds




    // Group needs by Class Name to easily find active classes
    const needsByClass = needs.reduce((acc, need) => {
        const className = need.class.name
        if (!acc[className]) acc[className] = []
        acc[className].push(need)
        return acc
    }, {} as Record<string, RecruitmentNeed[]>)

    // Helper to get CDN icon URL
    const getIconUrl = (iconName: string) =>
        `https://render.worldofwarcraft.com/eu/icons/56/${iconName}.jpg`

    return (
        <section className="mb-12">
            <BlurFade delay={0.2}>
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-2">
                        Classes Recherchées
                    </h2>
                    <p className="text-zinc-500 text-xs">
                        Survolez les classes pour voir les spécialisations
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-3 md:gap-4 max-w-4xl mx-auto px-4">
                    <TooltipProvider delayDuration={0}>
                        {WOW_CLASSES.map((wowClass) => {
                            const classNeeds = needsByClass[wowClass.name] || []
                            const isActive = classNeeds.length > 0
                            const isTooltipOpen = activeTooltip === wowClass.id

                            return (
                                <Tooltip
                                    key={wowClass.id}
                                    open={isTooltipOpen}
                                    onOpenChange={(open) => {
                                        if (!open) setActiveTooltip(null)
                                    }}
                                >
                                    <TooltipTrigger asChild>
                                        <div
                                            onClick={() => setActiveTooltip(isTooltipOpen ? null : wowClass.id)}
                                            onMouseEnter={() => setActiveTooltip(wowClass.id)}
                                            onMouseLeave={() => setActiveTooltip(null)}
                                            className={`
                                                relative cursor-pointer transition-all duration-300 rounded-xl p-1
                                                ${isActive
                                                    ? 'opacity-100 hover:scale-110 hover:z-10'
                                                    : 'opacity-20 grayscale hover:opacity-40'
                                                }
                                            `}
                                        >
                                            <img
                                                src={getIconUrl(wowClass.icon)}
                                                alt={wowClass.name}
                                                className={`
                                                    w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover shadow-lg
                                                    ${isActive ? 'border-2' : 'border border-white/10'}
                                                `}
                                                style={isActive ? { borderColor: wowClass.color, boxShadow: `0 0 15px -5px ${wowClass.color}` } : undefined}
                                                onError={(e) => {
                                                    // Fallback if icon fails
                                                    (e.target as HTMLImageElement).src = "https://render.worldofwarcraft.com/eu/icons/56/inv_misc_questionmark.jpg"
                                                }}
                                            />
                                            {/* Small indicator dot for active classes */}
                                            {isActive && (
                                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: wowClass.color }}></span>
                                                    <span className="relative inline-flex rounded-full h-3 w-3" style={{ backgroundColor: wowClass.color }}></span>
                                                </span>
                                            )}
                                        </div>
                                    </TooltipTrigger>

                                    {isActive && (
                                        <TooltipContent side="bottom" className="border-zinc-800 bg-zinc-950/95 text-zinc-100 backdrop-blur-xl p-3 shadow-2xl z-50">
                                            <div className="space-y-3 min-w-[200px]">
                                                {/* Tooltip Header */}
                                                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                                                    <img src={getIconUrl(wowClass.icon)} className="w-5 h-5 rounded-full" alt="" />
                                                    <p className="font-bold text-sm" style={{ color: wowClass.color }}>
                                                        {wowClass.name}
                                                    </p>
                                                </div>

                                                {/* Specs List */}
                                                <div className="space-y-2">
                                                    {classNeeds
                                                        .sort((a, b) => { // Sort by priority inside tooltip
                                                            const p = { high: 0, medium: 1, low: 2, closed: 3 }
                                                            return p[a.priority] - p[b.priority]
                                                        })
                                                        .map(need => (
                                                            <div key={need.specId} className="flex items-center justify-between gap-4">
                                                                <div className="flex items-center gap-2">
                                                                    <img
                                                                        src={getIconUrl(need.spec.icon)}
                                                                        className="w-5 h-5 rounded border border-white/10"
                                                                        alt=""
                                                                    />
                                                                    <span className="text-sm font-medium text-zinc-300">
                                                                        {need.spec.name}
                                                                    </span>
                                                                </div>
                                                                <Badge className={`${PRIORITY_STYLES[need.priority]} uppercase text-[10px] h-5`}>
                                                                    {PRIORITY_LABELS[need.priority]}
                                                                </Badge>
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            )
                        })}
                    </TooltipProvider>
                </div>
            </BlurFade>
        </section>
    )
}
