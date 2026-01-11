import Link from 'next/link'
import { CandidateWithDetails } from '@/lib/actions/candidates-queries'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Clock, CheckCircle, XCircle, Pause, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ListProps {
    candidates: CandidateWithDetails[]
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

export function CandidatesList({ candidates }: ListProps) {
    if (candidates.length === 0) {
        return (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-8 text-center">
                <p className="text-zinc-400">Aucune candidature trouvée.</p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {candidates.map((candidate) => {
                const status = statusConfig[candidate.status]
                const StatusIcon = status.icon

                return (
                    <Link
                        key={candidate.id}
                        href={`/dashboard/candidates/${candidate.id}`}
                        className="group flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 p-4 transition-colors hover:border-zinc-700 hover:bg-zinc-800/50"
                    >
                        <div className="flex items-center gap-4">
                            {/* Class Color Indicator */}
                            <div
                                className="h-12 w-1 rounded-full"
                                style={{ backgroundColor: candidate.wow_class?.color || '#666' }}
                            />

                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-white">
                                        {candidate.name}
                                    </span>
                                    <span
                                        className="text-sm"
                                        style={{ color: candidate.wow_class?.color }}
                                    >
                                        {candidate.wow_class?.name}
                                    </span>
                                    <span className="text-sm text-zinc-500">
                                        {candidate.wow_spec?.name}
                                    </span>
                                </div>
                                <p className="text-sm text-zinc-500">
                                    Postulé{' '}
                                    {formatDistanceToNow(new Date(candidate.created_at), {
                                        addSuffix: true,
                                        locale: fr,
                                    })}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <span
                                className={cn(
                                    'flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium',
                                    status.className
                                )}
                            >
                                <StatusIcon className="h-3 w-3" />
                                {status.label}
                            </span>
                            <ChevronRight className="h-5 w-5 text-zinc-600 transition-colors group-hover:text-zinc-400" />
                        </div>
                    </Link>
                )
            })}
        </div>
    )
}
