import { z } from 'zod'

/**
 * Environment variable validation schema
 * Validates at runtime to catch missing/invalid env vars early
 */
const envSchema = z.object({
    // Supabase - Required
    NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
    SUPABASE_SERVICE_KEY: z.string().min(1, 'SUPABASE_SERVICE_KEY is required'),

    // Battle.net OAuth - Optional (feature flag)
    BATTLENET_CLIENT_ID: z.string().optional(),
    BATTLENET_CLIENT_SECRET: z.string().optional(),

    // WarcraftLogs API - Optional
    WARCRAFTLOGS_CLIENT_ID: z.string().optional(),
    WARCRAFTLOGS_CLIENT_SECRET: z.string().optional(),

    // Discord Integration - Required for notifications and voting
    DISCORD_WEBHOOK_URL: z.string().url().optional(),
    DISCORD_PUBLIC_KEY: z.string().min(1, 'DISCORD_PUBLIC_KEY is required for interaction verification'),
    DISCORD_BOT_TOKEN: z.string().min(1, 'DISCORD_BOT_TOKEN is required for Discord API'),
    DISCORD_CHANNEL_ID: z.string().min(1, 'DISCORD_CHANNEL_ID is required for notifications'),

    // GitHub - Optional
    GH_PAT: z.string().optional(),

    // N8N Automation - Optional
    N8N_WEBHOOK_URL: z.string().url().optional(),

    // App URLs
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
    NEXT_PUBLIC_BASE_URL: z.string().url().optional(),

    // Node environment
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

// Parse and validate environment variables
function validateEnv() {
    const parsed = envSchema.safeParse(process.env)

    if (!parsed.success) {
        console.error('❌ Invalid environment variables:')
        parsed.error.issues.forEach((issue) => {
            console.error(`  - ${issue.path.join('.')}: ${issue.message}`)
        })
        throw new Error('Invalid environment variables. Check the console for details.')
    }

    return parsed.data
}

// Export validated environment variables
export const env = validateEnv()

// Type-safe access to environment variables
export type Env = z.infer<typeof envSchema>
