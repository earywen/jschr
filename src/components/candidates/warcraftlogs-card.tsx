'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ExternalLink, RefreshCw, Loader2 } from 'lucide-react'
import { fetchWarcraftLogsForCandidate } from '@/lib/actions/warcraftlogs'

interface WarcraftLogsCardProps {
    candidateId: string
    score: number | null
    color: string | null
    link: string | null
}

export function WarcraftLogsCard({ candidateId, score, color, link }: WarcraftLogsCardProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    if (!link) {
        return null
    }

    const handleFetch = async () => {
        setIsLoading(true)
        setError(null)

        try {
            const result = await fetchWarcraftLogsForCandidate(candidateId, link)

            if (!result.success) {
                setError(result.error || 'Erreur lors de la récupération')
            } else {
                router.refresh()
            }
        } catch (err) {
            setError('Erreur de connexion')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-2">
            <p className="text-sm font-medium text-zinc-400">WarcraftLogs</p>

            {score !== null ? (
                <div className="flex items-center gap-3">
                    <div
                        className="flex h-12 w-12 items-center justify-center rounded-lg border text-xl font-bold"
                        style={{
                            backgroundColor: `${color}20`,
                            borderColor: color || '#666',
                            color: color || '#666',
                        }}
                    >
                        {score}
                    </div>
                    <div>
                        <p className="text-sm text-zinc-300">Best Perf. Average</p>
                        <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-orange-400 hover:underline"
                        >
                            Voir sur WarcraftLogs
                            <ExternalLink className="h-3 w-3" />
                        </a>
                    </div>
                </div>
            ) : (
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-500">
                            ?
                        </div>
                        <div>
                            <p className="text-sm text-zinc-500">En attente de données</p>
                            <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-orange-400 hover:underline"
                            >
                                Voir sur WarcraftLogs
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        </div>
                    </div>
                    <Button
                        onClick={handleFetch}
                        disabled={isLoading}
                        size="sm"
                        variant="outline"
                        className="w-full border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
                    >
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCw className="mr-2 h-4 w-4" />
                        )}
                        Récupérer les données
                    </Button>
                    {error && <p className="text-xs text-red-400">{error}</p>}
                </div>
            )}
        </div>
    )
}
