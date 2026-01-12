import { getCandidateById } from '@/lib/actions/candidate-detail'
import { getNotesForCandidate } from '@/lib/actions/officer-notes'
import { getMyVote, getVoteSynthesis } from '@/lib/actions/votes'
import { getUserRole } from '@/lib/auth/role'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { GlassCard } from '@/components/ui/glass-card'
import { NeonBadge } from '@/components/ui/neon-badge'
import { BlurFade } from '@/components/ui/blur-fade'
import { DecisionButtons } from '@/components/candidates/decision-buttons'
import { AddNoteForm } from '@/components/candidates/add-note-form'
import { NotesList } from '@/components/candidates/notes-list'
import { VoteButtons } from '@/components/candidates/vote-buttons'
import { VoteSynthesisCard } from '@/components/candidates/vote-synthesis-card'
import { WarcraftLogsCard } from '@/components/candidates/warcraftlogs-card'
import { DeleteCandidateButton } from '@/components/candidates/delete-candidate-button'
import { SafeImage } from '@/components/ui/safe-image'
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
    Calendar,
    LayoutGrid,
    Target,
    Users
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PageProps {
    params: Promise<{ id: string }>
}

const statusConfig = {
    pending: {
        label: 'En Attente',
        icon: Clock,
        variant: 'pending' as const,
    },
    accepted: {
        label: 'Acceptée',
        icon: CheckCircle,
        variant: 'success' as const,
    },
    rejected: {
        label: 'Refusée',
        icon: XCircle,
        variant: 'destructive' as const,
    },
    waitlist: {
        label: 'Waitlist',
        icon: Pause,
        variant: 'secondary' as const,
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

    return (
        <div className="mx-auto max-w-7xl animate-in fade-in duration-700">
            {/* Nav & Header */}
            <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div className="flex flex-col gap-4">
                    <Link
                        href="/dashboard/candidates"
                        className="group flex w-fit items-center gap-2 text-sm font-medium text-zinc-500 hover:text-[var(--primary)] transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        Retour au Dashboard
                    </Link>
                    <div className="flex items-center gap-5">
                        <div
                            className="relative h-20 w-20 overflow-hidden rounded-2xl border-2 shadow-[0_0_30px_rgba(0,0,0,0.5)]"
                            style={{ borderColor: candidate.wow_class?.color || '#666' }}
                        >
                            <div
                                className="absolute inset-0 flex items-center justify-center text-3xl font-bold"
                                style={{
                                    backgroundColor: `${candidate.wow_class?.color}20` || '#333',
                                    color: candidate.wow_class?.color || '#fff'
                                }}
                            >
                                {candidate.name.charAt(0)}
                            </div>
                            {candidate.avatar_url && (
                                <SafeImage
                                    src={candidate.avatar_url}
                                    alt={candidate.name}
                                    className="relative z-10 h-full w-full object-cover"
                                />
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-4xl font-black tracking-tight text-white mb-1">
                                    {candidate.name}
                                </h1>
                                <NeonBadge variant={status.variant} className="gap-1.5 py-1 px-3">
                                    <status.icon className="h-3 w-3" />
                                    {status.label}
                                </NeonBadge>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-bold" style={{ color: candidate.wow_class?.color }}>
                                    {candidate.wow_class?.name}
                                </span>
                                <span className="text-zinc-500">•</span>
                                <span className="text-lg text-zinc-300 font-medium">{candidate.wow_spec?.name}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {isGM && (
                    <BlurFade delay={0.2} direction="left">
                        <DeleteCandidateButton candidateId={candidate.id} />
                    </BlurFade>
                )}
            </div>

            {/* Bento Grid Cockpit */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 xl:grid-cols-12">

                {/* Decision / Vote Column */}
                <div className="lg:col-span-4 xl:col-span-3 space-y-6 lg:order-2">
                    {/* GM Action */}
                    {isGM && (
                        <BlurFade delay={0.1}>
                            <GlassCard className="border-amber-500/20 bg-amber-500/5" innerClassName="p-4" showBorderBeam>
                                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-amber-200">
                                    <Target className="h-4 w-4" /> Décision GM
                                </h3>
                                <DecisionButtons candidateId={candidate.id} currentStatus={candidate.status} />
                            </GlassCard>
                        </BlurFade>
                    )}

                    {/* Member Vote */}
                    {isMemberOrHigher && candidate.status === 'pending' && (
                        <BlurFade delay={0.2}>
                            <GlassCard id="vote-section" className="border-primary/20 bg-primary/5" innerClassName="p-4" showBorderBeam>
                                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary">
                                    <Sword className="h-4 w-4" /> Ton Vote
                                </h3>
                                <VoteButtons candidateId={candidate.id} currentVote={myVote} />
                            </GlassCard>
                        </BlurFade>
                    )}

                    {/* Vote Summary */}
                    {isOfficerOrHigher && (
                        <BlurFade delay={0.3}>
                            <GlassCard className="border-blue-500/10" innerClassName="p-4">
                                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-blue-300">
                                    <Users className="h-4 w-4" /> Consensus Roster
                                </h3>
                                <VoteSynthesisCard synthesis={voteSynthesis} />
                            </GlassCard>
                        </BlurFade>
                    )}

                    {/* Stats Cockpit */}
                    <BlurFade delay={0.4}>
                        <GlassCard className="border-white/5" innerClassName="p-4 space-y-5">
                            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-zinc-500">
                                <LayoutGrid className="h-4 w-4" /> Dashboard Stats
                            </h3>

                            {candidate.warcraftlogs_link && (
                                <WarcraftLogsCard
                                    candidateId={candidate.id}
                                    score={candidate.wlogs_score}
                                    color={candidate.wlogs_color}
                                    mythicPlusScore={candidate.wlogs_mythic_plus_score}
                                    ilvl={candidate.wlogs_ilvl}
                                    raidProgress={candidate.wlogs_raid_progress}
                                    link={candidate.warcraftlogs_link}
                                />
                            )}

                            <div className="space-y-4 pt-2 border-t border-white/5">
                                <div className="flex justify-between">
                                    <span className="text-xs text-zinc-500">BattleTag</span>
                                    <span className="text-sm font-bold text-zinc-200">{candidate.battle_tag || 'Non lié'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-xs text-zinc-500">Discord</span>
                                    <span className="text-sm font-bold text-zinc-200">{candidate.discord_id || 'N/A'}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-zinc-500">Soumis le</span>
                                    <span className="text-sm font-medium text-zinc-200">
                                        {format(new Date(candidate.created_at), 'PPP', { locale: fr })}
                                    </span>
                                    <span className="text-[10px] italic text-zinc-500">
                                        ({formatDistanceToNow(new Date(candidate.created_at), { addSuffix: true, locale: fr })})
                                    </span>
                                </div>
                            </div>
                        </GlassCard>
                    </BlurFade>
                </div>

                {/* Main Content Areas */}
                <div className="lg:col-span-4 xl:col-span-9 space-y-6 lg:order-1">

                    {/* Primary Motivation (Large Panel) */}
                    <BlurFade delay={0.1}>
                        <GlassCard className="border-[var(--primary)]/10" innerClassName="p-6">
                            <h2 className="mb-6 flex items-center gap-3 text-xl font-bold text-white uppercase tracking-tight">
                                <MessageSquare className="h-6 w-6 text-primary" />
                                Le mot de la fin
                            </h2>
                            <div className="prose prose-invert max-w-none">
                                <p className="leading-relaxed text-zinc-300 text-lg whitespace-pre-wrap">
                                    {candidate.motivation || 'Ce candidat n\'a pas encore fourni de motivation détaillée.'}
                                </p>
                            </div>
                        </GlassCard>
                    </BlurFade>

                    {/* Two-Column Mid-Section for Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Raid Experience */}
                        <BlurFade delay={0.15}>
                            <GlassCard className="h-full" innerClassName="p-6">
                                <h3 className="mb-4 flex items-center gap-2 font-bold text-zinc-100 italic">
                                    <Sword className="h-4 w-4 text-red-500" /> Expérience de Raid
                                </h3>
                                <p className="text-sm leading-relaxed text-zinc-400 whitespace-pre-wrap">
                                    {candidate.raid_experience || 'Aucune information fournie.'}
                                </p>
                            </GlassCard>
                        </BlurFade>

                        {/* About Me */}
                        <BlurFade delay={0.2}>
                            <GlassCard className="h-full" innerClassName="p-6">
                                <h3 className="mb-4 flex items-center gap-2 font-bold text-zinc-100 italic">
                                    <User className="h-4 w-4 text-blue-500" /> À Propos du Joueur
                                </h3>
                                <p className="text-sm leading-relaxed text-zinc-400 whitespace-pre-wrap">
                                    {candidate.about_me || 'Ce candidat garde le mystère sur son profil.'}
                                </p>
                            </GlassCard>
                        </BlurFade>
                    </div>

                    {/* Screenshot Section (Full Width) */}
                    {candidate.screenshot_url && (
                        <BlurFade delay={0.25}>
                            <GlassCard innerClassName="p-6">
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="flex items-center gap-2 font-bold text-zinc-100 uppercase tracking-wide">
                                        <ExternalLink className="h-4 w-4 text-purple-500" /> Interface de Raid
                                    </h3>
                                    <Link
                                        href={candidate.screenshot_url}
                                        target="_blank"
                                        className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                                    >
                                        Voir l'original <ExternalLink className="h-3 w-3" />
                                    </Link>
                                </div>
                                <div className="group relative overflow-hidden rounded-xl border border-white/5">
                                    <SafeImage
                                        src={candidate.screenshot_url}
                                        alt="UI Screenshot"
                                        className="w-full transition-transform duration-500 group-hover:scale-[1.02]"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                                </div>
                            </GlassCard>
                        </BlurFade>
                    )}

                    {/* Background / Why JSC Section */}
                    {candidate.why_jsc && (
                        <BlurFade delay={0.3}>
                            <GlassCard innerClassName="p-6">
                                <h3 className="mb-4 flex items-center gap-2 font-bold text-zinc-100 italic">
                                    <Sword className="h-4 w-4 text-green-500" /> Pourquoi Jet Set Club ?
                                </h3>
                                <p className="text-sm leading-relaxed text-zinc-400">
                                    {candidate.why_jsc}
                                </p>
                            </GlassCard>
                        </BlurFade>
                    )}

                    {/* Notes Section (Important for Officers) */}
                    {isOfficerOrHigher && (
                        <BlurFade delay={0.35}>
                            <GlassCard className="border-purple-500/20 bg-purple-500/5 shadow-[0_0_30px_rgba(168,85,247,0.1)]" innerClassName="p-6">
                                <h2 className="mb-6 flex items-center gap-3 text-xl font-bold text-white">
                                    <MessageSquare className="h-6 w-6 text-purple-400" />
                                    Censure & Briefing ({notes.length})
                                </h2>
                                <div className="space-y-6">
                                    <AddNoteForm candidateId={candidate.id} />
                                    <div className="pt-4 border-t border-white/5">
                                        <NotesList notes={notes} />
                                    </div>
                                </div>
                            </GlassCard>
                        </BlurFade>
                    )}
                </div>
            </div>
        </div>
    )
}


