'use client'

import { useState } from 'react'
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

type SyncStatus = 'idle' | 'loading' | 'success' | 'error'

export function RecruitmentSync() {
    const [status, setStatus] = useState<SyncStatus>('idle')
    const [message, setMessage] = useState<string>('')

    const handleSync = async () => {
        setStatus('loading')
        setMessage('')

        try {
            const res = await fetch('/api/sync-recruitment', { method: 'POST' })
            const data = await res.json()

            if (res.ok) {
                setStatus('success')
                setMessage(data.message || 'Synchronisation réussie !')
            } else {
                setStatus('error')
                setMessage(data.error || 'Une erreur est survenue.')
            }
        } catch (err) {
            setStatus('error')
            setMessage('Erreur réseau ou serveur indisponible.')
            console.error(err)
        }

        // Reset status after 5 seconds
        setTimeout(() => setStatus('idle'), 5000)
    }

    return (
        <div className="space-y-4">
            <p className="text-[#94A3B8] text-sm">
                Lancez une synchronisation manuelle des besoins de recrutement depuis WowProgress.
            </p>

            <div className="flex items-center gap-3">
                <Button
                    onClick={handleSync}
                    disabled={status === 'loading'}
                    className="bg-[#4361EE] hover:bg-[#3a56d4] text-white"
                >
                    {status === 'loading' ? (
                        <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Synchronisation...
                        </>
                    ) : (
                        <>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Lancer la synchronisation
                        </>
                    )}
                </Button>

                {status === 'success' && (
                    <div className="flex items-center gap-2 text-green-500 text-sm">
                        <CheckCircle className="h-4 w-4" />
                        {message}
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex items-center gap-2 text-red-500 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {message}
                    </div>
                )}
            </div>

            <p className="text-xs text-zinc-500">
                La synchronisation automatique s'effectue chaque jour à 23h (via n8n).
            </p>
        </div>
    )
}
