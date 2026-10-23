'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { refreshCandidateLogs } from '@/lib/actions/warcraftlogs'

interface RefreshLogsButtonProps {
    candidateId: string
    hasLink: boolean
}

export function RefreshLogsButton({ candidateId, hasLink }: RefreshLogsButtonProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const router = useRouter()

    if (!hasLink) return null

    const handleRefresh = async () => {
        setIsLoading(true)
        setStatus('idle')
        setErrorMessage(null)

        try {
            const res = await refreshCandidateLogs(candidateId)
            if (res.success) {
                setStatus('success')
                router.refresh()
                setTimeout(() => setStatus('idle'), 2500)
            } else {
                setStatus('error')
                setErrorMessage(res.error || 'Erreur lors du rafraîchissement')
                setTimeout(() => setStatus('idle'), 3500)
            }
        } catch (e) {
            setStatus('error')
            setErrorMessage('Erreur réseau')
            setTimeout(() => setStatus('idle'), 3500)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className="h-8 px-2.5 rounded-xl bg-white/5 border-white/10 hover:bg-white/10 text-xs font-semibold text-zinc-300 transition-all flex items-center gap-1.5"
                title="Actualiser les métriques WarcraftLogs"
            >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#4361EE]' : 'text-zinc-400'}`} />
                <span>Actualiser les logs</span>
                {status === 'success' && <Check className="w-3.5 h-3.5 text-emerald-400 ml-1" />}
                {status === 'error' && <AlertCircle className="w-3.5 h-3.5 text-rose-400 ml-1" />}
            </Button>
            {errorMessage && (
                <span className="text-[11px] font-medium text-rose-400">{errorMessage}</span>
            )}
        </div>
    )
}
