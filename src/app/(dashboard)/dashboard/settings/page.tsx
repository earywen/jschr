import { Shield, Settings as SettingsIcon, Bell, Users, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

function Card({
    children,
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "rounded-3xl bg-[#161822] border border-white/5 p-6",
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}

function SectionHeader({
    icon: Icon,
    children
}: {
    icon: React.ElementType
    children: React.ReactNode
}) {
    return (
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#94A3B8] mb-6">
            <Icon className="h-4 w-4" />
            {children}
        </h3>
    )
}

export default function SettingsPage() {
    return (
        <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex items-center gap-4 mb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#4361EE]/10">
                    <SettingsIcon className="h-6 w-6 text-[#4361EE]" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Paramètres</h1>
                    <p className="text-[#94A3B8]">Gérez la configuration de votre guilde et de l'application</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card>
                    <SectionHeader icon={Shield}>Rôles & Permissions</SectionHeader>
                    <p className="text-[#94A3B8] text-sm mb-4">
                        Configurez les accès pour les Membres, Officiers et le Grand Maître.
                    </p>
                    <div className="rounded-2xl bg-white/5 p-4 text-center">
                        <p className="text-xs text-[#94A3B8] italic">Bientôt disponible</p>
                    </div>
                </Card>

                <Card>
                    <SectionHeader icon={Bell}>Notifications Discord</SectionHeader>
                    <p className="text-[#94A3B8] text-sm mb-4">
                        Gérez les webhooks pour les nouvelles candidatures et les votes.
                    </p>
                    <div className="rounded-2xl bg-white/5 p-4 text-center">
                        <p className="text-xs text-[#94A3B8] italic">Bientôt disponible</p>
                    </div>
                </Card>

                <Card>
                    <SectionHeader icon={Globe}>Intégration WarcraftLogs</SectionHeader>
                    <p className="text-[#94A3B8] text-sm mb-4">
                        Configurez vos clés d'API et les paramètres de synchronisation.
                    </p>
                    <div className="rounded-2xl bg-white/5 p-4 text-center">
                        <p className="text-xs text-[#94A3B8] italic">Bientôt disponible</p>
                    </div>
                </Card>

                <Card>
                    <SectionHeader icon={Users}>Critères de Recrutement</SectionHeader>
                    <p className="text-[#94A3B8] text-sm mb-4">
                        Définissez les classes et spécialisations dont vous avez besoin.
                    </p>
                    <div className="rounded-2xl bg-white/5 p-4 text-center">
                        <p className="text-xs text-[#94A3B8] italic">Bientôt disponible</p>
                    </div>
                </Card>
            </div>
        </div>
    )
}
