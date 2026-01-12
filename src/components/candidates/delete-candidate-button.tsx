'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteCandidate } from '@/lib/actions/candidates'

interface DeleteCandidateButtonProps {
    candidateId: string
}


export function DeleteCandidateButton({ candidateId }: DeleteCandidateButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [open, setOpen] = useState(false)
    const router = useRouter()

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            const result = await deleteCandidate(candidateId)

            if (result.success) {
                // Success
                setOpen(false)
                router.push('/dashboard/candidates')
                router.refresh()
            } else {
                alert(result.error || "Erreur lors de la suppression")
                setIsDeleting(false)
            }
        } catch (error) {
            alert("Erreur réseau")
            setIsDeleting(false)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10">
                    <Trash2 className="h-5 w-5" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-zinc-900 border-zinc-800">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-zinc-100">Êtes-vous sûr ?</AlertDialogTitle>
                    <AlertDialogDescription className="text-zinc-400">
                        Cette action est irréversible. La candidature et toutes les données associées seront définitivement supprimées.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                        Annuler
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault()
                            handleDelete()
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white"
                        disabled={isDeleting}
                    >
                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Supprimer définitivement
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
