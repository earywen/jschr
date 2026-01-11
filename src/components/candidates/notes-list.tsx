import { OfficerNote } from '@/lib/actions/officer-notes'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { MessageSquare } from 'lucide-react'

interface NotesListProps {
    notes: OfficerNote[]
}

export function NotesList({ notes }: NotesListProps) {
    if (notes.length === 0) {
        return (
            <div className="text-center py-4 text-zinc-500 text-sm">
                Aucune note pour le moment.
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {notes.map((note) => (
                <div
                    key={note.id}
                    className="rounded-lg border border-zinc-800 bg-zinc-950 p-3"
                >
                    <p className="text-sm text-zinc-300 whitespace-pre-wrap">
                        {note.content}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
                        <span>{note.author?.email || 'Inconnu'}</span>
                        <span>
                            {formatDistanceToNow(new Date(note.created_at), {
                                addSuffix: true,
                                locale: fr,
                            })}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    )
}
