import { getCandidateById } from '@/lib/actions/candidate-detail'
import { getMyVote, getVoteSynthesis } from '@/lib/actions/votes'
import { getUserRole } from '@/lib/auth/role'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { DecisionButtons } from '@/components/candidates/decision-buttons'
import { CandidateVoteCard } from '@/components/candidates/candidate-vote-card'
import { DeleteCandidateButton } from '@/components/candidates/delete-candidate-button'
import { SafeImage } from '@/components/ui/safe-image'
import { CopyableText } from '@/components/ui/copyable-text'
import { formatDistanceToNow, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
    ArrowLeft,
    Clock,
    CheckCircle,
    XCircle,
    Pause,
    MessageSquare,
    ExternalLink,
    Users,
    Shield,
    ThumbsUp,
    Swords,
    User,
    HelpCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PageProps {
    params: Promise<{ id: string }>
}

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
// EXECUTIVE DARK CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function Card({
    children,
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "rounded-3xl bg-[#161822] border border-white/5 p-6",
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}

function SectionHeader({
    icon: Icon,
    children
}: {
    icon: React.ElementType
    children: React.ReactNode
}) {
    return (
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#94A3B8] mb-4">
            <Icon className="h-4 w-4" />
            {children}
        </h3>
    )
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default async function CandidateDetailPage({ params }: PageProps) {
    const { id } = await params
    const [candidate, user, myVote, voteSynthesis] = await Promise.all([
        getCandidateById(id),
        getUserRole(),
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
        <div className="mx-auto max-w-7xl space-y-6">
            {/* ─────────────────────────────────────────────────────────────────
                HEADER SECTION
            ───────────────────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <Link
                    href="/dashboard/candidates"
                    className="group flex items-center gap-2 text-sm font-medium text-[#94A3B8] hover:text-white transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Retour aux candidatures
                </Link>

                {isGM && <DeleteCandidateButton candidateId={candidate.id} />}
            </div>

            {/* Profile Header Card */}
            <Card className="p-0 overflow-hidden border-white/10 rounded-[40px] flex flex-col lg:flex-row items-stretch bg-[#0D0E12]">
                {/* Left Side: Profile & Stats */}
                <div className="flex-1 p-8 flex flex-col gap-8 md:flex-row md:items-center">
                    <div className="flex items-center gap-5">
                        {/* Avatar */}
                        <div
                            className="relative h-20 w-20 overflow-hidden rounded-[32px] flex-shrink-0"
                            style={{
                                border: `3px solid ${candidate.wow_class?.color || '#666'}`,
                            }}
                        >
                            <div
                                className="absolute inset-0 flex items-center justify-center text-3xl font-bold"
                                style={{
                                    backgroundColor: `${candidate.wow_class?.color}15` || '#333',
                                    color: candidate.wow_class?.color || '#fff',
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

                        {/* Name & Class */}
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-black tracking-tighter text-white">
                                    {candidate.name}
                                </h1>
                                <span
                                    className={cn(
                                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest leading-none",
                                        status.className
                                    )}
                                >
                                    <StatusIcon className="h-2.5 w-2.5" />
                                    {status.label}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-base font-bold">
                                <span style={{ color: candidate.wow_class?.color }}>
                                    {candidate.wow_class?.name}
                                </span>
                                <span className="text-white/20">•</span>
                                <span className="text-[#94A3B8]">{candidate.wow_spec?.name}</span>
                            </div>
                        </div>
                    </div>

                    <div className="hidden lg:block w-px h-12 bg-white/5 mx-4" />

                    {/* Quick Stats Bar */}
                    {(() => {
                        const getMPlusColor = (score: number | null | undefined) => {
                            if (!score) return '#94A3B8'
                            if (score >= 3500) return '#ff8000'
                            if (score >= 3000) return '#a335ee'
                            if (score >= 2500) return '#0070dd'
                            if (score >= 2000) return '#1eff00'
                            return '#94A3B8'
                        }

                        const extractFromWlogsLink = (link: string | null) => {
                            if (!link) return null
                            const match = link.match(/warcraftlogs\.com\/character\/(\w+)\/([^\/]+)\/([^\/\?]+)/)
                            if (match) return { region: match[1], realm: match[2], name: match[3] }
                            return null
                        }

                        const wlogsInfo = extractFromWlogsLink(candidate.warcraftlogs_link)
                        const armoryRealm = candidate.realm?.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '') || wlogsInfo?.realm
                        const armoryName = candidate.name || wlogsInfo?.name
                        const armoryUrl = armoryRealm && armoryName ? `https://worldofwarcraft.blizzard.com/en-gb/character/eu/${armoryRealm}/${encodeURIComponent(armoryName)}` : null

                        return (
                            <div className="flex items-center gap-8">
                                <div className="text-center">
                                    <p className="text-[#94A3B8] text-[9px] uppercase font-black tracking-[0.2em] mb-1">ilvl</p>
                                    {armoryUrl ? (
                                        <Link href={armoryUrl} target="_blank" className="text-white font-black text-2xl hover:text-[#4361EE] transition-colors leading-7 tracking-tighter">
                                            {candidate.wlogs_ilvl || '—'}
                                        </Link>
                                    ) : (
                                        <p className="text-white font-black text-2xl leading-7 tracking-tighter">{candidate.wlogs_ilvl || '—'}</p>
                                    )}
                                </div>
                                <div className="text-center">
                                    <p className="text-[#94A3B8] text-[9px] uppercase font-black tracking-[0.2em] mb-1">logs</p>
                                    {candidate.warcraftlogs_link ? (
                                        <Link href={candidate.warcraftlogs_link} target="_blank" className="font-black text-2xl hover:brightness-125 transition-all leading-7 tracking-tighter" style={{ color: candidate.wlogs_color || '#94A3B8' }}>
                                            {candidate.wlogs_score ? Math.round(candidate.wlogs_score) : '—'}
                                        </Link>
                                    ) : (
                                        <p className="font-black text-2xl leading-7 tracking-tighter" style={{ color: candidate.wlogs_color || '#94A3B8' }}>{candidate.wlogs_score ? Math.round(candidate.wlogs_score) : '—'}</p>
                                    )}
                                </div>
                                <div className="text-center">
                                    <p className="text-[#94A3B8] text-[9px] uppercase font-black tracking-[0.2em] mb-1">mm+</p>
                                    {candidate.warcraftlogs_link ? (
                                        <Link href={candidate.warcraftlogs_link} target="_blank" className="font-black text-2xl hover:brightness-125 transition-all leading-7 tracking-tighter" style={{ color: getMPlusColor(candidate.wlogs_mythic_plus_score) }}>
                                            {candidate.wlogs_mythic_plus_score ? Math.round(candidate.wlogs_mythic_plus_score) : '—'}
                                        </Link>
                                    ) : (
                                        <p className="font-black text-2xl leading-7 tracking-tighter" style={{ color: getMPlusColor(candidate.wlogs_mythic_plus_score) }}>{candidate.wlogs_mythic_plus_score ? Math.round(candidate.wlogs_mythic_plus_score) : '—'}</p>
                                    )}
                                </div>
                                <div className="text-center">
                                    <p className="text-[#94A3B8] text-[9px] uppercase font-black tracking-[0.2em] mb-1">progress</p>
                                    <p className="text-white font-black text-2xl leading-7 tracking-tighter">{candidate.wlogs_raid_progress || '—'}</p>
                                </div>
                            </div>
                        )
                    })()}
                </div>

                {/* Right Side: Voting System Panel */}
                {(isMemberOrHigher || isOfficerOrHigher) && (
                    <div className="w-full lg:w-[380px] bg-[#1e2d31] p-8 flex flex-col justify-center items-center border-l border-white/5 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-none" />
                        <div className="relative z-10 w-full max-w-[280px]">
                            <CandidateVoteCard
                                candidateId={candidate.id}
                                currentVote={myVote}
                                synthesis={voteSynthesis}
                                showSynthesis={isOfficerOrHigher}
                                canVote={isMemberOrHigher && candidate.status === 'pending'}
                                variant="header"
                            />
                        </div>
                    </div>
                )}
            </Card>

            {/* ─────────────────────────────────────────────────────────────────
                MAIN CONTENT GRID
            ───────────────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Left Column - Main Content */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Single Unified Bento Card with all candidate info */}
                    <Card>
                        <div className="space-y-8">
                            {/* 1. À Propos du Joueur */}
                            <div>
                                <SectionHeader icon={User}>À Propos du Joueur</SectionHeader>
                                <p className="text-[#94A3B8] leading-relaxed whitespace-pre-wrap break-words">
                                    {candidate.about_me || 'Ce candidat garde le mystère sur son profil.'}
                                </p>
                            </div>

                            <div className="border-t border-white/5" />

                            {/* 2. Expérience de Raid */}
                            <div>
                                <SectionHeader icon={Swords}>Expérience de Raid</SectionHeader>
                                <p className="text-[#94A3B8] leading-relaxed whitespace-pre-wrap break-words">
                                    {candidate.raid_experience || 'Aucune information fournie.'}
                                </p>
                            </div>

                            <div className="border-t border-white/5" />

                            {/* 3. Pourquoi Jet Set Club? */}
                            <div>
                                <SectionHeader icon={HelpCircle}>Pourquoi Jet Set Club ?</SectionHeader>
                                <p className="text-[#94A3B8] leading-relaxed whitespace-pre-wrap break-words">
                                    {candidate.why_jsc || 'Aucune information fournie.'}
                                </p>
                            </div>

                            <div className="border-t border-white/5" />

                            {/* 4. Le mot de la fin */}
                            <div>
                                <SectionHeader icon={MessageSquare}>Le mot de la fin</SectionHeader>
                                <p className="text-[#94A3B8] leading-relaxed whitespace-pre-wrap break-words">
                                    {candidate.motivation || 'Ce candidat n\'a pas encore fourni de motivation détaillée.'}
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Screenshot */}
                    {candidate.screenshot_url && (
                        <Card>
                            <div className="flex items-center justify-between mb-4">
                                <SectionHeader icon={ExternalLink}>Interface de Raid</SectionHeader>
                                <Link
                                    href={candidate.screenshot_url}
                                    target="_blank"
                                    className="text-xs font-medium text-[#4361EE] hover:text-[#4361EE]/80 transition-colors flex items-center gap-1"
                                >
                                    Voir l'original <ExternalLink className="h-3 w-3" />
                                </Link>
                            </div>
                            <div className="overflow-hidden rounded-2xl border border-white/5">
                                <SafeImage
                                    src={candidate.screenshot_url}
                                    alt="UI Screenshot"
                                    className="w-full"
                                />
                            </div>
                        </Card>
                    )}
                </div>

                {/* Right Column - Actions & Stats */}
                <div className="lg:col-span-4 space-y-6">
                    {/* GM Decision */}
                    {isGM && (
                        <Card className="border-amber-500/20">
                            <SectionHeader icon={Shield}>Décision GM</SectionHeader>
                            <DecisionButtons candidateId={candidate.id} currentStatus={candidate.status} />
                        </Card>
                    )}

                    {/* Contact Info */}
                    <Card>
                        <SectionHeader icon={User}>Informations</SectionHeader>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="flex items-center gap-2.5 text-xs text-[#94A3B8]">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#00AEFF]/15 border border-[#00AEFF]/30 shadow-[0_0_12px_rgba(0,174,255,0.2)] text-[#00AEFF]">
                                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current"><path d="M19.92 10.76s2.58 1.48 2.58 3.13c0 1.61-3 2.17-6.32 2.01c0 0-1.41 1.97-2.76 2.8c1.46 2.74 2.58 3.8 2.55 3.8c0 0-.74.19-2.97-3.46c-1.34.85-2.83 1.19-3.44.66c-.62-.53-.14-1.42.12-1.85c-.27.15-1.68.98-2.93.98c-1.49 0-1.7-1.11-1.7-1.68C5.05 15 7.12 12 7.12 12s-.96-2.12-1.07-3.78c-1.88-.16-4.05.17-4.52.32c-.13 0 .31-.32.47-.36c.15-.05 1.91-.51 4-.51c0-1.74.35-3.34 1.41-3.34c.72 0 1.3 1.12 1.3 1.12S8.7 1.5 10.74 1.5C12.8 1.5 15 6.11 15 6.11s2.22.21 3.85.98c.65-1.36 1.24-1.98 1.96-4.09c.19.7-.61 2.5-1.46 4.3c0 0 2.3 1.2 2.3 2.53c0 1.01-1.73.93-1.73.93m-9.24 7.82c.68.11 1.73-.48 1.72-.48l-.82-1.53l-1.18.83c-.01.01-.76.98.28 1.18m9.47-8.82c0-.66-1.2-1.41-1.34-1.49l-.92 1.48l1.28.62c.42-.03.98-.02.98-.61M8 5.63c-.3 0-.91.44-.91 2.01l1.74.06l-.11-1.4C8.6 6 8.3 5.63 8 5.63m2.18 10.15c-1.26-.65-2.02-1.72-2.64-2.88c0 0-1.58 2.65-.57 3.32c1.03.67 2.67-.06 3.21-.44m2.79 1.98c1.14-.87 4.22-3.03 4.48-6.68c-2.88-1.64-6.83-2.37-6.83-2.37s-.01-.5.08-.85c.94.11 3.89.61 6.33 1.57c-.68-1.15-1.19-1.58-1.66-1.93c1.16.26 1.99 1.76 1.99 1.76l.92-1.3s-4.37-2.35-8.09-.54c-.08 2.88 1.4 7.14 1.4 7.14l-.77.33c-.52-1.05-1.19-2.8-1.82-6.22c-.3.41-.83.88-.84 2.42c-.46-1.29.5-2.66.51-2.67l-1.6-.16c.1 1.66.98 5.94 3.61 7.27c2.32-1.32 4.82-3.99 5.45-4.76l.69.51l-4.47 4.69c1.24.03 1.97-.25 2.47-.47c-.72.75-1.96.82-2.55.82c.01.02.3.75.7 1.44m1.06-11.71c-.03-.08-1.37-2.36-2.56-2.19c-.78.25-1.23 1.57-1.24 3.01c.53-.31 1.77-.87 3.8-.82m2.68 9.02S20 15 19.9 13.76c0-1.2-1.98-2.43-1.98-2.41c.01 2.12-1.21 3.72-1.21 3.72z" /></svg>
                                    </div>
                                    BattleTag
                                </span>
                                <CopyableText
                                    value={candidate.battle_tag || ''}
                                    label="BattleTag"
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="flex items-center gap-2.5 text-xs text-[#94A3B8]">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#5865F2]/15 border border-[#5865F2]/30 shadow-[0_0_12px_rgba(88,101,242,0.2)] text-[#5865F2]">
                                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current"><path d="m22 24l-5.25-5l.63 2H4.5A2.5 2.5 0 0 1 2 18.5v-15A2.5 2.5 0 0 1 4.5 1h15A2.5 2.5 0 0 1 22 3.5V24M12 6.8c-2.68 0-4.56 1.15-4.56 1.15c1.03-.92 2.83-1.45 2.83-1.45l-.17-.17c-1.69.03-3.22 1.2-3.22 1.2c-1.72 3.59-1.61 6.69-1.61 6.69c1.4 1.81 3.48 1.68 3.48 1.68l.71-.9c-1.25-.27-2.04-1.38-2.04-1.38S9.3 14.9 12 14.9s4.58-1.28 4.58-1.28s-.79 1.11-2.04 1.38l.71.9s2.08.13 3.48-1.68c0 0 .11-3.1-1.61-6.69c0 0-1.53-1.17-3.22-1.2l-.17.17s1.8.53 2.83 1.45c0 0-1.88-1.15-4.56-1.15m-2.07 3.79c.65 0 1.18.57 1.17 1.27c0 .69-.52 1.27-1.17 1.27c-.64 0-1.16-.58-1.16-1.27c0-.7.51-1.27 1.16-1.27m4.17 0c.65 0 1.17.57 1.17 1.27c0 .69-.52 1.27-1.17 1.27c-.64 0-1.16-.58-1.16-1.27c0-.7.51-1.27 1.16-1.27Z" /></svg>
                                    </div>
                                    Discord
                                </span>
                                <CopyableText
                                    value={candidate.discord_id || ''}
                                    label="Discord"
                                />
                            </div>
                            <div className="pt-3 border-t border-white/5">
                                <span className="text-xs text-[#94A3B8]">Candidature soumise le</span>
                                <p className="text-sm font-medium text-white mt-1">
                                    {format(new Date(candidate.created_at), 'PPP', { locale: fr })}
                                </p>
                                <p className="text-xs text-[#94A3B8] mt-0.5">
                                    {formatDistanceToNow(new Date(candidate.created_at), { addSuffix: true, locale: fr })}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
