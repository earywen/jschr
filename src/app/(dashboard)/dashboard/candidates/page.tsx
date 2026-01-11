import { getCandidates, getCandidateStats } from '@/lib/actions/candidates-queries'
import { CandidatesList } from '@/components/candidates/candidates-list'
import { CandidatesStats } from '@/components/candidates/candidates-stats'
import { CandidatesFilters } from '@/components/candidates/candidates-filters'
import { Database } from '@/types/database.types'

type CandidateStatus = Database['public']['Enums']['candidate_status']

interface PageProps {
    searchParams: Promise<{ status?: CandidateStatus }>
}

export default async function CandidatesPage({ searchParams }: PageProps) {
    const params = await searchParams
    const status = params.status

    const [candidates, stats] = await Promise.all([
        getCandidates(status),
        getCandidateStats(),
    ])

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">
                    Candidatures
                </h1>
                <p className="text-zinc-400">
                    Gérez les candidatures en attente de décision.
                </p>
            </div>

            {/* Stats */}
            <CandidatesStats stats={stats} />

            {/* Filters */}
            <CandidatesFilters currentStatus={status} />

            {/* List */}
            <CandidatesList candidates={candidates} />
        </div>
    )
}
