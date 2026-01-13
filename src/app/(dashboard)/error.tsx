'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Dashboard error:', error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
            <div className="flex items-center gap-3 text-destructive">
                <AlertCircle className="h-8 w-8" />
                <h2 className="text-2xl font-bold">Une erreur est survenue</h2>
            </div>

            <p className="text-muted-foreground max-w-md text-center">
                Nous n'avons pas pu charger cette page. Veuillez réessayer.
            </p>

            {error.digest && (
                <p className="text-xs text-muted-foreground font-mono">
                    ID: {error.digest}
                </p>
            )}

            <Button onClick={reset} variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Réessayer
            </Button>
        </div>
    )
}
