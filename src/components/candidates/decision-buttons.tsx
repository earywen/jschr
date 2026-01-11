'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { updateCandidateStatus } from '@/lib/actions/candidate-status'
import { CheckCircle, XCircle, Pause, Loader2 } from 'lucide-react'
import { Database } from '@/types/database.types'

type CandidateStatus = Database['public']['Enums']['candidate_status']

interface DecisionButtonsProps {
    candidateId: string
    currentStatus: CandidateStatus
}

export function DecisionButtons({ candidateId, currentStatus }: DecisionButtonsProps) {
    const [isLoading, setIsLoading] = useState<CandidateStatus | null>(null)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleDecision = async (newStatus: CandidateStatus) => {
        if (newStatus === currentStatus) return

        setIsLoading(newStatus)
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
        <div className="space-y-3">
            <p className="text-sm font-medium text-zinc-400">Décision GM</p>

            <div className="flex flex-wrap gap-2">
                <Button
                    onClick={() => handleDecision('accepted')}
                    disabled={isLoading !== null || currentStatus === 'accepted'}
                    className="bg-green-600 text-white hover:bg-green-500 disabled:bg-green-900 disabled:text-green-400"
                >
                    {isLoading === 'accepted' ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <CheckCircle className="mr-2 h-4 w-4" />
                    )}
                    Accepter
                </Button>

                <Button
                    onClick={() => handleDecision('rejected')}
                    disabled={isLoading !== null || currentStatus === 'rejected'}
                    variant="destructive"
                    className="disabled:bg-red-900 disabled:text-red-400"
                >
                    {isLoading === 'rejected' ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <XCircle className="mr-2 h-4 w-4" />
                    )}
                    Refuser
                </Button>

                <Button
                    onClick={() => handleDecision('waitlist')}
                    disabled={isLoading !== null || currentStatus === 'waitlist'}
                    variant="outline"
                    className="border-zinc-600 text-zinc-300 hover:bg-zinc-800 disabled:border-zinc-800 disabled:text-zinc-600"
                >
                    {isLoading === 'waitlist' ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Pause className="mr-2 h-4 w-4" />
                    )}
                    Waitlist
                </Button>
            </div>

            {error && (
                <p className="text-sm text-red-400">{error}</p>
            )}
        </div>
    )
}
