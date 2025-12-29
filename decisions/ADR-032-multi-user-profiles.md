# ADR-032: Multi-user Profiles

**Date:** 2024-12-29
**Status:** Implemented
**Role:** Architect

## Context

The app is currently single-user (implicitly Anežka). We need to support multiple users (e.g., siblings, classmates) with:
- Simple profile selection (no authentication)
- Isolated progress data per user
- Minimal friction for switching

## Decision

### Profile Selection Flow

```
┌─────────────────────────────────────────┐
│         ProfilePicker Screen            │
│                                         │
│     "Kdo dnes prozkoumává?"            │
│                                         │
│  ┌─────────┐ ┌─────────┐               │
│  │ Anežka  │ │ Emilka  │               │
│  └─────────┘ └─────────┘               │
│       ┌─────────┐                       │
│       │  Host   │                       │
│       └─────────┘                       │
│                                         │
└─────────────────────────────────────────┘
          │
          ▼ (click on profile)
┌─────────────────────────────────────────┐
│         TopicSelector (HOME)            │
│                                         │
│  "Co dnes prozkoumáme?"                │
└─────────────────────────────────────────┘
```

### Key Decisions

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| Identification | Click on name from list | No typos, fast selection |
| Where to select | New screen before home | Clear separation "who am I" vs "what to do" |
| Profile creation | In configuration file | Admin/parent controls profiles, not child |
| Template | **HOME** variant | No BottomBar, entry point screen |

### Configuration

Profiles are defined in app configuration (not created in UI):

```typescript
// src/config/profiles.ts
export const PROFILES: Profile[] = [
  { id: 'anezka', name: 'Anežka' },
  { id: 'emilka', name: 'Emilka' },
  { id: 'host', name: 'Host' },
]

export type ProfileId = string
```

### User Context

Current user is stored and passed through the app:

```typescript
// App state
const [currentUser, setCurrentUser] = useState<ProfileId | null>(null)

// Pass to storage layer
saveAttempt({ ...attempt, user_id: currentUser })
getAttempts({ user_id: currentUser })
```

### ProfilePicker Component

```typescript
interface ProfilePickerProps {
  onSelectProfile: (profileId: ProfileId) => void
}
```

**UI Specifications:**
- Full screen, centered content
- Large touch-friendly profile buttons (min 64px height)
- Profile name displayed prominently
- Optional: avatar/icon per profile (future enhancement)

### App Flow Change

```
Before:
  App start → TopicSelector

After:
  App start → ProfilePicker → TopicSelector
```

### Session Persistence

- `currentUser` stored in `localStorage` (persists until explicit change)
- On app reload: check localStorage, if found → skip ProfilePicker, go to home
- Explicit "switch user" action clears localStorage and returns to ProfilePicker
- "Hard reset" = clear localStorage or use "Změnit uživatele" option

## Implementation

### Phase 1: Core Infrastructure ✅
1. Created `src/config/profiles.ts` with profile definitions
2. Created `ProfilePicker` component (HOME template variant)
3. Added user context to App.tsx
4. Updated App routing: ProfilePicker → TopicSelector

### Phase 2: Storage Integration ✅
1. `setCurrentUserId()` called when profile selected
2. `lib/storage/localStorage.ts` filters by `currentUserId`
3. `lib/storage/supabase.ts` uses `getCurrentUserId()` for all queries
4. Existing data remains under 'anezka' user_id

### Phase 3: UI Polish ✅
1. "Změnit" button in TopicSelector header (top-right)
2. Current user name displayed next to switch button

### Phase 4: Future Enhancements (TODO)
1. Optional: Add profile avatars/colors
2. Optional: Add profile-specific theme colors

## New Components

| Component | Template | Location |
|-----------|----------|----------|
| `ProfilePicker` | HOME (no BottomBar) | `src/components/ProfilePicker.tsx` |

## Psychological Safety

| Aspect | Status | Notes |
|--------|--------|-------|
| No comparison between users | ✅ | Data completely isolated |
| Personal space | ✅ | "This is YOUR profile" |
| No login stress | ✅ | Just click, no password |
| Can't mess up others' data | ✅ | Separate storage per user |
| Clear identity | ✅ | Always know who is practicing |

## Migration

Existing Supabase data remains under `user_id = 'anezka'`:

- No schema changes needed (user_id column already exists)
- New profiles start fresh (no existing data)
- Anežka's historical data preserved

## Future Considerations

- **Avatars/icons**: Visual differentiation for younger users
- **Profile colors**: Each user gets a theme color
- **Parent mode**: Hidden profile for viewing all users' progress
- **Cloud sync**: Per-user data sync to Supabase (separate ADR)

## Related ADRs

- [ADR-023](ADR-023-answer-persistence.md) - Storage layer with user_id support
- [ADR-031](ADR-031-unified-page-layout.md) - Page templates (ProfilePicker uses HOME variant)
