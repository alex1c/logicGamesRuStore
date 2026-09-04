# Storage schema

## Current version: 3

Keys (AsyncStorage):

| Key | Purpose |
|-----|---------|
| `@fm/meta` | `{ schemaVersion: 3 }` |
| `@fm/settings` | theme / haptics (sound toggle reserved; sounds not shipped yet) |
| `@fm/profile` | anonymous `profileSeed` |
| `@fm/skills` | per-category skill 1–5 |
| `@fm/streak` | current / best / lastCompletedDate |
| `@fm/activeSession` | resumable daily/practice session (`schemaVersion` 2\|3) |
| `@fm/dailyCompletion` | today's daily summary (`schemaVersion` 2\|3) |
| `@fm/sessionHistory` | last ~20 sessions |
| `@fm/recentPuzzles` | rolling ~80 puzzle ids (includes matchsticks) |
| `@fm/achievements` | unlocked achievements `{ id, unlockedAt }[]` |
| `@fm/achievementStats` | counters for achievement evaluation |

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

Call `ensureStorageMigrated()` before reading app keys.

## Orientation

App is **portrait-only** (`app.json` → `"orientation": "portrait"`), matching other ForestMusic Expo apps. Landscape is not a supported layout target; the process must not crash if the OS briefly reports landscape.
