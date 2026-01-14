'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { castVote, VoteSynthesis } from '@/lib/actions/votes'
import { ThumbsUp, ThumbsDown, Minus, Loader2, Users, Trophy } from 'lucide-react'
import { Database } from '@/types/database.types'
import { cn, getApprovalColor } from '@/lib/utils'

type VoteType = Database['public']['Enums']['vote_type']

interface CandidateVoteCardProps {
    candidateId: string
    currentVote: VoteType | null
    synthesis: VoteSynthesis
    showSynthesis: boolean
    canVote: boolean
    variant?: 'default' | 'header'
}

export function CandidateVoteCard({
    candidateId,
    currentVote,
    synthesis,
    showSynthesis,
    canVote,
    variant = 'default',
}: CandidateVoteCardProps) {
    const [isLoading, setIsLoading] = useState<VoteType | null>(null)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleVote = async (voteType: VoteType) => {
        setIsLoading(voteType)
        setError(null)

        const result = await castVote(candidateId, voteType)

        if (!result.success) {
            setError(result.error || 'Erreur inconnue')
            setIsLoading(null)
            return
        }

        setIsLoading(null)
        router.refresh()
    }

    const { total, yes, no, neutral, approvalRate } = synthesis

    if (variant === 'header') {
        return (
            <div className="flex flex-col gap-4">
                {/* VOTING SECTION (STAYING COMPACT) */}
                {canVote && (
                    <div className="flex items-center gap-2 bg-black/40 p-1 rounded-full border border-white/5">
                        <Button
                            onClick={() => handleVote('yes')}
                            disabled={isLoading !== null}
                            size="sm"
                            className={cn(
                                "h-9 px-3 sm:px-5 rounded-full font-black flex items-center gap-1.5 transition-all duration-300",
                                currentVote === 'yes'
                                    ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                                    : "bg-transparent text-zinc-500 hover:text-emerald-400"
                            )}
                        >
                            {isLoading === 'yes' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsUp className="h-4 w-4" />}
                            <span className="text-[11px] uppercase tracking-wider">Oui</span>
                        </Button>

                        <Button
                            onClick={() => handleVote('neutral')}
                            disabled={isLoading !== null}
                            size="sm"
                            className={cn(
                                "h-9 px-3 sm:px-4 rounded-full font-bold flex items-center gap-1.5 transition-all duration-300",
                                currentVote === 'neutral'
                                    ? "bg-zinc-600 text-white"
                                    : "bg-transparent text-zinc-600 hover:text-white"
                            )}
                        >
                            <span className="text-lg leading-none">—</span>
                            <span className="text-[11px] uppercase tracking-wider">N</span>
                        </Button>

                        <Button
                            onClick={() => handleVote('no')}
                            disabled={isLoading !== null}
                            size="sm"
                            className={cn(
                                "h-9 px-3 sm:px-5 rounded-full font-black flex items-center gap-1.5 transition-all duration-300",
                                currentVote === 'no'
                                    ? "bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]"
                                    : "bg-transparent text-zinc-500 hover:text-rose-400"
                            )}
                        >
                            {isLoading === 'no' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsDown className="h-4 w-4" />}
                            <span className="text-[11px] uppercase tracking-wider">Non</span>
                        </Button>
                    </div>
                )}

                {/* SYNTHESIS SECTION (MINIMALIST LINE) */}
                {showSynthesis && (
                    <div className="flex items-center justify-between gap-4 px-2">
                        <div className="flex items-baseline gap-1.5">
                            <span
                                className="text-2xl font-black italic tracking-tighter leading-none"
                                style={{ color: getApprovalColor(approvalRate) }}
                            >
                                {approvalRate}%
                            </span>
                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-tighter">Approb.</span>
                        </div>

                        <div className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-tighter">
                            <span className="text-emerald-500/80">{yes}Y</span>
                            <span className="text-zinc-600">{neutral}N</span>
                            <span className="text-rose-500/80">{no}R</span>
                            {approvalRate >= 85 && (
                                <Trophy className="h-4 w-4 text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)] ml-1" />
                            )}
                        </div>
                    </div>
                )}

                {error && (
                    <p className="text-[10px] font-bold text-rose-400 text-center uppercase tracking-widest">{error}</p>
                )}
            </div>
        )
    }

    return (
        <div className="rounded-3xl bg-[#161822] border border-[#4361EE]/20 p-6 space-y-6">
            {/* VOTING SECTION */}
            {canVote && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ThumbsUp className="h-4 w-4 text-[#4361EE]" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                                Ton Vote
                            </h3>
                        </div>
                        {currentVote && (
                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                                Voté
                            </span>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={() => handleVote('yes')}
                            disabled={isLoading !== null}
                            className={cn(
                                "flex-1 h-11 rounded-2xl font-bold transition-all duration-300 border flex items-center justify-center gap-2",
                                currentVote === 'yes'
                                    ? "bg-emerald-500 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:bg-emerald-600"
                                    : "bg-zinc-900/50 border-white/5 text-zinc-500 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/5"
                            )}
                        >
                            {isLoading === 'yes' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsUp className="h-4 w-4" />}
                            Oui
                        </Button>

                        <Button
                            onClick={() => handleVote('neutral')}
                            disabled={isLoading !== null}
                            className={cn(
                                "flex-1 h-11 rounded-2xl font-bold transition-all duration-300 border flex items-center justify-center gap-2",
                                currentVote === 'neutral'
                                    ? "bg-zinc-600 border-zinc-500 text-white shadow-[0_0_20px_rgba(113,113,122,0.2)] hover:bg-zinc-700"
                                    : "bg-zinc-900/50 border-white/5 text-zinc-500 hover:text-white hover:border-white/20 hover:bg-white/5"
                            )}
                        >
                            {isLoading === 'neutral' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Minus className="h-4 w-4" />}
                            Neutre
                        </Button>

                        <Button
                            onClick={() => handleVote('no')}
                            disabled={isLoading !== null}
                            className={cn(
                                "flex-1 h-11 rounded-2xl font-bold transition-all duration-300 border flex items-center justify-center gap-2",
                                currentVote === 'no'
                                    ? "bg-rose-500 border-rose-400 text-white shadow-[0_0_20px_rgba(244,63,94,0.2)] hover:bg-rose-600"
                                    : "bg-zinc-900/50 border-white/5 text-zinc-500 hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/5"
                            )}
                        >
                            {isLoading === 'no' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsDown className="h-4 w-4" />}
                            Non
                        </Button>
                    </div>

                    {error && (
                        <p className="text-[10px] font-medium text-rose-400 flex items-center gap-1.5 justify-center">
                            <span className="h-1 w-1 rounded-full bg-rose-500" />
                            {error}
                        </p>
                    )}
                </div>
            )}

            {/* DIVIDER if both parts shown */}
            {canVote && showSynthesis && <div className="border-t border-white/5 pt-2" />}

            {/* SYNTHESIS SECTION - MINIMALIST */}
            {showSynthesis && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-[#4361EE]" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                            Consensus Roster
                        </h3>
                    </div>

                    {total === 0 ? (
                        <p className="text-xs text-zinc-600 italic">Aucun vote pour le moment.</p>
                    ) : (
                        <div className="space-y-3">
                            {/* Minimalism: A single line summary */}
                            <div className="flex items-end justify-between">
                                <div className="flex items-baseline gap-2">
                                    <span className={cn(
                                        "text-2xl font-black italic tracking-tighter",
                                        approvalRate >= 85 ? "text-emerald-400" : approvalRate >= 50 ? "text-amber-400" : "text-rose-400"
                                    )}>
                                        {approvalRate}%
                                    </span>
                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                        Approbation
                                    </span>
                                </div>

                                <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-white/5 py-1 px-3 rounded-full border border-white/5">
                                    <span className="text-emerald-400/80">{yes} Oui</span>
                                    <span className="text-zinc-500">{neutral} N</span>
                                    <span className="text-rose-400/80">{no} Non</span>
                                </div>
                            </div>

                            {/* Ghost Progress Bar */}
                            <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden flex">
                                <div
                                    className="h-full bg-emerald-500 transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                    style={{ width: `${(yes / total) * 100}%` }}
                                />
                                <div
                                    className="h-full bg-zinc-600"
                                    style={{ width: `${(neutral / total) * 100}%` }}
                                />
                                <div
                                    className="h-full bg-rose-500 transition-all duration-500"
                                    style={{ width: `${(no / total) * 100}%` }}
                                />
                            </div>

                            {/* Total and Super Quorum */}
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] text-zinc-600 font-medium">
                                    {total} vote{total > 1 ? 's' : ''} total
                                </p>

                                {approvalRate >= 85 && (
                                    <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 italic tracking-tighter uppercase">
                                        <Trophy className="h-3 w-3" />
                                        Super-Quorum
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
