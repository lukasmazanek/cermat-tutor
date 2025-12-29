/**
 * ADR-023 Phase 2: Supabase Client (Simplified)
 * ADR-032: Multi-user support
 *
 * User ID is managed by storage layer (currentUserId).
 * No authentication required.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Environment variables (Vite exposes VITE_ prefixed vars)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// Check if Supabase is configured
export function isConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey)
}

// Singleton client
let supabaseClient: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient | null {
  if (!isConfigured()) {
    return null
  }

  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  }

  return supabaseClient
}
