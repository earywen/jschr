'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition, useEffect } from 'react'
import { Database } from '@/types/database.types'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type CandidateStatus = Database['public']['Enums']['candidate_status']

const FILTERS: { label: string; value: string }[] = [
    { label: 'Toutes', value: 'all' },
    { label: 'En Attente', value: 'pending' },
    { label: 'Acceptées', value: 'accepted' },
    { label: 'Refusées', value: 'rejected' },
    { label: 'Waitlist', value: 'waitlist' },
]

interface FiltersProps {
    currentStatus?: CandidateStatus
}

export function CandidatesFilters({ currentStatus }: FiltersProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [activeTab, setActiveTab] = useState(currentStatus || 'all')

    // Sync state with prop (for back/forward navigation)
    useEffect(() => {
        setActiveTab(currentStatus || 'all')
    }, [currentStatus])

    const handleValueChange = (value: string) => {
        // Optimistic update
        setActiveTab(value)

        // Navigation update
        startTransition(() => {
            if (value === 'all') {
                router.push('/dashboard/candidates')
            } else {
                router.push(`/dashboard/candidates?status=${value}`)
            }
        })
    }

    return (
        <Tabs value={activeTab} onValueChange={handleValueChange} className="w-full">
            <TabsList className="bg-zinc-900 border border-zinc-800">
                {FILTERS.map((filter) => (
                    <TabsTrigger
                        key={filter.value}
                        value={filter.value}
                        disabled={isPending && activeTab === filter.value}
                        className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400 gap-2"
                    >
                        {filter.label}
                        {isPending && activeTab === filter.value && (
                            <span className="h-2 w-2 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
                        )}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    )
}
