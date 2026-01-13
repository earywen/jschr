'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { updateCandidateStatus } from '@/lib/actions/candidate-status'
import { CheckCircle, XCircle, Pause, Loader2 } from 'lucide-react'
import { Database } from '@/types/database.types'
import { cn } from '@/lib/utils'

type CandidateStatus = Database['public']['Enums']['candidate_status']

interface DecisionButtonsProps {
    candidateId: string
    currentStatus: CandidateStatus
}

export function DecisionButtons({ candidateId, currentStatus }: DecisionButtonsProps) {
    const [isLoading, setIsLoading] = useState<CandidateStatus | null>(null)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleDecision = async (statusClicked: CandidateStatus) => {
        // Toggle behavior: if clicking the current status, revert to 'pending'
        const isTogglingOff = statusClicked === currentStatus
        const newStatus: CandidateStatus = isTogglingOff ? 'pending' : statusClicked

        setIsLoading(statusClicked)
        setError(null)

        const result = await updateCandidateStatus(candidateId, newStatus)

        if (!result.success) {
            setError(result.error || 'Erreur inconnue')
            setIsLoading(null)
            return
        }

        setIsLoading(null)
        router.refresh()
    }

    return (
        <div className="space-y-4 rounded-3xl bg-[#161822] border border-white/5 p-6">
            <div className="flex items-center gap-2 mb-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#4361EE]" />
                <p className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                    Décision de Recrutement
                </p>
            </div>

            <div className="flex flex-wrap gap-3">
                {/* ACCEPTER */}
                <Button
                    onClick={() => handleDecision('accepted')}
                    disabled={isLoading !== null}
                    className={cn(
                        "h-11 px-6 rounded-2xl font-bold transition-all duration-300 border flex items-center gap-2",
                        currentStatus === 'accepted'
                            ? "bg-emerald-500 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:bg-emerald-600"
                            : "bg-zinc-900/50 border-white/5 text-zinc-500 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/5"
                    )}
                >
                    {isLoading === 'accepted' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <CheckCircle className="h-4 w-4" />
                    )}
                    Accepter
                </Button>

                {/* REFUSER */}
                <Button
                    onClick={() => handleDecision('rejected')}
                    disabled={isLoading !== null}
                    className={cn(
                        "h-11 px-6 rounded-2xl font-bold transition-all duration-300 border flex items-center gap-2",
                        currentStatus === 'rejected'
                            ? "bg-rose-500 border-rose-400 text-white shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:bg-rose-600"
                            : "bg-zinc-900/50 border-white/5 text-zinc-500 hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/5"
                    )}
                >
                    {isLoading === 'rejected' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <XCircle className="h-4 w-4" />
                    )}
                    Refuser
                </Button>

                {/* WAITLIST */}
                <Button
                    onClick={() => handleDecision('waitlist')}
                    disabled={isLoading !== null}
                    className={cn(
                        "h-11 px-6 rounded-2xl font-bold transition-all duration-300 border flex items-center gap-2",
                        currentStatus === 'waitlist'
                            ? "bg-amber-500 border-amber-400 text-white shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:bg-amber-600"
                            : "bg-zinc-900/50 border-white/5 text-zinc-500 hover:text-amber-400 hover:border-amber-500/30 hover:bg-amber-500/5"
                    )}
                >
                    {isLoading === 'waitlist' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Pause className="h-4 w-4" />
                    )}
                    Waitlist
                </Button>
            </div>

            {error && (
                <p className="text-sm font-medium text-rose-400 mt-2 flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-rose-500" />
                    {error}
                </p>
            )}

            {currentStatus !== 'pending' && (
                <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
                    Cliquez sur le statut actif pour repasser en attente
                </p>
            )}
        </div>
    )
}
