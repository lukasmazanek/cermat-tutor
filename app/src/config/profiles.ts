/**
 * ADR-032: Multi-user Profiles
 *
 * Profiles are defined here, not created in-app.
 * To add a new user, add an entry to PROFILES array.
 */

export interface Profile {
  id: string
  name: string
}

export const PROFILES: Profile[] = [
  { id: 'anezka', name: 'Anežka' },
  { id: 'petr', name: 'Petr' },
]

export type ProfileId = string

// LocalStorage key for current user
export const CURRENT_USER_KEY = 'tutor_current_user'

// Get stored user from localStorage
export function getStoredUser(): ProfileId | null {
  const stored = localStorage.getItem(CURRENT_USER_KEY)
  if (stored && PROFILES.some(p => p.id === stored)) {
    return stored
  }
  return null
}

// Store current user in localStorage
export function setStoredUser(userId: ProfileId): void {
  localStorage.setItem(CURRENT_USER_KEY, userId)
}

// Clear stored user (for "switch user" action)
export function clearStoredUser(): void {
  localStorage.removeItem(CURRENT_USER_KEY)
}
