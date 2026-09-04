# Data Safety draft (technical) / Черновик Data Safety

> **This is a technical cheat sheet for store forms — NOT a legal declaration.**  
> **Это техническая шпаргалка, а не юридическая декларация.**

**VERIFY AGAINST CURRENT YANDEX SDK DOCUMENTATION BEFORE STORE SUBMISSION**

Before RuStore / any store Data Safety answers, re-check the exact AppMetrica and Yandex Mobile Ads SDK versions shipped in the release AAB against the vendor’s current privacy / data-collection docs. SDK behavior can change between versions.

---

## App itself / Само приложение

Stores locally on device (AsyncStorage, schema v4):

| Data | Purpose |
|------|---------|
| Progress / session history | Recent workouts |
| Skills | Per-category skill 1–5 |
| Streak | Current / best / last completed date |
| Achievements + stats | Unlocks and counters |
| Active session | Resume daily/practice |
| Daily completion | Today’s daily summary |
| Settings | Theme / haptics (sound reserved) |
| Anonymous `profileSeed` | Local identity for Daily mix (not an account) |
| Ad policy counters | Interstitial eligibility (`@fm/adPolicy`) |

No cloud sync of this game profile in v1.

---

## Account / Аккаунт

**None.** No registration, login, or user account.

---

## Own backend / Собственный backend

**None.** No first-party server for game profile, progress, or identity.

---

## AppMetrica

Connected for product analytics (events listed in [ANALYTICS.md](./ANALYTICS.md)).  
API key configured in `src/monetization/config.ts`.

App does not manually collect advertising ID / IMEI / Android ID / email for analytics.

**VERIFY AGAINST CURRENT YANDEX SDK DOCUMENTATION BEFORE STORE SUBMISSION** for what the SDK itself may collect or transmit.

---

## Yandex Mobile Ads

Connected for banner, interstitial, and rewarded ads (see [MONETIZATION.md](./MONETIZATION.md)).  
Native / App Open / Feed are disabled in v1 but block IDs exist in config.

Ads SDK may process technical data for ad serving and measurement.

**VERIFY AGAINST CURRENT YANDEX SDK DOCUMENTATION BEFORE STORE SUBMISSION.**

---

## Offline

Core gameplay works offline:

- Today / Daily (10 puzzles)
- Practice / all 7 categories including Matchsticks
- Progress, achievements, streak, resume, local settings

Ads and AppMetrica are **not** required for play.

---

## Do not claim

Do **not** write store answers like «no data is collected» — third-party SDKs are present.

Use this draft + current Yandex docs + the privacy page ([privacy.html](./privacy.html)) when filling forms.
