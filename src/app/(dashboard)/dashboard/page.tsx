import { getUserRole } from '@/lib/auth/role'

export default async function DashboardPage() {
    const user = await getUserRole()

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">
                    Dashboard
                </h1>
                <p className="text-zinc-400">
                    Bienvenue sur le panneau de recrutement JSC.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
                    <p className="text-sm font-medium text-zinc-400">Candidatures</p>
                    <p className="mt-2 text-3xl font-bold text-white">--</p>
                    <p className="text-xs text-zinc-500">En attente de données</p>
                </div>

                <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
                    <p className="text-sm font-medium text-zinc-400">En Attente</p>
                    <p className="mt-2 text-3xl font-bold text-amber-400">--</p>
                    <p className="text-xs text-zinc-500">À traiter</p>
                </div>

                <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
                    <p className="text-sm font-medium text-zinc-400">Acceptées</p>
                    <p className="mt-2 text-3xl font-bold text-green-400">--</p>
                    <p className="text-xs text-zinc-500">Ce mois</p>
                </div>

                <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
                    <p className="text-sm font-medium text-zinc-400">Refusées</p>
                    <p className="mt-2 text-3xl font-bold text-red-400">--</p>
                    <p className="text-xs text-zinc-500">Ce mois</p>
                </div>
            </div>

            {/* Role-specific message */}
            {user?.role === 'gm' && (
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
                    <p className="text-sm font-medium text-amber-400">
                        👑 Vous êtes connecté en tant que Grand Maître
                    </p>
                    <p className="text-xs text-amber-400/70">
                        Vous avez accès à toutes les fonctionnalités d&apos;administration.
                    </p>
                </div>
            )}

            {user?.role === 'pending' && (
                <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
                    <p className="text-sm font-medium text-zinc-300">
                        ⏳ Votre compte est en attente de validation
                    </p>
                    <p className="text-xs text-zinc-500">
                        Un officier doit approuver votre accès.
                    </p>
                </div>
            )}
        </div>
    )
}
