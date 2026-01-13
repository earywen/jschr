import { getCandidates, getCandidateStats } from '@/lib/actions/candidates-queries'
import { getUserRole } from '@/lib/auth/role'
import { CandidatesDataTable } from '@/components/candidates/candidates-data-table'
import { CandidatesStats } from '@/components/candidates/candidates-stats'

export default async function CandidatesPage() {
    const [candidates, stats, user] = await Promise.all([
        getCandidates(), // Récupère TOUTES les candidatures, filtrage côté client
        getCandidateStats(),
        getUserRole(),
    ])

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">
                    Candidatures
                </h1>
                <p className="text-[#94A3B8]">
                    Gérez les candidatures en attente de décision.
                </p>
            </div>

            {/* Stats — conservées car cliquables pour filtrer */}
            <CandidatesStats stats={stats} />

            {/* DataTable avec tri/filtre intégré */}
            <CandidatesDataTable candidates={candidates} userRole={user?.role} />
        </div>
    )
}
