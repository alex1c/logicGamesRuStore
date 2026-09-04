# Storage schema

## Current version: 4

Keys (AsyncStorage):

| Key | Purpose |
|-----|---------|
| `@fm/meta` | `{ schemaVersion: 4 }` |
| `@fm/settings` | theme / haptics (sound toggle reserved; sounds not shipped yet) |
| `@fm/profile` | anonymous `profileSeed` |
| `@fm/skills` | per-category skill 1–5 |
| `@fm/streak` | current / best / lastCompletedDate |
| `@fm/activeSession` | resumable daily/practice session (`schemaVersion` 2\|3\|4) |
| `@fm/dailyCompletion` | today's daily summary (`schemaVersion` 2\|3\|4) |
| `@fm/sessionHistory` | last ~20 sessions |
| `@fm/recentPuzzles` | rolling ~80 puzzle ids (includes matchsticks) |
| `@fm/achievements` | unlocked achievements `{ id, unlockedAt }[]` |
| `@fm/achievementStats` | counters for achievement evaluation |
| `@fm/adPolicy` | interstitial eligibility counters (`InterstitialPolicyState`) |

### `@fm/adPolicy` shape

```ts
{
  completedSessions: number
  sessionsSinceLastShow: number
  lastShownAt: number | null
  processedSessionIds: string[] // bounded, idempotent by sessionId
}
```

Used only for monetization gating — not for scoring or Daily generation.  
See [MONETIZATION.md](./MONETIZATION.md).

## Migration

### v1 → v2+
- Legacy `@fm/demoWorkout` (schemaVersion 1) is **dropped** on upgrade.
- Settings are preserved when possible.
- Legacy `@fm/streakDays` placeholder is cleared.

### v2 → v3
- Adds `@fm/achievements` and `@fm/achievementStats` if missing.
- Bumps active/daily `schemaVersion` fields from 2 → 3 without wiping:
  streak, skills, history, recent puzzles, profile seed, daily completion.
- Re-running `ensureStorageMigrated()` is idempotent.

### v3 → v4
- Adds `@fm/adPolicy` with empty interstitial counters if missing.
- Bumps meta `schemaVersion` to **4**.
- Does not wipe progress, achievements, or sessions.
- Re-running `ensureStorageMigrated()` is idempotent.

Call `ensureStorageMigrated()` before reading app keys.

## Orientation

App is **portrait-only** (`app.config.js` → `"orientation": "portrait"`), matching other ForestMusic Expo apps. Landscape is not a supported layout target; the process must not crash if the OS briefly reports landscape.
