import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * Next.js Middleware - Runs on every request
 * Handles authentication and route protection
 */
export async function middleware(request: NextRequest) {
    return await updateSession(request)
}

/**
 * Matcher configuration - which routes to run middleware on
 * Excludes static assets, images, and Next.js internals
 */
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (svg, png, jpg, jpeg, gif, webp)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
