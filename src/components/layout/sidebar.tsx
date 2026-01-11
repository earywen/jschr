'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    Users,
    FileText,
    Vote,
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
    }
}

const navigation = {
    gm: [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'Candidatures', href: '/dashboard/candidates', icon: Users },
        { name: 'Notes Officiers', href: '/dashboard/notes', icon: FileText },
        { name: 'Votes', href: '/dashboard/votes', icon: Vote },
        { name: 'Paramètres', href: '/dashboard/settings', icon: Settings },
    ],
    officer: [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'Candidatures', href: '/dashboard/candidates', icon: Users },
        { name: 'Notes Officiers', href: '/dashboard/notes', icon: FileText },
        { name: 'Votes', href: '/dashboard/votes', icon: Vote },
    ],
    member: [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'Candidatures', href: '/dashboard/candidates', icon: Users },
        { name: 'Mes Votes', href: '/dashboard/votes', icon: Vote },
    ],
    pending: [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
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
    officer: 'text-purple-400',
    member: 'text-green-400',
    pending: 'text-zinc-500',
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
        <aside className="flex h-full w-64 flex-col border-r border-zinc-800 bg-zinc-900">
            {/* Logo / Header */}
            <div className="flex h-16 items-center gap-2 border-b border-zinc-800 px-4">
                <Shield className="h-8 w-8 text-amber-500" />
                <div>
                    <h1 className="text-lg font-bold text-white">JSC HR</h1>
                    <p className="text-xs text-zinc-500">Recrutement</p>
                </div>
            </div>

            {/* User Info */}
            <div className="border-b border-zinc-800 px-4 py-3">
                <p className="truncate text-sm font-medium text-zinc-200">
                    {user.email}
                </p>
                <p className={cn('text-xs font-semibold', roleColors[user.role])}>
                    {roleLabels[user.role]}
                </p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-2">
                {items.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-zinc-800 text-white'
                                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            {/* Sign Out */}
            <div className="border-t border-zinc-800 p-2">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                    onClick={handleSignOut}
                >
                    <LogOut className="h-5 w-5" />
                    Déconnexion
                </Button>
            </div>
        </aside>
    )
}
