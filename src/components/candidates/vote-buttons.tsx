'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { castVote } from '@/lib/actions/votes'
import { ThumbsUp, ThumbsDown, Minus, Loader2 } from 'lucide-react'
import { Database } from '@/types/database.types'
import { cn } from '@/lib/utils'

type VoteType = Database['public']['Enums']['vote_type']

interface VoteButtonsProps {
    candidateId: string
    currentVote: VoteType | null
}

export function VoteButtons({ candidateId, currentVote }: VoteButtonsProps) {
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

    return (
        <div className="space-y-3">
            <p className="text-sm font-medium text-zinc-400">Votre Vote</p>

            <div className="flex gap-2">
                <Button
                    onClick={() => handleVote('yes')}
                    disabled={isLoading !== null}
                    variant="outline"
                    className={cn(
                        'flex-1 border-zinc-700',
                        currentVote === 'yes'
                            ? 'bg-green-600 text-white border-green-500 hover:bg-green-500'
                            : 'hover:bg-zinc-800 text-zinc-300'
                    )}
                >
                    {isLoading === 'yes' ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <ThumbsUp className="mr-2 h-4 w-4" />
                    )}
                    Oui
                </Button>

                <Button
                    onClick={() => handleVote('neutral')}
                    disabled={isLoading !== null}
                    variant="outline"
                    className={cn(
                        'flex-1 border-zinc-700',
                        currentVote === 'neutral'
                            ? 'bg-zinc-600 text-white border-zinc-500 hover:bg-zinc-500'
                            : 'hover:bg-zinc-800 text-zinc-300'
                    )}
                >
                    {isLoading === 'neutral' ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Minus className="mr-2 h-4 w-4" />
                    )}
                    Neutre
                </Button>

                <Button
                    onClick={() => handleVote('no')}
                    disabled={isLoading !== null}
                    variant="outline"
                    className={cn(
                        'flex-1 border-zinc-700',
                        currentVote === 'no'
                            ? 'bg-red-600 text-white border-red-500 hover:bg-red-500'
                            : 'hover:bg-zinc-800 text-zinc-300'
                    )}
                >
                    {isLoading === 'no' ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <ThumbsDown className="mr-2 h-4 w-4" />
                    )}
                    Non
                </Button>
            </div>

            {currentVote && (
                <p className="text-xs text-zinc-500 text-center">
                    Vous pouvez modifier votre vote à tout moment.
                </p>
            )}

            {error && (
                <p className="text-sm text-red-400">{error}</p>
            )}
        </div>
    )
}
