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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
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

const statusConfig = {
    pending: {
        label: 'En Attente',
        icon: Clock,
        className: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    accepted: {
        label: 'Acceptée',
        icon: CheckCircle,
        className: 'text-green-400 bg-green-500/10 border-green-500/20',
    },
    rejected: {
        label: 'Refusée',
        icon: XCircle,
        className: 'text-red-400 bg-red-500/10 border-red-500/20',
    },
    waitlist: {
        label: 'Waitlist',
        icon: Pause,
        className: 'text-zinc-400 bg-zinc-600/10 border-zinc-500/20',
    },
}

export function CandidatesList({ candidates, userRole }: ListProps) {
    const router = useRouter()
    const isGM = userRole === 'gm'
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [isDeleting, setIsDeleting] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    // Select All handler
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(candidates.map(c => c.id))
        } else {
            setSelectedIds([])
        }
    }

    // Single Select handler
    const handleSelectOne = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id])
        } else {
            setSelectedIds(prev => prev.filter(selectedId => selectedId !== id))
        }
    }

    // Bulk Delete handler
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
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-8 text-center">
                <p className="text-zinc-400">Aucune candidature trouvée.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Bulk Actions Toolbar */}
            {selectedIds.length > 0 && isGM && (
                <div className="flex items-center justify-between rounded-lg border border-red-900/50 bg-red-950/20 px-4 py-2">
                    <span className="text-sm text-red-200">
                        {selectedIds.length} candidature{selectedIds.length > 1 ? 's' : ''} sélectionnée{selectedIds.length > 1 ? 's' : ''}
                    </span>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setShowDeleteDialog(true)}
                        className="gap-2"
                        disabled={isDeleting}
                    >
                        <Trash2 className="h-4 w-4" />
                        Supprimer la sélection
                    </Button>
                </div>
            )}

            <div className="rounded-md border border-zinc-800 bg-zinc-900 overflow-hidden">
                <Table>
                    <TableHeader className="bg-zinc-900/50">
                        <TableRow className="hover:bg-transparent border-zinc-800">
                            {isGM && (
                                <TableHead className="w-[40px] px-4">
                                    <Checkbox
                                        checked={selectedIds.length === candidates.length && candidates.length > 0}
                                        onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                                        aria-label="Tout sélectionner"
                                    />
                                </TableHead>
                            )}
                            <TableHead className="text-zinc-400">Candidat</TableHead>
                            <TableHead className="text-zinc-400">Classe & Spé</TableHead>
                            <TableHead className="text-zinc-400">iLvl</TableHead>
                            <TableHead className="text-zinc-400">WLogs Score</TableHead>
                            <TableHead className="text-zinc-400">Score MM+</TableHead>
                            <TableHead className="text-zinc-400">Progress</TableHead>
                            <TableHead className="text-zinc-400">Statut</TableHead>
                            <TableHead className="text-right text-zinc-400">Depuis</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                            {isGM && <TableHead className="w-[50px]"></TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {candidates.map((candidate) => {
                            const status = statusConfig[candidate.status]
                            const StatusIcon = status.icon
                            const isSelected = selectedIds.includes(candidate.id)

                            return (
                                <TableRow
                                    key={candidate.id}
                                    className={cn(
                                        "border-zinc-800 hover:bg-zinc-800/50 cursor-pointer group transition-colors",
                                        isSelected && "bg-zinc-800/80 hover:bg-zinc-800/90"
                                    )}
                                    onClick={() => router.push(`/dashboard/candidates/${candidate.id}`)}
                                >
                                    {isGM && (
                                        <TableCell className="px-4" onClick={(e) => e.stopPropagation()}>
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={(checked) => handleSelectOne(candidate.id, checked as boolean)}
                                                aria-label={`Sélectionner ${candidate.name}`}
                                            />
                                        </TableCell>
                                    )}
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="relative h-10 w-10 overflow-hidden rounded-lg border-2"
                                                style={{ borderColor: candidate.wow_class?.color || '#666' }}
                                            >
                                                <div
                                                    className="absolute inset-0 flex items-center justify-center text-sm font-bold"
                                                    style={{
                                                        backgroundColor: `${candidate.wow_class?.color}20` || '#333',
                                                        color: candidate.wow_class?.color || '#fff'
                                                    }}
                                                >
                                                    {candidate.name.charAt(0)}
                                                </div>
                                                {candidate.avatar_url && (
                                                    <img
                                                        src={candidate.avatar_url}
                                                        alt={candidate.name}
                                                        className="relative z-10 h-full w-full object-cover"
                                                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                                                    />
                                                )}
                                            </div>
                                            <span className="font-semibold text-white">
                                                {candidate.name}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="font-medium"
                                                style={{ color: candidate.wow_class?.color }}
                                            >
                                                {candidate.wow_class?.name}
                                            </span>
                                            <span className="text-sm text-zinc-500">
                                                {candidate.wow_spec?.name}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {candidate.wlogs_ilvl ? (
                                            <span className="font-mono text-sm text-zinc-300">
                                                {candidate.wlogs_ilvl}
                                            </span>
                                        ) : (
                                            <span className="text-zinc-600">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {candidate.wlogs_score ? (
                                            <span
                                                className="inline-flex rounded-md px-2 py-1 text-sm font-bold"
                                                style={{
                                                    color: candidate.wlogs_color || '#999',
                                                    backgroundColor: `${candidate.wlogs_color}15` || '#333'
                                                }}
                                            >
                                                {Math.round(candidate.wlogs_score)}
                                            </span>
                                        ) : (
                                            <span className="text-zinc-600">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {candidate.wlogs_mythic_plus_score ? (
                                            <span
                                                className="inline-flex rounded-md px-2 py-1 text-sm font-bold"
                                                style={(function () {
                                                    const score = candidate.wlogs_mythic_plus_score!;
                                                    let color = '#ffffff';
                                                    if (score >= 3000) color = '#ff8000'; // Legendary (Orange)
                                                    else if (score >= 2500) color = '#a335ee'; // Epic (Purple)
                                                    else if (score >= 2000) color = '#0070dd'; // Rare (Blue)
                                                    else if (score >= 1000) color = '#1eff00'; // Uncommon (Green)
                                                    else color = '#ffffff'; // Common (White)

                                                    return {
                                                        color: color,
                                                        backgroundColor: `${color}15`,
                                                    };
                                                })()}
                                            >
                                                {Math.round(candidate.wlogs_mythic_plus_score)}
                                            </span>
                                        ) : (
                                            <span className="text-zinc-600">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {candidate.wlogs_raid_progress ? (
                                            <span className="text-sm font-medium text-zinc-300">
                                                {candidate.wlogs_raid_progress}
                                            </span>
                                        ) : (
                                            <span className="text-zinc-600">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <span
                                            className={cn(
                                                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                                                status.className
                                            )}
                                        >
                                            <StatusIcon className="h-3 w-3" />
                                            {status.label}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right text-zinc-500">
                                        {formatDistanceToNow(new Date(candidate.created_at), {
                                            addSuffix: true,
                                            locale: fr,
                                        })}
                                    </TableCell>
                                    <TableCell>
                                        <ChevronRight className="h-5 w-5 text-zinc-600 transition-colors group-hover:text-zinc-400" />
                                    </TableCell>
                                    {isGM && (
                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                            <DeleteCandidateButton candidateId={candidate.id} />
                                        </TableCell>
                                    )}
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
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

