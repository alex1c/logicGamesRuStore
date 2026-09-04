# Analytics / Аналитика

AppMetrica via `@appmetrica/react-native-analytics`.  
API key is **configured in `src/monetization/config.ts`** (do not paste production keys into docs or logs).

Facade: `src/analytics` → `trackEvent` / `bootstrapAnalytics`. Game code must not import the SDK directly.

---

## Rules

1. **Analytics must not drive game state.** Streak, skills, achievements, session finalization, and navigation never depend on event delivery success.
2. **Offline-first.** Missing network / SDK init failure must not crash or block gameplay.
3. **Completion idempotency.** Durable completion side effects (daily once per day, session counted once by `sessionId`) are owned by storage / session store — not by analytics retries.
4. **Determinism.** Analytics must not feed PRNG, Daily seeds, generator seeds, or difficulty selection.
5. **No custom fingerprinting.** Do not manually send advertising ID, IMEI, Android ID, MAC, email, or user name; rely on SDK defaults only.

---

## Event catalog

| Event | When |
|-------|------|
| `app_open` | Once per cold analytics bootstrap / real app launch |
| `daily_started` | Daily workout started |
| `daily_resumed` | Existing daily session restored |
| `daily_completed` | Daily session durable-finalized |
| `practice_started` | Practice session started |
| `practice_completed` | Practice session durable-finalized |
| `puzzle_answered` | Player submitted an answer |
| `hint_used` | Hint granted (level 1 or 2) |
| `solution_revealed` | Solution shown after confirm |
| `category_selected` | Practice category chosen on Play |
| `achievement_unlocked` | New achievement unlocked |
| `streak_updated` | Streak state changed after daily completion |
| `ad_banner_loaded` | Banner SDK load success |
| `ad_banner_failed` | Banner SDK load/show failure |
| `ad_interstitial_loaded` | Interstitial loaded |
| `ad_interstitial_shown` | Interstitial actually shown |
| `ad_interstitial_failed` | Interstitial load/show failure |
| `ad_rewarded_loaded` | Rewarded loaded |
| `ad_rewarded_shown` | Rewarded shown |
| `ad_rewarded_completed` | Reward confirmed (`onRewarded`) |
| `ad_rewarded_failed` | Rewarded load/show/cancel path failure |

Legacy aliases `workout_started` / `workout_resumed` / `workout_completed` normalize to `daily_*` in `normalizeEventName`.

---

## Allowed payload fields (examples)

Keep payloads small and typed (`string | number | boolean`):

- `sessionType` — `daily` \| `practice`
- `sessionId` — opaque id (optional; prefer short)
- `category` — puzzle category enum
- `difficulty` — 1–5
- `puzzleIndex` — index in session
- `correct` / `wrong` / `hintsUsed` — counts or booleans as needed
- `hintLevel` — `1` \| `2`
- `source` — e.g. `rewarded` \| `free` \| `fallback`
- `placement` — `today` \| `play` \| `progress` \| `session_result_exit` \| `puzzle_hint_2`
- `achievementId`
- `streakCurrent` / `streakBest`
- `reason` — coarse failure category (not stack traces / raw SDK dumps)

Banner placements use stable keys: `today`, `play`, `progress` — not raw route paths.

---

## Banned fields (stripped by `sanitizePayload`)

Never send:

- raw answers / `answer` / `rawAnswer`
- `explanation` / `prompt` (puzzle text)
- generator `seed` / `profileSeed`
- device identifiers: `deviceId`, `androidId`, `advertisingId`, `imei`
- `email`, full storage dumps (`storage`)
- PII (name, contacts, etc.)

If a field is banned or nullish, it is dropped before SDK export.

---

## Ad event hygiene

- `ad_banner_loaded` / `ad_banner_failed` only from real SDK callbacks (no spam on React re-render).
- Interstitial / rewarded shown/completed only after confirmed show / reward.

---

## Related code

- `src/analytics/events.ts` — names + sanitize  
- `src/analytics/appMetrica.ts` — SDK bridge  
- `src/analytics/index.ts` — facade  
- `src/monetization/config.ts` — AppMetrica key config location
