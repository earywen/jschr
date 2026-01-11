import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Shield, Users, CheckCircle, ChevronRight, Swords, Star } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute inset-0 bg-gradient-radial from-amber-500/10 via-transparent to-transparent" />

        <div className="mx-auto max-w-6xl px-6 py-24 text-center">
          {/* Guild Logo */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-amber-500/20 blur-xl animate-pulse" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-amber-500 bg-zinc-900">
                <Shield className="h-12 w-12 text-amber-400" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl font-bold tracking-tight text-white md:text-6xl">
            <span className="text-amber-400">JSC</span> HR
          </h1>
          <p className="mt-2 text-xl text-zinc-400">
            Système de Recrutement de Guilde
          </p>

          {/* Tagline */}
          <p className="mx-auto mt-8 max-w-2xl text-lg text-zinc-300">
            Rejoins une équipe passionnée de raiders. Notre processus de recrutement
            transparent permet à chaque membre de participer à la sélection des futurs membres.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="gap-2 bg-amber-500 text-black hover:bg-amber-400 px-8 py-6 text-lg font-semibold"
            >
              <Link href="/apply">
                <Swords className="h-5 w-5" />
                Postuler maintenant
                <ChevronRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800 px-8 py-6 text-lg"
            >
              <Link href="/login">
                Espace Membres
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center text-3xl font-bold text-white">
          Comment ça fonctionne ?
        </h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {/* Step 1 */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10">
              <span className="text-2xl font-bold text-amber-400">1</span>
            </div>
            <h3 className="text-xl font-semibold text-white">Candidature</h3>
            <p className="mt-2 text-zinc-400">
              Remplis le formulaire avec tes infos de personnage et ta motivation
            </p>
          </div>

          {/* Step 2 */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10">
              <span className="text-2xl font-bold text-blue-400">2</span>
            </div>
            <h3 className="text-xl font-semibold text-white">Vote des Membres</h3>
            <p className="mt-2 text-zinc-400">
              Les membres actuels votent de manière anonyme sur ta candidature
            </p>
          </div>

          {/* Step 3 */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
              <span className="text-2xl font-bold text-green-400">3</span>
            </div>
            <h3 className="text-xl font-semibold text-white">Décision</h3>
            <p className="mt-2 text-zinc-400">
              Le GM prend la décision finale et tu rejoins l'aventure !
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="border-y border-zinc-800 bg-zinc-900/30">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-8 text-center md:grid-cols-3">
            <div>
              <div className="flex items-center justify-center gap-2 text-4xl font-bold text-amber-400">
                <Users className="h-8 w-8" />
                <span>25+</span>
              </div>
              <p className="mt-2 text-zinc-400">Membres actifs</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 text-4xl font-bold text-green-400">
                <CheckCircle className="h-8 w-8" />
                <span>90%</span>
              </div>
              <p className="mt-2 text-zinc-400">Taux d'acceptation</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 text-4xl font-bold text-purple-400">
                <Star className="h-8 w-8" />
                <span>CE</span>
              </div>
              <p className="mt-2 text-zinc-400">Objectif progression</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-white">
          Prêt à rejoindre l'équipe ?
        </h2>
        <p className="mt-4 text-zinc-400">
          Le processus de candidature ne prend que quelques minutes.
        </p>
        <Button
          asChild
          size="lg"
          className="mt-8 gap-2 bg-amber-500 text-black hover:bg-amber-400 px-8 py-6 text-lg font-semibold"
        >
          <Link href="/apply">
            Commencer ma candidature
            <ChevronRight className="h-5 w-5" />
          </Link>
        </Button>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-zinc-950 py-8 text-center text-sm text-zinc-500">
        <p>© 2026 JSC HR - Système de Recrutement de Guilde</p>
      </footer>
    </div>
  )
}
