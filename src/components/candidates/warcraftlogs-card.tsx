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
    mythicPlusScore?: number | null
    ilvl?: number | null
    raidProgress?: string | null
    link: string | null
}

export function WarcraftLogsCard({ candidateId, score, color, mythicPlusScore, ilvl, raidProgress, link }: WarcraftLogsCardProps) {
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
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-zinc-400">WarcraftLogs</p>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-zinc-500 hover:text-orange-400"
                    onClick={handleFetch}
                    disabled={isLoading}
                >
                    <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span className="sr-only">Actualiser</span>
                </Button>
            </div>

            {score !== null ? (
                <div className="flex flex-col gap-4">
                    {/* Raid Score */}
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

                    {/* Mythic+ Score */}
                    {mythicPlusScore != null && (
                        <div className="flex items-center gap-3">
                            <div
                                className="flex h-12 w-12 items-center justify-center rounded-lg border text-xl font-bold"
                                style={(function () {
                                    // Raider.IO style colors
                                    const score = mythicPlusScore;
                                    let color = '#ffffff';
                                    if (score >= 3000) color = '#ff8000'; // Legendary (Orange)
                                    else if (score >= 2500) color = '#a335ee'; // Epic (Purple)
                                    else if (score >= 2000) color = '#0070dd'; // Rare (Blue)
                                    else if (score >= 1000) color = '#1eff00'; // Uncommon (Green)
                                    else color = '#ffffff'; // Common (White)

                                    return {
                                        backgroundColor: `${color}20`,
                                        borderColor: color,
                                        color: color,
                                    };
                                })()}
                            >
                                {Math.round(mythicPlusScore)}
                            </div>
                            <div>
                                <p className="text-sm text-zinc-300">Score Mythic+</p>
                                <span className="text-xs text-zinc-500">
                                    Saison en cours
                                </span>
                            </div>
                        </div>
                    )}

                    {/* iLvl and Progress */}
                    {(ilvl || raidProgress) && (
                        <div className="flex gap-4 border-t border-zinc-800 pt-3 mt-1">
                            {ilvl && (
                                <div>
                                    <p className="text-xs text-zinc-500 mb-0.5">Item Level</p>
                                    <p className="text-lg font-bold text-zinc-200">{ilvl}</p>
                                </div>
                            )}
                            {raidProgress && (
                                <div>
                                    <p className="text-xs text-zinc-500 mb-0.5">Progress Raid</p>
                                    <p className="text-lg font-bold text-zinc-200">{raidProgress}</p>
                                </div>
                            )}
                        </div>
                    )}
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
