'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    Users,
    Settings,
    LogOut,
    Shield,
    Home
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface SidebarProps {
    user: {
        id: string
        email: string
        role: 'pending' | 'member' | 'officer' | 'gm'
        discordUsername?: string
    }
}

const navigation = {
    gm: [
        { name: 'Candidatures', href: '/dashboard/candidates', icon: Users },
        { name: 'Paramètres', href: '/dashboard/settings', icon: Settings },
    ],
    officer: [
        { name: 'Candidatures', href: '/dashboard/candidates', icon: Users },
    ],
    member: [
        { name: 'Candidatures', href: '/dashboard/candidates', icon: Users },
    ],
    pending: [
        { name: 'Attente', href: '/dashboard', icon: Home },
    ],
}

const roleLabels = {
    gm: 'Grand Maître',
    officer: 'Officier',
    member: 'Membre',
    pending: 'En Attente',
}

const roleColors = {
    gm: 'text-amber-400',
    officer: 'text-[#4361EE]',
    member: 'text-emerald-400',
    pending: 'text-[#94A3B8]',
}

export function Sidebar({ user }: SidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const items = navigation[user.role] || navigation.pending

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    return (
        <aside className="hidden md:flex h-full w-64 flex-col border-r border-white/5 bg-[#161822]">
            {/* Logo / Header */}
            <div className="flex h-16 items-center gap-3 border-b border-white/5 px-5">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white/5 border border-white/10 group-hover:border-primary/50 transition-all">
                    <img
                        src="/logo jsc.png"
                        alt="JSC"
                        className="h-7 w-7 object-contain"
                    />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-white">JSC HR</h1>
                    <p className="text-xs text-[#94A3B8]">Recrutement</p>
                </div>
            </div>

            {/* User Info */}
            <div className="border-b border-white/5 px-5 py-4">
                <p className="truncate text-sm font-medium text-white">
                    {user.discordUsername || user.email}
                </p>
                <p className={cn('text-xs font-semibold mt-1', roleColors[user.role])}>
                    {roleLabels[user.role]}
                </p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-3">
                {items.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200',
                                isActive
                                    ? 'bg-[#4361EE]/10 text-[#4361EE]'
                                    : 'text-[#94A3B8] hover:bg-white/5 hover:text-white'
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            {/* Sign Out */}
            <div className="border-t border-white/5 p-3">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 rounded-2xl px-4 py-3 text-[#94A3B8] hover:bg-white/5 hover:text-white"
                    onClick={handleSignOut}
                >
                    <LogOut className="h-5 w-5" />
                    Déconnexion
                </Button>
            </div>
        </aside>
    )
}
