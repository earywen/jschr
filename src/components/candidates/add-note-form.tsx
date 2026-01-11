'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { addNoteToCandidate } from '@/lib/actions/officer-notes'
import { Send, Loader2 } from 'lucide-react'

interface AddNoteFormProps {
    candidateId: string
}

export function AddNoteForm({ candidateId }: AddNoteFormProps) {
    const [content, setContent] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim()) return

        setIsLoading(true)
        setError(null)

        const result = await addNoteToCandidate(candidateId, content)

        if (!result.success) {
            setError(result.error || 'Erreur inconnue')
            setIsLoading(false)
            return
        }

        setContent('')
        setIsLoading(false)
        router.refresh()
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Ajouter une note privée..."
                className="min-h-[80px] bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-500"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button
                type="submit"
                disabled={isLoading || !content.trim()}
                className="w-full bg-purple-600 text-white hover:bg-purple-500"
            >
                {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Send className="mr-2 h-4 w-4" />
                )}
                Ajouter la note
            </Button>
        </form>
    )
}
