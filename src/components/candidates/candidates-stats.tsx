import { Users, Clock, CheckCircle, XCircle, Pause } from 'lucide-react'

interface StatsProps {
    stats: {
        total: number
        pending: number
        accepted: number
        rejected: number
        waitlist: number
    }
}

export function CandidatesStats({ stats }: StatsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-zinc-400" />
                    <div>
                        <p className="text-sm font-medium text-zinc-400">Total</p>
                        <p className="text-2xl font-bold text-white">{stats.total}</p>
                    </div>
                </div>
            </div>

            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
                <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-amber-400" />
                    <div>
                        <p className="text-sm font-medium text-amber-400">En Attente</p>
                        <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
                    </div>
                </div>
            </div>

            <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4">
                <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <div>
                        <p className="text-sm font-medium text-green-400">Acceptées</p>
                        <p className="text-2xl font-bold text-green-400">{stats.accepted}</p>
                    </div>
                </div>
            </div>

            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
                <div className="flex items-center gap-3">
                    <XCircle className="h-5 w-5 text-red-400" />
                    <div>
                        <p className="text-sm font-medium text-red-400">Refusées</p>
                        <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
                    </div>
                </div>
            </div>

            <div className="rounded-lg border border-zinc-600/20 bg-zinc-600/10 p-4">
                <div className="flex items-center gap-3">
                    <Pause className="h-5 w-5 text-zinc-400" />
                    <div>
                        <p className="text-sm font-medium text-zinc-400">Waitlist</p>
                        <p className="text-2xl font-bold text-zinc-300">{stats.waitlist}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
