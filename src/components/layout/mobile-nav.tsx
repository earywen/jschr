'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    Users,
    Settings,
    LogOut,
    Home,
    Menu,
    X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose,
} from '@/components/ui/sheet'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

interface MobileNavProps {
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

export function MobileNav({ user }: MobileNavProps) {
    const pathname = usePathname()
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const items = navigation[user.role] || navigation.pending

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    const handleNavigation = (href: string) => {
        setOpen(false)
        router.push(href)
    }

    return (
        <div className="md:hidden fixed top-0 inset-x-0 z-50 h-14 bg-[#161822] border-b border-white/5 flex items-center justify-between px-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-white/5 border border-white/10">
                    <img
                        src="/logo jsc.png"
                        alt="JSC"
                        className="h-5 w-5 object-contain"
                    />
                </div>
                <span className="text-sm font-bold text-white">JSC HR</span>
            </div>

            {/* Hamburger Menu */}
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-[#94A3B8] hover:text-white hover:bg-white/5"
                    >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Ouvrir le menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent
                    side="left"
                    className="w-72 bg-[#161822] border-r border-white/5 p-0"
                >
                    <SheetHeader className="border-b border-white/5 px-5 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white/5 border border-white/10">
                                <img
                                    src="/logo jsc.png"
                                    alt="JSC"
                                    className="h-7 w-7 object-contain"
                                />
                            </div>
                            <div>
                                <SheetTitle className="text-lg font-bold text-white">JSC HR</SheetTitle>
                                <p className="text-xs text-[#94A3B8]">Recrutement</p>
                            </div>
                        </div>
                    </SheetHeader>

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
                                <button
                                    key={item.name}
                                    onClick={() => handleNavigation(item.href)}
                                    className={cn(
                                        'flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200',
                                        isActive
                                            ? 'bg-[#4361EE]/10 text-[#4361EE]'
                                            : 'text-[#94A3B8] hover:bg-white/5 hover:text-white'
                                    )}
                                >
                                    <item.icon className="h-5 w-5" />
                                    {item.name}
                                </button>
                            )
                        })}
                    </nav>

                    {/* Sign Out */}
                    <div className="absolute bottom-0 left-0 right-0 border-t border-white/5 p-3">
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 rounded-2xl px-4 py-3 text-[#94A3B8] hover:bg-white/5 hover:text-white"
                            onClick={handleSignOut}
                        >
                            <LogOut className="h-5 w-5" />
                            Déconnexion
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    )
}
