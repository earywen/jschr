'use client'

import { useRouter } from 'next/navigation'
import { CandidateWithDetails } from '@/lib/actions/candidates-queries'
import { cn, getApprovalColor } from '@/lib/utils'
import { Trophy, Clock, CheckCircle2, XCircle, PauseCircle } from 'lucide-react'

// Helper pour le badge de statut (réutilisé ou dupliqué pour simplicité mobile)
const getStatusBadge = (status: string) => {
    switch (status) {
        case 'pending':
            return (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500">
                    <Clock className="h-3 w-3" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">En Attente</span>
                </div>
            )
        case 'accepted':
            return (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                    <CheckCircle2 className="h-3 w-3" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Accepté</span>
                </div>
            )
        case 'rejected':
            return (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500">
                    <XCircle className="h-3 w-3" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Refusé</span>
                </div>
            )
        case 'waitlist':
            return (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-500/10 border border-zinc-500/20 text-zinc-400">
                    <PauseCircle className="h-3 w-3" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Waitlist</span>
                </div>
            )
        default:
            return null
    }
}

interface CandidateMobileCardProps {
    candidate: CandidateWithDetails
}

export function CandidateMobileCard({ candidate }: CandidateMobileCardProps) {
    const router = useRouter()
    const approvalRate = candidate.approval_rate || 0

    // Déterminer la couleur de la classe (la spé n'a pas de couleur dans ce type)
    const specColor = candidate.wow_class?.color || '#94A3B8'

    return (
        <div
            onClick={() => router.push(`/dashboard/candidates/${candidate.id}`)}
            className="group relative overflow-hidden rounded-2xl bg-[#161822] border border-white/5 p-4 active:scale-[0.98] transition-all cursor-pointer hover:border-white/10"
        >
            {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Left accent border based on class color */}
            <div
                className="absolute left-0 top-0 bottom-0 w-1"
                style={{ backgroundColor: candidate.wow_class?.color || '#333' }}
            />

            <div className="pl-3 flex flex-col gap-4">
                {/* Header: Avatar + Info + Status */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0">
                            <img
                                src={candidate.avatar_url || ''}
                                alt={candidate.name}
                                className="h-full w-full rounded-xl object-cover border border-white/10 bg-zinc-900"
                            />
                        </div>

                        <div>
                            <h3 className="font-bold text-white text-base leading-none mb-1">
                                {candidate.name}
                            </h3>
                            <div className="flex items-center gap-1.5 text-xs">
                                <span style={{ color: specColor }} className="font-medium">
                                    {candidate.wow_spec?.name}
                                </span>
                                <span className="text-zinc-600">•</span>
                                <span className="text-zinc-400">
                                    {candidate.wow_class?.name}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                        {getStatusBadge(candidate.status)}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-2 bg-black/20 rounded-xl p-2 border border-white/5">
                    {/* iLvl */}
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase">iLvl</span>
                        <span className="text-sm font-bold text-white">
                            {candidate.wlogs_ilvl || '-'}
                        </span>
                    </div>

                    {/* Score */}
                    <div className="flex flex-col items-center border-l border-white/5">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase">Score</span>
                        <div className="text-sm font-bold" style={{ color: (candidate.wlogs_score || 0) >= 95 ? '#FF8000' : (candidate.wlogs_score || 0) >= 75 ? '#A335EE' : '#0070DD' }}>
                            {candidate.wlogs_score || '-'}
                        </div>
                    </div>

                    {/* MM+ */}
                    <div className="flex flex-col items-center border-l border-white/5">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase">MM+</span>
                        <span className="text-sm font-bold text-[#ffd100]">
                            {candidate.wlogs_mythic_plus_score || '-'}
                        </span>
                    </div>

                    {/* Progress */}
                    <div className="flex flex-col items-center border-l border-white/5">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase">Raid</span>
                        <span className="text-sm font-bold text-white whitespace-nowrap">
                            {candidate.wlogs_raid_progress || '-'}
                        </span>
                    </div>
                </div>

                {/* Footer: Approval + Date */}
                <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                        <div className="flex items-baseline gap-1">
                            <span
                                className="text-xl font-black italic tracking-tighter leading-none"
                                style={{ color: getApprovalColor(approvalRate) }}
                            >
                                {approvalRate}%
                            </span>
                            <span className="text-[9px] font-bold text-zinc-500 uppercase">Appro.</span>
                        </div>
                        {approvalRate >= 85 && (
                            <Trophy className="h-3 w-3 text-emerald-400" />
                        )}
                    </div>

                    <span className="text-[10px] text-zinc-600 font-medium">
                        {new Date(candidate.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short'
                        })}
                    </span>
                </div>
            </div>
        </div>
    )
}
