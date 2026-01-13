import { redirect } from 'next/navigation'
import { getUserRole } from '@/lib/auth/role'
import { Clock } from 'lucide-react'

export default async function DashboardPage() {
    const user = await getUserRole()

    if (user?.role !== 'pending') {
        redirect('/dashboard/candidates')
    }

    return (
        <div className="flex h-[calc(100vh-120px)] items-center justify-center">
            <div className="max-w-md w-full rounded-3xl bg-[#161822] border border-white/5 p-8 text-center space-y-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#4361EE]/10">
                    <Clock className="h-8 w-8 text-[#4361EE]" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">
                        Accès en attente
                    </h1>
                    <p className="mt-2 text-[#94A3B8]">
                        Votre compte est en cours de validation par l&apos;équipe d&apos;officiers.
                    </p>
                </div>
                <div className="pt-6 border-t border-white/5">
                    <p className="text-sm text-[#94A3B8]/60 italic">
                        Revenez plus tard ou contactez un officier sur Discord.
                    </p>
                </div>
            </div>
        </div>
    )
}
