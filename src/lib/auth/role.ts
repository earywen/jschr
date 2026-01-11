'use server'

import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database.types'

type UserRole = Database['public']['Enums']['user_role']

export interface UserWithRole {
    id: string
    email: string
    role: UserRole
}

/**
 * Get the current authenticated user's role from public.members
 * Returns null if not authenticated or no member entry exists
 */
export async function getUserRole(): Promise<UserWithRole | null> {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return null
    }

    const { data: member, error } = await supabase
        .from('members')
        .select('id, email, role')
        .eq('id', user.id)
        .single()

    if (error || !member) {
        console.error('Error fetching member role:', error)
        return null
    }

    return member as UserWithRole
}

/**
 * Check if user has officer+ permissions (officer or gm)
 */
export async function isOfficerOrHigher(): Promise<boolean> {
    const user = await getUserRole()
    return user !== null && (user.role === 'officer' || user.role === 'gm')
}

/**
 * Check if user is GM
 */
export async function isGM(): Promise<boolean> {
    const user = await getUserRole()
    return user !== null && user.role === 'gm'
}

/**
 * Check if user is at least a member (not pending)
 */
export async function isMemberOrHigher(): Promise<boolean> {
    const user = await getUserRole()
    return user !== null && user.role !== 'pending'
}
