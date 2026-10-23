'use client'

import { useState } from 'react'
import { AdminRecruitmentSpec, updateRecruitmentPriority } from '@/lib/actions/recruitment'
import { cn } from '@/lib/utils'
import { Loader2, Check } from 'lucide-react'

interface RecruitmentEditorProps {
    initialSpecs: AdminRecruitmentSpec[]
}

const PRIORITIES: Array<{
    id: 'high' | 'medium' | 'low' | 'closed'
    label: string
    color: string
    activeClass: string
}> = [
    { id: 'high', label: 'Élevé', color: 'text-rose-400', activeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm' },
    { id: 'medium', label: 'Moyen', color: 'text-amber-400', activeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm' },
    { id: 'low', label: 'Faible', color: 'text-emerald-400', activeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm' },
    { id: 'closed', label: 'Fermé', color: 'text-zinc-500', activeClass: 'bg-zinc-800 text-zinc-400 border-zinc-700' },
]

export function RecruitmentEditor({ initialSpecs }: RecruitmentEditorProps) {
    const [specs, setSpecs] = useState<AdminRecruitmentSpec[]>(initialSpecs)
    const [updatingSpecId, setUpdatingSpecId] = useState<string | null>(null)
    const [lastSavedSpecId, setLastSavedSpecId] = useState<string | null>(null)

    // Group specs by class
    const groupedClasses = specs.reduce((acc, spec) => {
        if (!acc[spec.className]) {
            acc[spec.className] = {
                name: spec.className,
                nameFr: spec.classNameFr,
                color: spec.classColor,
                icon: spec.classIcon,
                specs: [],
            }
        }
        acc[spec.className].specs.push(spec)
        return acc
    }, {} as Record<string, { name: string; nameFr: string; color: string; icon: string; specs: AdminRecruitmentSpec[] }>)

    const handlePriorityChange = async (specId: string, newPriority: 'high' | 'medium' | 'low' | 'closed') => {
        setUpdatingSpecId(specId)
        setLastSavedSpecId(null)

        // Optimistic update
        setSpecs(prev => prev.map(s => s.specId === specId ? { ...s, priority: newPriority } : s))

        const res = await updateRecruitmentPriority(specId, newPriority)
        setUpdatingSpecId(null)

        if (res.success) {
            setLastSavedSpecId(specId)
            setTimeout(() => setLastSavedSpecId(null), 2500)
        } else {
            console.error('Failed to update priority:', res.error)
            // Rollback if needed
            setSpecs(initialSpecs)
        }
    }

    const getIconUrl = (iconName: string) => `https://render.worldofwarcraft.com/eu/icons/56/${iconName}.jpg`

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <p className="text-sm text-zinc-400">
                    Ajustez les priorités par classe et spécialisation. Les modifications s'appliquent en direct au formulaire public.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {Object.values(groupedClasses).map(cls => (
                    <div
                        key={cls.name}
                        className="rounded-2xl border border-white/5 bg-[#12131C] p-4 flex flex-col justify-between"
                    >
                        {/* Class Header */}
                        <div className="flex items-center gap-2.5 mb-3">
                            <img
                                src={getIconUrl(cls.icon)}
                                alt={cls.nameFr}
                                className="w-6 h-6 rounded-md object-cover border border-white/10"
                                onError={(e) => {
                                    ;(e.target as HTMLImageElement).src = 'https://render.worldofwarcraft.com/eu/icons/56/inv_misc_questionmark.jpg'
                                }}
                            />
                            <span className="font-bold text-sm tracking-wide" style={{ color: cls.color }}>
                                {cls.nameFr}
                            </span>
                        </div>

                        {/* Specs List */}
                        <div className="space-y-2">
                            {cls.specs.map(spec => {
                                const isUpdating = updatingSpecId === spec.specId
                                const isSaved = lastSavedSpecId === spec.specId

                                return (
                                    <div
                                        key={spec.specId}
                                        className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/[0.02] border border-white/5"
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <img
                                                src={getIconUrl(spec.specIcon)}
                                                alt={spec.specNameFr}
                                                className="w-5 h-5 rounded-full object-cover shrink-0"
                                                onError={(e) => {
                                                    ;(e.target as HTMLImageElement).src = 'https://render.worldofwarcraft.com/eu/icons/56/inv_misc_questionmark.jpg'
                                                }}
                                            />
                                            <span className="text-xs font-medium text-zinc-200 truncate">
                                                {spec.specNameFr}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1 shrink-0">
                                            {isUpdating ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400 mr-2" />
                                            ) : isSaved ? (
                                                <Check className="w-3.5 h-3.5 text-emerald-400 mr-2" />
                                            ) : null}

                                            {PRIORITIES.map(p => {
                                                const isActive = spec.priority === p.id
                                                return (
                                                    <button
                                                        key={p.id}
                                                        type="button"
                                                        onClick={() => handlePriorityChange(spec.specId, p.id)}
                                                        disabled={isUpdating}
                                                        className={cn(
                                                            "px-2 py-0.5 text-[10px] font-semibold rounded-md transition-all border",
                                                            isActive
                                                                ? p.activeClass
                                                                : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                                                        )}
                                                    >
                                                        {p.label}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
