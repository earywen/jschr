'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CandidateWithDetails } from '@/lib/actions/candidates-queries'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Clock, CheckCircle, XCircle, Pause, ChevronRight, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { deleteCandidates } from '@/lib/actions/candidates'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from 'sonner'
import { DeleteCandidateButton } from '@/components/candidates/delete-candidate-button'

interface ListProps {
    candidates: CandidateWithDetails[]
    userRole?: string
}

import { GlassCard } from "@/components/ui/glass-card"
import { NeonBadge } from "@/components/ui/neon-badge"
import { BlurFade } from "@/components/ui/blur-fade"
import { SafeImage } from "@/components/ui/safe-image"

const statusConfig = {
    pending: {
        label: 'En Attente',
        icon: Clock,
        variant: 'pending' as const,
    },
    accepted: {
        label: 'Acceptée',
        icon: CheckCircle,
        variant: 'success' as const,
    },
    rejected: {
        label: 'Refusée',
        icon: XCircle,
        variant: 'destructive' as const,
    },
    waitlist: {
        label: 'Waitlist',
        icon: Pause,
        variant: 'secondary' as const,
    },
}

export function CandidatesList({ candidates, userRole }: ListProps) {
    const router = useRouter()
    const isGM = userRole === 'gm'
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [isDeleting, setIsDeleting] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(candidates.map(c => c.id))
        } else {
            setSelectedIds([])
        }
    }

    const handleSelectOne = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id])
        } else {
            setSelectedIds(prev => prev.filter(selectedId => selectedId !== id))
        }
    }

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return
        setIsDeleting(true)
        try {
            const result = await deleteCandidates(selectedIds)
            if (result.success) {
                toast.success(`${selectedIds.length} candidature(s) supprimée(s)`)
                setSelectedIds([])
                router.refresh()
            } else {
                toast.error(result.error || 'Erreur lors de la suppression')
            }
        } catch (error) {
            toast.error('Une erreur est survenue')
        } finally {
            setIsDeleting(false)
            setShowDeleteDialog(false)
        }
    }

    if (candidates.length === 0) {
        return (
            <GlassCard className="p-12 text-center">
                <p className="text-zinc-400">Aucune candidature trouvée.</p>
            </GlassCard>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header / Bulk Actions */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    {isGM && (
                        <div className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-3 py-1.5 backdrop-blur-md">
                            <Checkbox
                                id="select-all"
                                checked={selectedIds.length === candidates.length && candidates.length > 0}
                                onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                            />
                            <label htmlFor="select-all" className="text-sm font-medium text-zinc-400 cursor-pointer">
                                Tout sélectionner
                            </label>
                        </div>
                    )}
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                        {candidates.length} Candidature{candidates.length > 1 ? 's' : ''}
                    </h2>
                </div>

                {selectedIds.length > 0 && isGM && (
                    <BlurFade delay={0.1}>
                        <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 backdrop-blur-md">
                            <span className="text-sm font-medium text-red-200">
                                {selectedIds.length} sélectionnée{selectedIds.length > 1 ? 's' : ''}
                            </span>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setShowDeleteDialog(true)}
                                className="h-8 gap-2 bg-red-600 hover:bg-red-500"
                                disabled={isDeleting}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                Supprimer
                            </Button>
                        </div>
                    </BlurFade>
                )}
            </div>

            {/* Grid View */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {candidates.map((candidate, idx) => {
                    const status = statusConfig[candidate.status]
                    const isSelected = selectedIds.includes(candidate.id)

                    return (
                        <BlurFade key={candidate.id} delay={idx * 0.05}>
                            <GlassCard
                                className={cn(
                                    "group h-full cursor-pointer border-white/5 hover:border-white/20 hover:bg-white/[0.04] transition-all",
                                    isSelected && "border-[var(--primary)]/50 bg-[var(--primary)]/5 shadow-[0_0_20px_rgba(var(--primary),0.1)]"
                                )}
                                showBorderBeam={isSelected}
                                onClick={() => router.push(`/dashboard/candidates/${candidate.id}`)}
                                innerClassName="p-5 flex flex-col gap-4"
                            >
                                {/* Card Header */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="relative h-12 w-12 overflow-hidden rounded-xl border-2 shadow-lg"
                                            style={{ borderColor: candidate.wow_class?.color || '#666' }}
                                        >
                                            <div
                                                className="absolute inset-0 flex items-center justify-center text-lg font-bold"
                                                style={{
                                                    backgroundColor: `${candidate.wow_class?.color}20` || '#333',
                                                    color: candidate.wow_class?.color || '#fff'
                                                }}
                                            >
                                                {candidate.name.charAt(0)}
                                            </div>
                                            {candidate.avatar_url && (
                                                <SafeImage
                                                    src={candidate.avatar_url}
                                                    alt={candidate.name}
                                                    className="relative z-10 h-full w-full object-cover"
                                                />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white group-hover:text-[var(--primary)] transition-colors">
                                                {candidate.name}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-semibold" style={{ color: candidate.wow_class?.color }}>
                                                    {candidate.wow_spec?.name} {candidate.wow_class?.name}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {isGM && (
                                        <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-1">
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={(checked) => handleSelectOne(candidate.id, checked as boolean)}
                                                className="h-5 w-5 border-white/20 data-[state=checked]:bg-[var(--primary)]"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Card Stats Grid */}
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="rounded-lg bg-black/20 p-2 border border-white/5">
                                        <p className="text-[10px] uppercase text-zinc-500 font-bold">Item Level</p>
                                        <p className="font-mono text-sm text-zinc-200">{candidate.wlogs_ilvl || '???'}</p>
                                    </div>
                                    <div className="rounded-lg bg-black/20 p-2 border border-white/5">
                                        <p className="text-[10px] uppercase text-zinc-500 font-bold">Logs Score</p>
                                        <p className="text-sm font-bold" style={{ color: candidate.wlogs_color || '#999' }}>
                                            {candidate.wlogs_score ? Math.round(candidate.wlogs_score) : '-'}
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-black/20 p-2 border border-white/5">
                                        <p className="text-[10px] uppercase text-zinc-500 font-bold">M+ Score</p>
                                        <p className="text-sm font-bold" style={(function () {
                                            const score = candidate.wlogs_mythic_plus_score!;
                                            let color = '#ffffff';
                                            if (score >= 3000) color = '#ff8000';
                                            else if (score >= 2500) color = '#a335ee';
                                            else if (score >= 2000) color = '#0070dd';
                                            else if (score >= 1000) color = '#1eff00';
                                            return { color };
                                        })()}>
                                            {candidate.wlogs_mythic_plus_score ? Math.round(candidate.wlogs_mythic_plus_score) : '-'}
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-black/20 p-2 border border-white/5 overflow-hidden">
                                        <p className="text-[10px] uppercase text-zinc-500 font-bold">Progress</p>
                                        <p className="text-sm font-medium text-zinc-300 truncate">{candidate.wlogs_raid_progress || '-'}</p>
                                    </div>
                                </div>

                                {/* Card Footer */}
                                <div className="flex items-center justify-between mt-auto pt-2">
                                    <NeonBadge variant={status.variant} className="gap-1.5 py-1 px-3">
                                        <status.icon className="h-3 w-3" />
                                        {status.label}
                                    </NeonBadge>
                                    <span className="text-[10px] text-zinc-500 font-medium italic">
                                        Posté {formatDistanceToNow(new Date(candidate.created_at), { addSuffix: true, locale: fr })}
                                    </span>
                                </div>

                                {isGM && (
                                    <div className="absolute right-2 bottom-12 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                        <DeleteCandidateButton candidateId={candidate.id} />
                                    </div>
                                )}
                            </GlassCard>
                        </BlurFade>
                    )
                })}
            </div>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-400">
                            Vous êtes sur le point de supprimer définivement{' '}
                            <span className="font-semibold text-white">{selectedIds.length}</span>{' '}
                            candidature(s). Cette action est irréversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:text-white">
                            Annuler
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault()
                                handleBulkDelete()
                            }}
                            className="bg-red-900 text-red-100 hover:bg-red-800"
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Suppression...' : 'Supprimer définitivement'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

