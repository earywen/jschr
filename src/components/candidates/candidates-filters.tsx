'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Database } from '@/types/database.types'

type CandidateStatus = Database['public']['Enums']['candidate_status']

const FILTERS: { label: string; value: CandidateStatus | undefined }[] = [
    { label: 'Toutes', value: undefined },
    { label: 'En Attente', value: 'pending' },
    { label: 'Acceptées', value: 'accepted' },
    { label: 'Refusées', value: 'rejected' },
    { label: 'Waitlist', value: 'waitlist' },
]

interface FiltersProps {
    currentStatus?: CandidateStatus
}

export function CandidatesFilters({ currentStatus }: FiltersProps) {
    return (
        <div className="flex flex-wrap gap-2">
            {FILTERS.map((filter) => (
                <Link
                    key={filter.label}
                    href={
                        filter.value
                            ? `/dashboard/candidates?status=${filter.value}`
                            : '/dashboard/candidates'
                    }
                    className={cn(
                        'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                        currentStatus === filter.value ||
                            (currentStatus === undefined && filter.value === undefined)
                            ? 'bg-amber-500 text-black'
                            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    )}
                >
                    {filter.label}
                </Link>
            ))}
        </div>
    )
}
