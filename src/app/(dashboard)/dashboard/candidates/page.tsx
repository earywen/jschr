import { getCandidates, getCandidateStats, getWowClasses, getWowSpecs } from '@/lib/actions/candidates-queries'
import { getUserRole } from '@/lib/auth/role'
import { CandidatesDataTable } from '@/components/candidates/candidates-data-table'
import { CandidatesStats } from '@/components/candidates/candidates-stats'
import { AddManualCandidateDialog } from '@/components/candidates/add-manual-candidate-dialog'

export default async function CandidatesPage() {
    const [candidates, stats, user, classes, specs] = await Promise.all([
        getCandidates(), // Récupère TOUTES les candidatures, filtrage côté client
        getCandidateStats(),
        getUserRole(),
        getWowClasses(),
        getWowSpecs(),
    ])

    const canAddManual = user?.role === 'officer' || user?.role === 'gm'

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        Candidatures
                    </h1>
                    <p className="text-[#94A3B8]">
                        Gérez les candidatures en attente de décision.
                    </p>
                </div>
                {canAddManual && (
                    <AddManualCandidateDialog classes={classes} specs={specs} />
                )}
            </div>

            {/* Stats — conservées car cliquables pour filtrer */}
            <CandidatesStats stats={stats} />

            {/* DataTable avec tri/filtre intégré */}
            <CandidatesDataTable candidates={candidates} userRole={user?.role} />
        </div>
    )
}
