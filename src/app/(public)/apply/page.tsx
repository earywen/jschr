'use client'

import { ApplicationWizard } from '@/components/apply/application-wizard'
import { ApplicationFormData } from '@/lib/validations/application'
import { submitApplication } from '@/lib/actions/candidates'
import { Shield } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ApplyPage() {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (data: ApplicationFormData) => {
        try {
            setError(null)
            const result = await submitApplication(data)

            if (!result.success) {
                setError(result.error || 'Une erreur est survenue')
                return
            }

            router.push('/apply/success')
        } catch (err) {
            setError('Une erreur est survenue. Veuillez réessayer.')
            console.error(err)
        }
    }

    return (
        <div className="min-h-screen bg-zinc-950 px-4 py-12">
            {/* Header */}
            <div className="mx-auto max-w-2xl text-center mb-8">
                <div className="flex justify-center mb-4">
                    <Shield className="h-16 w-16 text-amber-500" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                    Rejoignez JSC
                </h1>
                <p className="text-zinc-400">
                    Remplissez ce formulaire pour postuler à notre guilde
                </p>
            </div>

            {error && (
                <div className="mx-auto max-w-2xl mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-center">
                    <p className="text-sm text-red-400">{error}</p>
                </div>
            )}

            {/* Wizard */}
            <ApplicationWizard onSubmit={handleSubmit} />
        </div>
    )
}
