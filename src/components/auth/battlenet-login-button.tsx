'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface BattleNetLoginButtonProps {
    onSuccess?: (userData: BattleNetUserData) => void
    className?: string
}

export interface BattleNetUserData {
    battletag: string
    id: number
}

export function BattleNetLoginButton({ onSuccess, className }: BattleNetLoginButtonProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleLogin = async () => {
        setIsLoading(true)
        setError(null)

        // Open popup for Battle.net OAuth
        const width = 500
        const height = 700
        const left = window.screenX + (window.outerWidth - width) / 2
        const top = window.screenY + (window.outerHeight - height) / 2

        const popup = window.open(
            '/api/auth/battlenet',
            'battlenet-oauth',
            `width=${width},height=${height},left=${left},top=${top}`
        )

        if (!popup) {
            setError('Popup bloqué. Autorisez les popups pour ce site.')
            setIsLoading(false)
            return
        }

        // Listen for message from popup
        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return

            if (event.data.type === 'battlenet-success') {
                window.removeEventListener('message', handleMessage)
                setIsLoading(false)
                if (onSuccess) {
                    onSuccess(event.data.userData)
                }
            } else if (event.data.type === 'battlenet-error') {
                window.removeEventListener('message', handleMessage)
                setError(event.data.error || 'Erreur de connexion')
                setIsLoading(false)
            }
        }

        window.addEventListener('message', handleMessage)

        // Check if popup is closed
        const checkClosed = setInterval(() => {
            if (popup.closed) {
                clearInterval(checkClosed)
                window.removeEventListener('message', handleMessage)
                setIsLoading(false)
            }
        }, 500)
    }

    return (
        <div className={className}>
            <Button
                onClick={handleLogin}
                disabled={isLoading}
                variant="outline"
                className="w-full gap-2 border-blue-600 bg-blue-600/10 text-blue-400 hover:bg-blue-600/20"
            >
                {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                    <svg
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                )}
                Connecter avec Battle.net
            </Button>
            {error && (
                <p className="mt-2 text-sm text-red-400">{error}</p>
            )}
        </div>
    )
}
