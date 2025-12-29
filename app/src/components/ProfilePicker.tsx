/**
 * ADR-032: Multi-user Profiles
 *
 * Profile selection screen shown before home.
 * Template: HOME variant (no BottomBar)
 *
 * Once selected, profile is persisted in localStorage
 * until explicit "switch user" action.
 */

import { UserCircleIcon } from '@heroicons/react/24/outline'
import { PROFILES, ProfileId } from '../config/profiles'

interface ProfilePickerProps {
  onSelectProfile: (profileId: ProfileId) => void
}

function ProfilePicker({ onSelectProfile }: ProfilePickerProps) {
  return (
    <div className="min-h-screen h-[100dvh] bg-slate-50 px-4 py-6 flex flex-col items-center justify-center">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-slate-800 mb-2">
          Kdo dnes prozkoumává?
        </h1>
        <p className="text-slate-500">
          Vyber svůj profil
        </p>
      </div>

      {/* Profile buttons */}
      <div className="flex flex-wrap justify-center gap-4 max-w-md">
        {PROFILES.map((profile) => (
          <button
            key={profile.id}
            onClick={() => onSelectProfile(profile.id)}
            className="bg-white rounded-2xl p-6 shadow-sm text-center min-w-[140px]
              transition-gentle active:scale-[0.98] border-2 border-transparent
              hover:border-safe-blue/30 focus:border-safe-blue focus:outline-none"
          >
            <UserCircleIcon className="w-16 h-16 text-safe-blue mx-auto mb-3" />
            <span className="text-lg font-medium text-slate-800">
              {profile.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default ProfilePicker
