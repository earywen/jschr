'use client'

import { login, signInWithDiscord } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BlurFade } from '@/components/ui/blur-fade'
import { Disc as Discord } from 'lucide-react'

export default function LoginPage({
    searchParams,
}: {
    searchParams: { message: string; error: string }
}) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 overflow-hidden relative">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

            <BlurFade delay={0.1} className="w-full max-w-md z-10">
                <div className="bg-black/40 backdrop-blur-xl border border-white/5 p-10 rounded-[2.5rem] shadow-2xl space-y-8 text-center bg-gradient-to-br from-white/[0.02] to-transparent">
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <img
                                src="/logo jsc.png"
                                alt="Jet Set Club Logo"
                                className="h-24 w-auto object-contain drop-shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Administration</p>
                            <h1 className="text-3xl font-black text-white tracking-tighter">
                                Accès <span className="text-primary italic">Staff</span>
                            </h1>
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        <form action={signInWithDiscord}>
                            <Button
                                className="w-full h-14 bg-[#5865F2] hover:bg-[#4752C4] text-white flex items-center justify-center gap-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all group"
                                type="submit"
                            >
                                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current opacity-70 group-hover:opacity-100 transition-opacity"><path d="m22 24l-5.25-5l.63 2H4.5A2.5 2.5 0 0 1 2 18.5v-15A2.5 2.5 0 0 1 4.5 1h15A2.5 2.5 0 0 1 22 3.5V24M12 6.8c-2.68 0-4.56 1.15-4.56 1.15c1.03-.92 2.83-1.45 2.83-1.45l-.17-.17c-1.69.03-3.22 1.2-3.22 1.2c-1.72 3.59-1.61 6.69-1.61 6.69c1.4 1.81 3.48 1.68 3.48 1.68l.71-.9c-1.25-.27-2.04-1.38-2.04-1.38S9.3 14.9 12 14.9s4.58-1.28 4.58-1.28s-.79 1.11-2.04 1.38l.71.9s2.08.13 3.48-1.68c0 0 .11-3.1-1.61-6.69c0 0-1.53-1.17-3.22-1.2l-.17.17s1.8.53 2.83 1.45c0 0-1.88-1.15-4.56-1.15m-2.07 3.79c.65 0 1.18.57 1.17 1.27c0 .69-.52 1.27-1.17 1.27c-.64 0-1.16-.58-1.16-1.27c0-.7.51-1.27 1.16-1.27m4.17 0c.65 0 1.17.57 1.17 1.27c0 .69-.52 1.27-1.17 1.27c-.64 0-1.16-.58-1.16-1.27c0-.7.51-1.27 1.16-1.27Z" /></svg>
                                Connexion Discord
                            </Button>
                        </form>

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-white/5"></span>
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase tracking-widest text-zinc-600 font-bold">
                                <span className="bg-black/0 px-4">Ou via Magic Link</span>
                            </div>
                        </div>

                        <form className="space-y-3">
                            <div className="space-y-2 text-left">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 px-1" htmlFor="email">
                                    Email Professionnel
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    placeholder="nom@exemple.com"
                                    type="email"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    autoCorrect="off"
                                    className="h-14 bg-white/[0.03] border-white/5 text-white placeholder:text-zinc-700 rounded-2xl focus-visible:ring-primary/20 focus-visible:border-primary/30 transition-all px-6"
                                    required
                                />
                            </div>
                            <Button
                                formAction={login}
                                variant="outline"
                                className="w-full h-14 bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                            >
                                Envoyer le lien
                            </Button>
                        </form>
                    </div>

                    {(searchParams?.message || searchParams?.error) && (
                        <BlurFade delay={0.2}>
                            <p className={`text-[10px] font-black uppercase tracking-widest p-4 rounded-xl border ${searchParams?.message
                                    ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
                                    : 'text-red-400 bg-red-400/10 border-red-400/20'
                                }`}>
                                {searchParams.message || searchParams.error}
                            </p>
                        </BlurFade>
                    )}
                </div>

                <p className="mt-8 text-center text-[10px] font-bold text-zinc-600 uppercase tracking-[0.3em]">
                    &copy; {new Date().getFullYear()} Jet Set Club &bull; High End Recruiting
                </p>
            </BlurFade>
        </div>
    )
}
