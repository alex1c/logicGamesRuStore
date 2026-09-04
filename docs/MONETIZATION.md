# Monetization / Монетизация

Yandex Mobile Ads (`yandex-mobile-ads`). Central config: `src/monetization/config.ts`.  
Реклама вторична: игра работает offline; no-fill / SDK fail не ломают gameplay.

---

## Production block IDs (enabled)

| Format | Block ID | Status |
|--------|----------|--------|
| Banner | `R-M-19984070-1` | enabled |
| Interstitial | `R-M-19984070-3` | enabled |
| Rewarded | `R-M-19984070-4` | enabled |

In `__DEV__`, demo units from Yandex are used instead of production IDs.

---

## Disabled in v1 (do not enable casually)

| Format | Block ID | Status |
|--------|----------|--------|
| Native | `R-M-19984070-2` | **disabled** |
| App Open | `R-M-19984070-5` | **disabled** |
| Feed | `R-M-19984070-6` | **disabled** |

IDs are reserved in config for a future release. Enabling them without product review is forbidden.

---

## Banner

### Placements (sticky adaptive)

| Placement key | Screen (RU) | Notes |
|---------------|-------------|--------|
| `today` | Сегодня | Tab home |
| `play` | Играть | Category list |
| `progress` | Прогресс | Skills / achievements |

### No banner

- **Puzzle Runner** (`workout` active puzzle UI) — no ads during solve.
- Result may show interstitial on exit (separate format), not a banner.

Banner collapses silently on no-fill / missing SDK. Today must not wait for banner load.

---

## Interstitial

**Placement:** `session_result_exit`  
User sees **Result first**, then may see interstitial when leaving Result (e.g. «Готово»).

### Policy (`INTERSTITIAL_POLICY`)

| Rule | Value |
|------|--------|
| First-use protection | First **2** completed game sessions never show interstitial |
| First eligible | From the **3rd** completed session |
| Gap after show | **3** new completed sessions before another show |
| Cooldown | **5 minutes** between actual shows |
| Cap | **max 1** interstitial per app process session |

Counters live in `@fm/adPolicy` (durable). Counting is idempotent by `sessionId` — Result re-render / app restart / route revisit must not double-count.

Eligibility is pure (`src/monetization/policy.ts`); UI never invents parallel rules.

---

## Rewarded

**Placement:** `puzzle_hint_2`

| Hint / action | Monetization |
|---------------|--------------|
| Hint 1 | **Always free** |
| Hint 2 | **Rewarded** when SDK available and fill exists |
| Hint 2 unavailable / no-fill / show fail | **Free fallback** (`REWARDED_POLICY.freeFallbackWhenUnavailable`) |
| Reveal solution | **Always free** (confirm dialog only) |

Reward is granted only on confirmed SDK `onRewarded`. Reward context is bound to `sessionId + puzzleId + puzzleIndex` so a late callback cannot apply to another puzzle.

---

## Init / failure safety

- Ads initialize after UI is usable (`initializeAds`), never block Today.
- Banner / interstitial / rewarded failures must not affect score, streak, skills, achievements, resume, or navigation.
- Returning from background must **not** show App Open (format disabled).

---

## Related code

- `src/monetization/config.ts` — IDs and policy constants  
- `src/monetization/policy.ts` — interstitial eligibility  
- `src/monetization/banner/BannerSlot.tsx`  
- `src/monetization/interstitial/controller.ts`  
- `src/monetization/rewarded/controller.ts`  
- `src/storage` — `@fm/adPolicy`
