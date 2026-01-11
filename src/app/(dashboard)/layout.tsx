import { getUserRole } from '@/lib/auth/role'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'

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
        <div className="flex h-screen bg-zinc-950">
            {/* Sidebar */}
            <Sidebar user={user} />

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    )
}
