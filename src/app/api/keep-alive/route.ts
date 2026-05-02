import { createAdminClient } from '@/lib/supabase/server'
import { env } from '@/lib/env'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization')
    
    // Security check: Verify either Vercel Cron header or Bearer Token
    const isVercelCron = request.headers.get('x-vercel-cron') === '1'
    const isAuthorized = authHeader === `Bearer ${env.CRON_SECRET}`

    if (!isVercelCron && !isAuthorized && env.NODE_ENV === 'production') {
        return new Response('Unauthorized', { status: 401 })
    }

    try {
        const supabase = await createAdminClient()
        
        // Simple query to keep the database active
        const { data, error } = await supabase
            .from('wow_classes')
            .select('id')
            .limit(1)

        if (error) throw error

        return NextResponse.json({
            status: 'success',
            message: 'Database keep-alive triggered',
            timestamp: new Date().toISOString(),
            ping: data ? 'ok' : 'no_data'
        })
    } catch (error) {
        console.error('Keep-alive error:', error)
        return NextResponse.json({
            status: 'error',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}
