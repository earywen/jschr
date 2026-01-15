export default function AccessDeniedPage({
    searchParams,
}: {
    searchParams: { reason?: string }
}) {
    const reason = searchParams.reason || 'Accès non autorisé'

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <div className="max-w-md w-full mx-4">
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl">
                    <div className="flex flex-col items-center text-center space-y-6">
                        {/* Icon */}
                        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center">
                            <svg
                                className="w-10 h-10 text-red-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>

                        {/* Title */}
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-2">
                                Accès Refusé
                            </h1>
                            <p className="text-slate-400">
                                {decodeURIComponent(reason)}
                            </p>
                        </div>

                        {/* Message */}
                        <div className="bg-slate-800/50 rounded-lg p-4 w-full">
                            <p className="text-sm text-slate-300">
                                Pour accéder au dashboard JSC HR, vous devez :
                            </p>
                            <ul className="mt-3 space-y-2 text-sm text-slate-400">
                                <li className="flex items-start gap-2">
                                    <span className="text-emerald-500 mt-0.5">✓</span>
                                    <span>
                                        Être membre du serveur Discord{' '}
                                        <strong className="text-white">Jet Set Club</strong>
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-emerald-500 mt-0.5">✓</span>
                                    <span>
                                        Avoir le rôle{' '}
                                        <strong className="text-emerald-400">Jet Setter</strong>
                                    </span>
                                </li>
                            </ul>
                        </div>

                        {/* Action */}
                        <a
                            href="/"
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
                        >
                            Retour à l&apos;accueil
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
