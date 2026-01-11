import { VoteSynthesis } from '@/lib/actions/votes'
import { ThumbsUp, ThumbsDown, Minus, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VoteSynthesisCardProps {
    synthesis: VoteSynthesis
}

export function VoteSynthesisCard({ synthesis }: VoteSynthesisCardProps) {
    const { total, yes, no, neutral, approvalRate } = synthesis

    return (
        <div className="space-y-4">
            <p className="text-sm font-medium text-zinc-400">Synthèse des Votes</p>

            {total === 0 ? (
                <p className="text-sm text-zinc-500">Aucun vote pour le moment.</p>
            ) : (
                <>
                    {/* Approval Rate */}
                    <div className="text-center">
                        <p
                            className={cn(
                                'text-3xl font-bold',
                                approvalRate >= 85
                                    ? 'text-green-400'
                                    : approvalRate >= 50
                                        ? 'text-amber-400'
                                        : 'text-red-400'
                            )}
                        >
                            {approvalRate}%
                        </p>
                        <p className="text-xs text-zinc-500">Taux d'approbation</p>
                    </div>

                    {/* Vote Breakdown */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-lg bg-green-500/10 p-2">
                            <div className="flex items-center justify-center gap-1 text-green-400">
                                <ThumbsUp className="h-4 w-4" />
                                <span className="font-bold">{yes}</span>
                            </div>
                            <p className="text-xs text-zinc-500">Oui</p>
                        </div>

                        <div className="rounded-lg bg-zinc-500/10 p-2">
                            <div className="flex items-center justify-center gap-1 text-zinc-400">
                                <Minus className="h-4 w-4" />
                                <span className="font-bold">{neutral}</span>
                            </div>
                            <p className="text-xs text-zinc-500">Neutre</p>
                        </div>

                        <div className="rounded-lg bg-red-500/10 p-2">
                            <div className="flex items-center justify-center gap-1 text-red-400">
                                <ThumbsDown className="h-4 w-4" />
                                <span className="font-bold">{no}</span>
                            </div>
                            <p className="text-xs text-zinc-500">Non</p>
                        </div>
                    </div>

                    {/* Total */}
                    <div className="flex items-center justify-center gap-2 text-sm text-zinc-500">
                        <Users className="h-4 w-4" />
                        <span>{total} vote{total > 1 ? 's' : ''}</span>
                    </div>

                    {/* Super Quorum indicator */}
                    {approvalRate >= 85 && (
                        <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-2 text-center">
                            <p className="text-sm font-medium text-green-400">
                                🏆 Super-Quorum atteint !
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
