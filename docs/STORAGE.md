# Storage schema

## Current version: 2

Keys (AsyncStorage):

| Key | Purpose |
|-----|---------|
| `@fm/meta` | `{ schemaVersion: 2 }` |
| `@fm/settings` | theme / haptics |
| `@fm/profile` | anonymous `profileSeed` |
| `@fm/skills` | per-category skill 1–5 |
| `@fm/streak` | current / best / lastCompletedDate |
| `@fm/activeSession` | resumable daily/practice session |
| `@fm/dailyCompletion` | today's daily summary |
| `@fm/sessionHistory` | last ~20 sessions |
| `@fm/recentPuzzles` | rolling ~80 puzzle ids |

## Migration from v1 (Codex demo)

- Legacy `@fm/demoWorkout` (schemaVersion 1) is **dropped** on upgrade.
- Reason: demo sessions stored puzzle ids without a full plan; rebuilding into ActiveSessionPersisted is unreliable after generator/content changes.
- Settings are preserved when possible.
- Legacy `@fm/streakDays` placeholder is cleared (it was never a real completion streak).

Call `ensureStorageMigrated()` before reading Phase-2 keys.
