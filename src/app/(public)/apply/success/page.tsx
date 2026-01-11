import { Shield, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function ApplySuccessPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
            <div className="text-center space-y-6">
                <div className="flex justify-center">
                    <div className="relative">
                        <Shield className="h-24 w-24 text-amber-500" />
                        <CheckCircle className="absolute -bottom-2 -right-2 h-10 w-10 text-green-500 bg-zinc-950 rounded-full" />
                    </div>
                </div>

                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Candidature Envoyée !
                    </h1>
                    <p className="text-zinc-400 max-w-md">
                        Merci pour votre candidature. Nos officiers examineront votre profil
                        et vous contacteront prochainement via Discord.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild variant="outline" className="border-zinc-700 text-zinc-300">
                        <Link href="/">Retour à l&apos;accueil</Link>
                    </Button>
                    <Button asChild className="bg-amber-500 text-black hover:bg-amber-400">
                        <Link href="/apply">Nouvelle candidature</Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
