'use client'


import { useIsMobile } from '@/lib/hooks/use-media-query'
import { CandidateMobileCard } from './candidate-mobile-card'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
    type VisibilityState,
    type Column,
} from '@tanstack/react-table'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
    ArrowUpDown,
    ChevronDown,
    Clock,
    CheckCircle,
    XCircle,
    Pause,
    Trash2,
    Eye,
    MoreHorizontal,
    Search,
    Filter,
    X,
} from 'lucide-react'

import { CandidateWithDetails } from '@/lib/actions/candidates-queries'
import { deleteCandidates } from '@/lib/actions/candidates'
import { cn, getApprovalColor } from '@/lib/utils'
import { SafeImage } from '@/components/ui/safe-image'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { updateCandidatesStatus } from '@/lib/actions/candidates'

// ═══════════════════════════════════════════════════════════════════════════
// STATUS CONFIG
// ═══════════════════════════════════════════════════════════════════════════

const statusConfig = {
    pending: {
        label: 'En Attente',
        icon: Clock,
        className: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    accepted: {
        label: 'Acceptée',
        icon: CheckCircle,
        className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    rejected: {
        label: 'Refusée',
        icon: XCircle,
        className: 'bg-red-500/10 text-red-400 border-red-500/20',
    },
    waitlist: {
        label: 'Waitlist',
        icon: Pause,
        className: 'bg-[#4361EE]/10 text-[#4361EE] border-[#4361EE]/20',
    },
}

// ═══════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════

function getMPlusColor(score: number | null | undefined): string {
    if (!score) return '#94A3B8'
    if (score >= 3000) return '#ff8000'
    if (score >= 2500) return '#a335ee'
    if (score >= 2000) return '#0070dd'
    if (score >= 1000) return '#1eff00'
    return '#ffffff'
}

// ═══════════════════════════════════════════════════════════════════════════
// FILTER HEADER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface FilterHeaderProps<TData> {
    column: Column<TData, unknown>
    title: string
    options: { value: string; label: string; color?: string }[]
}

function FilterHeader<TData>({ column, title, options }: FilterHeaderProps<TData>) {
    const filterValue = column.getFilterValue() as string | undefined
    const isFiltered = filterValue !== undefined && filterValue !== ''

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className={cn(
                        "hover:bg-white/5 text-[#94A3B8] hover:text-white gap-1",
                        isFiltered && "text-[#4361EE]"
                    )}
                >
                    {title}
                    {isFiltered ? (
                        <Filter className="ml-1 h-3 w-3 fill-current" />
                    ) : (
                        <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                className="bg-[#161822] border-white/10 min-w-[160px]"
            >
                <DropdownMenuLabel className="text-[#94A3B8] text-xs">
                    Filtrer par {title.toLowerCase()}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/5" />
                {isFiltered && (
                    <>
                        <DropdownMenuItem
                            onClick={() => column.setFilterValue(undefined)}
                            className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                        >
                            <X className="mr-2 h-4 w-4" />
                            Effacer le filtre
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/5" />
                    </>
                )}
                {options.map((option) => (
                    <DropdownMenuItem
                        key={option.value}
                        onClick={() => column.setFilterValue(option.value)}
                        className={cn(
                            "cursor-pointer",
                            filterValue === option.value
                                ? "bg-[#4361EE]/20 text-white"
                                : "text-white hover:bg-white/5"
                        )}
                    >
                        <span style={{ color: option.color }}>{option.label}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

// ═══════════════════════════════════════════════════════════════════════════
// NUMERIC FILTER HEADER COMPONENT (for min value filtering)
// ═══════════════════════════════════════════════════════════════════════════

interface NumericFilterHeaderProps<TData> {
    column: Column<TData, unknown>
    title: string
}

function NumericFilterHeader<TData>({ column, title }: NumericFilterHeaderProps<TData>) {
    const filterValue = column.getFilterValue() as number | undefined
    const isFiltered = filterValue !== undefined
    const [inputValue, setInputValue] = React.useState(filterValue?.toString() ?? '')

    const handleApplyFilter = () => {
        const num = parseInt(inputValue)
        if (!isNaN(num) && num > 0) {
            column.setFilterValue(num)
        }
    }

    const handleClearFilter = () => {
        column.setFilterValue(undefined)
        setInputValue('')
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleApplyFilter()
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className={cn(
                        "hover:bg-white/5 text-[#94A3B8] hover:text-white gap-1",
                        isFiltered && "text-[#4361EE]"
                    )}
                >
                    {title}
                    {isFiltered ? (
                        <>
                            <span className="text-xs ml-1">≥{filterValue}</span>
                            <Filter className="ml-1 h-3 w-3 fill-current" />
                        </>
                    ) : (
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                className="bg-[#161822] border-white/10 min-w-[200px] p-3"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="space-y-3">
                    <p className="text-[#94A3B8] text-xs font-medium">
                        Afficher uniquement ≥
                    </p>
                    <div className="flex gap-2">
                        <Input
                            type="number"
                            placeholder="Ex: 3000"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="bg-[#0B0C15] border-white/10 text-white h-8 text-sm"
                        />
                        <Button
                            size="sm"
                            onClick={handleApplyFilter}
                            className="bg-[#4361EE] hover:bg-[#4361EE]/80 h-8 px-3"
                        >
                            OK
                        </Button>
                    </div>
                    {isFiltered && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearFilter}
                            className="w-full text-red-400 hover:bg-red-500/10 hover:text-red-400 h-7"
                        >
                            <X className="mr-2 h-3 w-3" />
                            Effacer le filtre
                        </Button>
                    )}
                    <DropdownMenuSeparator className="bg-white/5" />
                    <div className="flex gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => column.toggleSorting(false)}
                            className="flex-1 text-[#94A3B8] hover:text-white hover:bg-white/5 h-7 text-xs"
                        >
                            ↑ Croissant
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => column.toggleSorting(true)}
                            className="flex-1 text-[#94A3B8] hover:text-white hover:bg-white/5 h-7 text-xs"
                        >
                            ↓ Décroissant
                        </Button>
                    </div>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

// ═══════════════════════════════════════════════════════════════════════════
// COLUMNS DEFINITION
// ═══════════════════════════════════════════════════════════════════════════

export function createColumns(
    router: ReturnType<typeof useRouter>,
    isGM: boolean,
    onDelete: (id: string) => void,
    onResendNotification: (id: string) => void,
    classOptions: { value: string; label: string; color?: string }[],
    specOptions: { value: string; label: string; color?: string }[]
): ColumnDef<CandidateWithDetails>[] {
    const columns: ColumnDef<CandidateWithDetails>[] = []

    // Selection column (GM only) — NO HEADER CHECKBOX
    if (isGM) {
        columns.push({
            id: 'select',
            header: () => <div className="w-4" />,
            cell: ({ row }) => (
                <div className="pl-4">
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Sélectionner"
                        className="border-white/20"
                    />
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
        })
    }

    // Candidate column (Avatar + Name ONLY)
    columns.push({
        accessorKey: 'name',
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                className="hover:bg-white/5 text-[#94A3B8] hover:text-white"
            >
                Candidat
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const candidate = row.original
            return (
                <div className="flex items-center gap-3 text-left">
                    <div
                        className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-xl"
                        style={{
                            border: `2px solid ${candidate.wow_class?.color || '#666'}`,
                        }}
                    >
                        <div
                            className="absolute inset-0 flex items-center justify-center text-sm font-bold"
                            style={{
                                backgroundColor: `${candidate.wow_class?.color}20` || '#333',
                                color: candidate.wow_class?.color || '#fff',
                            }}
                        >
                            {candidate.name.charAt(0).toUpperCase()}
                        </div>
                        {candidate.avatar_url && (
                            <SafeImage
                                src={candidate.avatar_url}
                                alt={candidate.name}
                                className="relative z-10 h-full w-full object-cover"
                            />
                        )}
                    </div>
                    <span className="text-sm font-semibold text-white">{candidate.name}</span>
                </div>
            )
        },
    })

    // Classe column with FILTER dropdown
    columns.push({
        id: 'classe',
        accessorFn: (row) => row.wow_class?.name || '',
        header: ({ column }) => (
            <div className="flex justify-center w-full">
                <FilterHeader column={column} title="Classe" options={classOptions} />
            </div>
        ),
        cell: ({ row }) => {
            const wowClass = row.original.wow_class
            return (
                <div className="text-center">
                    <span
                        className="text-sm font-medium"
                        style={{ color: wowClass?.color || '#94A3B8' }}
                    >
                        {wowClass?.name || '—'}
                    </span>
                </div>
            )
        },
        filterFn: 'equals',
    })

    // Spécialisation column with FILTER dropdown
    columns.push({
        id: 'spec',
        accessorFn: (row) => row.wow_spec?.name || '',
        header: ({ column }) => (
            <div className="flex justify-center w-full">
                <FilterHeader column={column} title="Spé" options={specOptions} />
            </div>
        ),
        cell: ({ row }) => {
            const wowSpec = row.original.wow_spec
            const wowClass = row.original.wow_class
            return (
                <div className="text-center">
                    <span
                        className="text-sm"
                        style={{ color: wowClass?.color || '#94A3B8' }}
                    >
                        {wowSpec?.name || '—'}
                    </span>
                </div>
            )
        },
        filterFn: 'equals',
    })

    // iLvl column with NUMERIC filter
    columns.push({
        accessorKey: 'wlogs_ilvl',
        header: ({ column }) => (
            <div className="flex justify-center w-full">
                <NumericFilterHeader column={column} title="iLvl" />
            </div>
        ),
        cell: ({ row }) => (
            <div className="text-center">
                <span className="text-sm font-mono text-white">
                    {row.original.wlogs_ilvl || '—'}
                </span>
            </div>
        ),
        filterFn: (row, id, filterValue) => {
            const value = row.getValue(id) as number | null
            if (value === null || value === undefined) return false
            return value >= (filterValue as number)
        },
    })

    // Logs Score column with NUMERIC filter
    columns.push({
        accessorKey: 'wlogs_score',
        header: ({ column }) => (
            <div className="flex justify-center w-full">
                <NumericFilterHeader column={column} title="Logs" />
            </div>
        ),
        cell: ({ row }) => (
            <div className="text-center">
                <span
                    className="text-sm font-bold"
                    style={{ color: row.original.wlogs_color || '#94A3B8' }}
                >
                    {row.original.wlogs_score ? Math.round(row.original.wlogs_score) : '—'}
                </span>
            </div>
        ),
        filterFn: (row, id, filterValue) => {
            const value = row.getValue(id) as number | null
            if (value === null || value === undefined) return false
            return value >= (filterValue as number)
        },
    })

    // MM+ Score column with NUMERIC filter
    columns.push({
        accessorKey: 'wlogs_mythic_plus_score',
        header: ({ column }) => (
            <div className="flex justify-center w-full">
                <NumericFilterHeader column={column} title="MM+" />
            </div>
        ),
        cell: ({ row }) => {
            const score = row.original.wlogs_mythic_plus_score
            return (
                <div className="text-center">
                    <span className="text-sm font-bold" style={{ color: getMPlusColor(score) }}>
                        {score ? Math.round(score) : '—'}
                    </span>
                </div>
            )
        },
        filterFn: (row, id, filterValue) => {
            const value = row.getValue(id) as number | null
            if (value === null || value === undefined) return false
            return value >= (filterValue as number)
        },
    })

    // Progress column
    columns.push({
        accessorKey: 'wlogs_raid_progress',
        header: () => <div className="text-center text-[#94A3B8] font-semibold">Progress</div>,
        cell: ({ row }) => (
            <div className="text-center">
                <span className="text-[#94A3B8] text-sm">
                    {row.original.wlogs_raid_progress || '—'}
                </span>
            </div>
        ),
    })

    // Approval Rate column
    columns.push({
        accessorKey: 'approval_rate',
        header: ({ column }) => (
            <div className="flex justify-center w-full">
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="hover:bg-white/5 text-[#94A3B8] hover:text-white"
                >
                    Approb.
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            </div>
        ),
        cell: ({ row }) => {
            const rate = row.original.approval_rate
            return (
                <div className="text-center">
                    <span
                        className="italic font-bold text-sm"
                        style={{ color: getApprovalColor(rate) }}
                    >
                        {rate !== undefined ? `${rate}%` : '—'}
                    </span>
                </div>
            )
        },
    })

    // Status column with FILTER
    columns.push({
        accessorKey: 'status',
        header: ({ column }) => (
            <FilterHeader
                column={column}
                title="Statut"
                options={[
                    { value: 'pending', label: 'En Attente' },
                    { value: 'accepted', label: 'Acceptée' },
                    { value: 'rejected', label: 'Refusée' },
                    { value: 'waitlist', label: 'Waitlist' },
                ]}
            />
        ),
        cell: ({ row }) => {
            const status = statusConfig[row.original.status as keyof typeof statusConfig]
            const Icon = status.icon
            return (
                <span
                    className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
                        status.className
                    )}
                >
                    <Icon className="h-3 w-3" />
                    {status.label}
                </span>
            )
        },
        filterFn: 'equals',
    })

    // Date column
    columns.push({
        accessorKey: 'created_at',
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                className="hover:bg-white/5 text-[#94A3B8] hover:text-white"
            >
                Date
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => (
            <span className="text-[#94A3B8] text-sm whitespace-nowrap text-left">
                {formatDistanceToNow(new Date(row.original.created_at), {
                    addSuffix: true,
                    locale: fr,
                })}
            </span>
        ),
    })

    // Actions column
    columns.push({
        id: 'actions',
        enableHiding: false,
        header: () => null,
        cell: ({ row }) => {
            const candidate = row.original
            return (
                <div className="text-right pr-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-white/5"
                            >
                                <span className="sr-only">Menu</span>
                                <MoreHorizontal className="h-4 w-4 text-[#94A3B8]" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="bg-[#161822] border-white/10"
                        >
                            <DropdownMenuLabel className="text-[#94A3B8]">
                                Actions
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white/5" />
                            <DropdownMenuItem
                                onClick={() => router.push(`/dashboard/candidates/${candidate.id}`)}
                                className="text-white hover:bg-white/5 cursor-pointer"
                            >
                                <Eye className="mr-2 h-4 w-4" />
                                Voir le profil
                            </DropdownMenuItem>
                            {isGM && (
                                <>
                                    <DropdownMenuItem
                                        onClick={() => onResendNotification(candidate.id)}
                                        className="text-[#5865F2] hover:bg-[#5865F2]/10 cursor-pointer"
                                    >
                                        <svg
                                            className="mr-2 h-4 w-4"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                        >
                                            <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12z" />
                                        </svg>
                                        Renvoyer sur Discord
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-white/5" />
                                    <DropdownMenuItem
                                        onClick={() => onDelete(candidate.id)}
                                        className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Supprimer
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        },
    })

    return columns
}

// ═══════════════════════════════════════════════════════════════════════════
// DATA TABLE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface DataTableProps {
    candidates: CandidateWithDetails[]
    userRole?: string
}

export function CandidatesDataTable({ candidates, userRole }: DataTableProps) {
    const router = useRouter()
    const isGM = userRole === 'gm'
    const isMobile = useIsMobile()

    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const [globalFilter, setGlobalFilter] = React.useState('')

    const [deleteTargetId, setDeleteTargetId] = React.useState<string | null>(null)
    const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
    const [isDeleting, setIsDeleting] = React.useState(false)
    const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false)
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 14, // Default value from previous code (implied)
    })

    const handleDelete = (id: string) => {
        setDeleteTargetId(id)
        setShowDeleteDialog(true)
    }

    const handleResendNotification = async (id: string) => {
        try {
            const { resendCandidateNotification } = await import('@/lib/actions/candidates')
            const result = await resendCandidateNotification(id)

            if (result.success) {
                toast.success('Notification Discord envoyée')
            } else {
                toast.error(result.error || 'Erreur lors de l\'envoi')
            }
        } catch (error) {
            toast.error('Une erreur est survenue')
        }
    }

    // Extract unique classes and specs for filters
    const classOptions = React.useMemo(() => {
        const classes = new Map<string, { value: string; label: string; color?: string }>()
        candidates.forEach((c) => {
            if (c.wow_class?.name) {
                classes.set(c.wow_class.name, {
                    value: c.wow_class.name,
                    label: c.wow_class.name,
                    color: c.wow_class.color,
                })
            }
        })
        return Array.from(classes.values()).sort((a, b) => a.label.localeCompare(b.label))
    }, [candidates])

    const specOptions = React.useMemo(() => {
        const specs = new Map<string, { value: string; label: string; color?: string }>()
        candidates.forEach((c) => {
            if (c.wow_spec?.name) {
                specs.set(c.wow_spec.name, {
                    value: c.wow_spec.name,
                    label: c.wow_spec.name,
                    color: c.wow_class?.color,
                })
            }
        })
        return Array.from(specs.values()).sort((a, b) => a.label.localeCompare(b.label))
    }, [candidates])

    const columns = React.useMemo(
        () => createColumns(router, isGM, handleDelete, handleResendNotification, classOptions, specOptions),
        [router, isGM, classOptions, specOptions]
    )

    const table = useReactTable({
        data: candidates,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        globalFilterFn: 'includesString',
        onPaginationChange: setPagination,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            globalFilter,
            pagination,
        },
    })

    const selectedRows = table.getFilteredSelectedRowModel().rows
    const selectedIds = selectedRows.map((row) => row.original.id)
    const activeFiltersCount = columnFilters.length

    const handleBulkDelete = async () => {
        const idsToDelete = deleteTargetId ? [deleteTargetId] : selectedIds
        if (idsToDelete.length === 0) return

        setIsDeleting(true)
        try {
            const result = await deleteCandidates(idsToDelete)
            if (result.success) {
                toast.success(`${idsToDelete.length} candidature(s) supprimée(s)`)
                setRowSelection({})
                router.refresh()
            } else {
                toast.error(result.error || 'Erreur lors de la suppression')
            }
        } catch {
            toast.error('Une erreur est survenue')
        } finally {
            setIsDeleting(false)
            setShowDeleteDialog(false)
            setDeleteTargetId(null)
        }
    }


    const handleBulkStatusUpdate = async (status: string) => {
        if (selectedIds.length === 0) return

        setIsUpdatingStatus(true)
        try {
            const result = await updateCandidatesStatus(selectedIds, status)
            if (result.success) {
                toast.success(`${selectedIds.length} statut(s) mis à jour`)
                setRowSelection({})
                router.refresh()
            } else {
                toast.error(result.error || 'Erreur lors de la mise à jour')
            }
        } catch {
            toast.error('Une erreur est survenue')
        } finally {
            setIsUpdatingStatus(false)
        }
    }

    const clearAllFilters = () => {
        setColumnFilters([])
        setGlobalFilter('')
    }

    return (
        <div className="space-y-4">
            {/* Toolbar - same for both */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* ... existing toolbar content ... */}
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                    <Input
                        placeholder="Rechercher..."
                        value={globalFilter ?? ''}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="pl-9 bg-[#161822] border-white/5 text-white placeholder:text-[#94A3B8] focus-visible:ring-[#4361EE]/50"
                    />
                </div>

                <div className="flex items-center gap-2">
                    {/* Clear all filters */}
                    {activeFiltersCount > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearAllFilters}
                            className="gap-2 bg-[#161822] border-[#4361EE]/30 text-[#4361EE] hover:bg-[#4361EE]/10 hover:text-[#4361EE]"
                        >
                            <X className="h-4 w-4" />
                            Effacer {activeFiltersCount} filtre(s)
                        </Button>
                    )}

                    {/* Bulk Actions */}
                    {selectedIds.length > 0 && isGM && (
                        <div className="flex items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={isUpdatingStatus}
                                        className="gap-2 bg-[#161822] border-white/5 text-white hover:bg-white/5"
                                    >
                                        Statut ({selectedIds.length})
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-[#161822] border-white/10">
                                    <DropdownMenuLabel className="text-[#94A3B8]">Changer le statut</DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-white/5" />
                                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate('accepted')} className="text-emerald-400 hover:bg-emerald-500/10 cursor-pointer">
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Acceptée
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate('rejected')} className="text-red-400 hover:bg-red-500/10 cursor-pointer">
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Refusée
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate('waitlist')} className="text-[#4361EE] hover:bg-[#4361EE]/10 cursor-pointer">
                                        <Pause className="mr-2 h-4 w-4" />
                                        Waitlist
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate('pending')} className="text-amber-400 hover:bg-amber-500/10 cursor-pointer">
                                        <Clock className="mr-2 h-4 w-4" />
                                        En attente
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                    setDeleteTargetId(null)
                                    setShowDeleteDialog(true)
                                }}
                                className="gap-2 bg-red-600 hover:bg-red-500"
                            >
                                <Trash2 className="h-4 w-4" />
                                Supprimer ({selectedIds.length})
                            </Button>
                        </div>
                    )}

                    {/* Column visibility - only on desktop */}
                    {!isMobile && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-[#161822] border-white/5 text-[#94A3B8] hover:bg-white/5 hover:text-white"
                                >
                                    Colonnes
                                    <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="bg-[#161822] border-white/10"
                            >
                                {table
                                    .getAllColumns()
                                    .filter((column) => column.getCanHide())
                                    .map((column) => {
                                        const labels: Record<string, string> = {
                                            name: 'Candidat',
                                            classe: 'Classe',
                                            spec: 'Spécialisation',
                                            wlogs_ilvl: 'iLvl',
                                            wlogs_score: 'Logs',
                                            wlogs_mythic_plus_score: 'MM+',
                                            wlogs_raid_progress: 'Progress',
                                            approval_rate: 'Approbation',
                                            status: 'Statut',
                                            created_at: 'Date',
                                        }
                                        return (
                                            <DropdownMenuCheckboxItem
                                                key={column.id}
                                                className="text-white hover:bg-white/5"
                                                checked={column.getIsVisible()}
                                                onCheckedChange={(value) =>
                                                    column.toggleVisibility(!!value)
                                                }
                                            >
                                                {labels[column.id] || column.id}
                                            </DropdownMenuCheckboxItem>
                                        )
                                    })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>

            {/* Content Switch: Cards (Mobile) vs Table (Desktop) */}
            {isMobile ? (
                <div className="space-y-3 pb-20 md:pb-0">
                    {table.getRowModel().rows.length > 0 ? (
                        table.getRowModel().rows.map((row) => (
                            <CandidateMobileCard
                                key={row.original.id}
                                candidate={row.original}
                            />
                        ))
                    ) : (
                        <div className="text-center py-8 text-[#94A3B8]">
                            Aucune candidature trouvée.
                        </div>
                    )}
                </div>
            ) : (
                <div className="rounded-3xl border border-white/5 bg-[#161822] overflow-hidden">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow
                                    key={headerGroup.id}
                                    className="border-white/5 hover:bg-transparent"
                                >
                                    {headerGroup.headers.map((header) => (
                                        <TableHead
                                            key={header.id}
                                            className="text-[#94A3B8] font-semibold h-12 text-left"
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && 'selected'}
                                        className="border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors h-14"
                                        onClick={() =>
                                            router.push(`/dashboard/candidates/${row.original.id}`)
                                        }
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell
                                                key={cell.id}
                                                className="py-3 text-left"
                                                onClick={(e) => {
                                                    if (
                                                        cell.column.id === 'select' ||
                                                        cell.column.id === 'actions'
                                                    ) {
                                                        e.stopPropagation()
                                                    }
                                                }}
                                            >
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center text-[#94A3B8]"
                                    >
                                        Aucune candidature trouvée.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between pt-2">
                <p className="text-sm text-[#94A3B8]">
                    {table.getFilteredRowModel().rows.length} candidature(s)
                    {selectedIds.length > 0 && ` • ${selectedIds.length} sélectionnée(s)`}
                </p>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-[#94A3B8]">Lignes par page</p>
                        <Select
                            value={`${table.getState().pagination.pageSize}`}
                            onValueChange={(value) => {
                                table.setPageSize(Number(value))
                            }}
                        >
                            <SelectTrigger className="h-8 w-[70px] bg-[#161822] border-white/5 text-white">
                                <SelectValue placeholder={table.getState().pagination.pageSize} />
                            </SelectTrigger>
                            <SelectContent side="top" className="bg-[#161822] border-white/10 text-white">
                                {[10, 20, 30, 50, 100].map((pageSize) => (
                                    <SelectItem key={pageSize} value={`${pageSize}`} className="cursor-pointer hover:bg-white/5">
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="bg-[#161822] border-white/5 text-[#94A3B8] hover:bg-white/5 hover:text-white disabled:opacity-50"
                    >
                        Précédent
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="bg-[#161822] border-white/5 text-[#94A3B8] hover:bg-white/5 hover:text-white disabled:opacity-50"
                    >
                        Suivant
                    </Button>
                </div>
            </div>

            {/* Delete Dialog - Same */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                {/* ... existing dialog content ... */}
                <AlertDialogContent className="bg-[#161822] border-white/10 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                        <AlertDialogDescription className="text-[#94A3B8]">
                            Vous êtes sur le point de supprimer définitivement{' '}
                            <span className="font-semibold text-white">
                                {deleteTargetId ? 1 : selectedIds.length}
                            </span>{' '}
                            candidature(s). Cette action est irréversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-[#0B0C15] border-white/5 hover:bg-white/5 hover:text-white">
                            Annuler
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault()
                                handleBulkDelete()
                            }}
                            className="bg-red-600 text-white hover:bg-red-500"
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Suppression...' : 'Supprimer'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
