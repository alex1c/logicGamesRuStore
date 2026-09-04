# Privacy data map / Карта данных

Companion to [DATA_SAFETY_DRAFT.md](./DATA_SAFETY_DRAFT.md) and [privacy.html](./privacy.html).  
Technical inventory — not a legal privacy policy.

**VERIFY AGAINST CURRENT YANDEX SDK DOCUMENTATION BEFORE STORE SUBMISSION** for third-party SDK fields.

---

## Local data

Persisted on device via AsyncStorage (`docs/STORAGE.md`, schema **v4**):

| Key | Contents |
|-----|----------|
| `@fm/meta` | Schema version |
| `@fm/settings` | Theme, haptics, sound toggle (reserved) |
| `@fm/profile` | Anonymous `profileSeed`, `createdAt` |
| `@fm/skills` | Per-category skill levels |
| `@fm/streak` | Current / best / lastCompletedDate |
| `@fm/activeSession` | Resumable daily/practice session |
| `@fm/dailyCompletion` | Today’s daily summary |
| `@fm/sessionHistory` | Last ~20 sessions |
| `@fm/recentPuzzles` | Rolling puzzle ids (anti-repeat) |
| `@fm/achievements` | Unlocked achievements |
| `@fm/achievementStats` | Counters for achievement evaluation |
| `@fm/adPolicy` | Interstitial counters (completed sessions, last shown, etc.) |

Not synced to a ForestMusic backend in v1.

---

## Analytics

Provider: **AppMetrica** (`@appmetrica/react-native-analytics`).

App-defined events (see [ANALYTICS.md](./ANALYTICS.md)):

- Lifecycle: `app_open`
- Daily: `daily_started`, `daily_resumed`, `daily_completed`
- Practice: `practice_started`, `practice_completed`
- Puzzle: `puzzle_answered`, `hint_used`, `solution_revealed`, `category_selected`
- Progress: `achievement_unlocked`, `streak_updated`
- Ads: `ad_banner_*`, `ad_interstitial_*`, `ad_rewarded_*`

Payloads are sanitized: no raw answers, seeds, `profileSeed`, or PII fields from the app layer.

Key location: configured in `src/monetization/config.ts` (not documented here).

---

## Advertising

Provider: **Yandex Mobile Ads** (`yandex-mobile-ads`).

| Format | v1 |
|--------|-----|
| Banner | Today / Play / Progress |
| Interstitial | Result exit, gated policy |
| Rewarded | Hint 2 |
| Native / App Open / Feed | Disabled |

Used for ad serving and measurement. Gameplay does not require ads.

Details: [MONETIZATION.md](./MONETIZATION.md).

---

## No account / backend

- No registration or login.
- No first-party user profile server.
- Progress stays on the device unless/until a future product adds sync (out of scope for v1).

Do **not** claim that «no data is collected» — AppMetrica and Yandex Ads are integrated.
