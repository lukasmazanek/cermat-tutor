/**
 * ADR-023 Phase 2: Supabase Module
 *
 * Re-exports Supabase client and auth helpers.
 */

export {
  getSupabaseClient,
  getCurrentUser,
  signInWithMagicLink,
  signOut,
  isAuthenticated,
  isConfigured
} from './client'
