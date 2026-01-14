import { getUserRole } from '@/lib/auth/role'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await getUserRole()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="min-h-screen bg-[#0B0C15]">
            {/* Mobile Navigation */}
            <MobileNav user={user} />

            <div className="flex h-screen">
                {/* Desktop Sidebar - hidden on mobile */}
                <Sidebar user={user} />

                {/* Main Content - adjust padding for mobile header */}
                <main className="flex-1 overflow-auto pt-14 md:pt-0">
                    <div className="p-4 md:p-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
