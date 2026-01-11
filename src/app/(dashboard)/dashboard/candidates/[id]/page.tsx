import { getCandidateById } from '@/lib/actions/candidate-detail'
import { getNotesForCandidate } from '@/lib/actions/officer-notes'
import { getMyVote, getVoteSynthesis } from '@/lib/actions/votes'
import { getUserRole } from '@/lib/auth/role'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DecisionButtons } from '@/components/candidates/decision-buttons'
import { AddNoteForm } from '@/components/candidates/add-note-form'
import { NotesList } from '@/components/candidates/notes-list'
import { VoteButtons } from '@/components/candidates/vote-buttons'
import { VoteSynthesisCard } from '@/components/candidates/vote-synthesis-card'
import { WarcraftLogsCard } from '@/components/candidates/warcraftlogs-card'
import { formatDistanceToNow, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
    ArrowLeft,
    Clock,
    CheckCircle,
    XCircle,
    Pause,
    User,
    Sword,
    MessageSquare,
    ExternalLink,
    Calendar
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PageProps {
    params: Promise<{ id: string }>
}

const statusConfig = {
    pending: {
        label: 'En Attente',
        icon: Clock,
        className: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    accepted: {
        label: 'Acceptée',
        icon: CheckCircle,
        className: 'text-green-400 bg-green-500/10 border-green-500/20',
    },
    rejected: {
        label: 'Refusée',
        icon: XCircle,
        className: 'text-red-400 bg-red-500/10 border-red-500/20',
    },
    waitlist: {
        label: 'Waitlist',
        icon: Pause,
        className: 'text-zinc-400 bg-zinc-600/10 border-zinc-500/20',
    },
}

export default async function CandidateDetailPage({ params }: PageProps) {
    const { id } = await params
    const [candidate, user, notes, myVote, voteSynthesis] = await Promise.all([
        getCandidateById(id),
        getUserRole(),
        getNotesForCandidate(id),
        getMyVote(id),
        getVoteSynthesis(id),
    ])

    if (!candidate) {
        notFound()
    }

    const isGM = user?.role === 'gm'
    const isOfficerOrHigher = user?.role === 'officer' || user?.role === 'gm'
    const isMemberOrHigher = user?.role === 'member' || user?.role === 'officer' || user?.role === 'gm'
    const status = statusConfig[candidate.status]
    const StatusIcon = status.icon

    return (
        <div className="space-y-6">
            {/* Back Button & Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="icon" className="text-zinc-400">
                        <Link href="/dashboard/candidates">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1
                                className="text-3xl font-bold"
                                style={{ color: candidate.wow_class?.color || '#fff' }}
                            >
                                {candidate.name}
                            </h1>
                            <span
                                className={cn(
                                    'flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium',
                                    status.className
                                )}
                            >
                                <StatusIcon className="h-3 w-3" />
                                {status.label}
                            </span>
                        </div>
                        <p className="text-zinc-400">
                            {candidate.wow_class?.name} - {candidate.wow_spec?.name}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Motivation */}
                    <Card className="border-zinc-800 bg-zinc-900">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                                <MessageSquare className="h-5 w-5 text-amber-400" />
                                Motivation
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-wrap text-zinc-300">
                                {candidate.motivation || 'Aucune motivation fournie.'}
                            </p>
                        </CardContent>
                    </Card>

                    {/* WarcraftLogs */}
                    {candidate.warcraftlogs_link && (
                        <Card className="border-zinc-800 bg-zinc-900">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-white">
                                    <ExternalLink className="h-5 w-5 text-orange-400" />
                                    WarcraftLogs
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <a
                                    href={candidate.warcraftlogs_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-orange-400 hover:underline"
                                >
                                    {candidate.warcraftlogs_link}
                                </a>
                            </CardContent>
                        </Card>
                    )}

                    {/* Officer Notes */}
                    {isOfficerOrHigher && (
                        <Card className="border-purple-500/30 bg-zinc-900">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-white">
                                    <MessageSquare className="h-5 w-5 text-purple-400" />
                                    Notes Officiers ({notes.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <AddNoteForm candidateId={candidate.id} />
                                <NotesList notes={notes} />
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* GM Decision Buttons */}
                    {isGM && (
                        <Card className="border-amber-500/30 bg-zinc-900">
                            <CardContent className="pt-6">
                                <DecisionButtons
                                    candidateId={candidate.id}
                                    currentStatus={candidate.status}
                                />
                            </CardContent>
                        </Card>
                    )}

                    {/* Vote Synthesis for Officers/GM */}
                    {isOfficerOrHigher && (
                        <Card className="border-blue-500/30 bg-zinc-900">
                            <CardContent className="pt-6">
                                <VoteSynthesisCard synthesis={voteSynthesis} />
                            </CardContent>
                        </Card>
                    )}

                    {/* Member Voting */}
                    {isMemberOrHigher && candidate.status === 'pending' && (
                        <Card className="border-green-500/30 bg-zinc-900">
                            <CardContent className="pt-6">
                                <VoteButtons
                                    candidateId={candidate.id}
                                    currentVote={myVote}
                                />
                            </CardContent>
                        </Card>
                    )}

                    {/* Info Card */}
                    <Card className="border-zinc-800 bg-zinc-900">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                                <User className="h-5 w-5 text-zinc-400" />
                                Informations
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-xs text-zinc-500">Classe</p>
                                <p
                                    className="font-medium"
                                    style={{ color: candidate.wow_class?.color }}
                                >
                                    {candidate.wow_class?.name}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-zinc-500">Spécialisation</p>
                                <p className="font-medium text-white">
                                    {candidate.wow_spec?.name} ({candidate.wow_spec?.role})
                                </p>
                            </div>
                            {candidate.battle_tag && (
                                <div>
                                    <p className="text-xs text-zinc-500">BattleTag</p>
                                    <p className="font-medium text-white">{candidate.battle_tag}</p>
                                </div>
                            )}
                            {/* WarcraftLogs */}
                            {candidate.warcraftlogs_link && (
                                <WarcraftLogsCard
                                    candidateId={candidate.id}
                                    score={candidate.wlogs_score}
                                    color={candidate.wlogs_color}
                                    link={candidate.warcraftlogs_link}
                                />
                            )}
                        </CardContent>
                    </Card>

                    {/* Dates Card */}
                    <Card className="border-zinc-800 bg-zinc-900">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                                <Calendar className="h-5 w-5 text-zinc-400" />
                                Dates
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-xs text-zinc-500">Candidature soumise</p>
                                <p className="font-medium text-white">
                                    {format(new Date(candidate.created_at), 'PPP', { locale: fr })}
                                </p>
                                <p className="text-xs text-zinc-500">
                                    ({formatDistanceToNow(new Date(candidate.created_at), {
                                        addSuffix: true,
                                        locale: fr,
                                    })})
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
