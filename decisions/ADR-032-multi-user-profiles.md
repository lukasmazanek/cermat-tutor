# ADR-032: Multi-user Profiles

**Date:** 2024-12-29
**Status:** Accepted
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
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ Anežka  │ │  Petr   │ │  Marie  │   │
│  └─────────┘ └─────────┘ └─────────┘   │
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
export const PROFILES = [
  { id: 'anezka', name: 'Anežka' },
  { id: 'petr', name: 'Petr' },
] as const

export type ProfileId = typeof PROFILES[number]['id']
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

## Implementation Plan

### Phase 1: Core Infrastructure
1. Create `src/config/profiles.ts` with profile definitions
2. Create `ProfilePicker` component (HOME template variant)
3. Add user context to App.tsx
4. Update App routing: ProfilePicker → TopicSelector

### Phase 2: Storage Integration
1. Pass `user_id` to all storage operations
2. Update `useAttempts` hook to accept user context
3. Migrate existing data to first profile (anezka)

### Phase 3: UI Polish
1. Add "Změnit uživatele" option (accessible from somewhere)
2. Optional: Add profile avatars/colors

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

Existing localStorage data will be associated with first configured profile:

```
tutor_progress → tutor_progress_anezka
tutor_attempts → tutor_attempts_anezka
```

## Future Considerations

- **Avatars/icons**: Visual differentiation for younger users
- **Profile colors**: Each user gets a theme color
- **Parent mode**: Hidden profile for viewing all users' progress
- **Cloud sync**: Per-user data sync to Supabase (separate ADR)

## Related ADRs

- [ADR-031](ADR-031-unified-page-layout.md) - Page templates (ProfilePicker uses HOME variant)
- Storage ADR (TBD) - Data persistence layer with user_id support
