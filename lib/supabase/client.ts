/**
 * ADR-023 Phase 2: Supabase Client
 *
 * Singleton Supabase client for auth and database operations.
 * Reads configuration from environment variables.
 */

import { createClient, SupabaseClient, User } from '@supabase/supabase-js'

// Environment variables (Vite exposes VITE_ prefixed vars)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// Validate configuration
function isConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey)
}

// Create client only if configured
let supabaseClient: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient | null {
  if (!isConfigured()) {
    return null
  }

  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  }

  return supabaseClient
}

// Auth helpers
export async function getCurrentUser(): Promise<User | null> {
  const client = getSupabaseClient()
  if (!client) return null

  const { data: { user } } = await client.auth.getUser()
  return user
}

export async function signInWithMagicLink(email: string): Promise<{ error: Error | null }> {
  const client = getSupabaseClient()
  if (!client) {
    return { error: new Error('Supabase not configured') }
  }

  const { error } = await client.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin + '/tutor/'
    }
  })

  return { error: error as Error | null }
}

export async function signOut(): Promise<void> {
  const client = getSupabaseClient()
  if (client) {
    await client.auth.signOut()
  }
}

// Check if Supabase is available and user is logged in
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser()
  return user !== null
}

// Export configured status
export { isConfigured }
