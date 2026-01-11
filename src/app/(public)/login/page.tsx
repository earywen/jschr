
import { login, signInWithDiscord } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function LoginPage({
    searchParams,
}: {
    searchParams: { message: string; error: string }
}) {
    return (
        <div className="flex h-screen items-center justify-center bg-zinc-950 px-4">
            <Card className="w-full max-w-sm border-zinc-800 bg-zinc-900 text-zinc-100">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold tracking-tight text-white">
                        JSC HR Access
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                        Connectez-vous pour voir les candidatures
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <form action={signInWithDiscord}>
                        <Button
                            className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold"
                            type="submit"
                        >
                            Sign in with Discord
                        </Button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <Separator className="w-full bg-zinc-800" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-zinc-900 px-2 text-zinc-400">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <form className="grid gap-2">
                        <div className="grid gap-1">
                            <Label className="sr-only" htmlFor="email">
                                Email
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                placeholder="name@example.com"
                                type="email"
                                autoCapitalize="none"
                                autoComplete="email"
                                autoCorrect="off"
                                className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-zinc-700"
                                required
                            />
                        </div>
                        <Button
                            formAction={login}
                            className="w-full bg-white text-black hover:bg-zinc-200"
                        >
                            Sign In with Magic Link
                        </Button>
                    </form>

                    {searchParams?.message && (
                        <p className="mt-4 text-center text-sm font-medium text-green-400 bg-green-400/10 p-2 rounded">
                            {searchParams.message}
                        </p>
                    )}
                    {searchParams?.error && (
                        <p className="mt-4 text-center text-sm font-medium text-red-400 bg-red-400/10 p-2 rounded">
                            {searchParams.error}
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
