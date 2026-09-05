# Release checklist — Головоломка дня v1.0.0

Package: `ru.forestmusic.logicgames`  
Version: **1.0.0** · versionCode: **1**  
AAB name scheme: `logic-games-1.0.0-v1.aab`  
Support: `rustore-alex1c@yandex.ru`  
Privacy (expected GitHub Pages URL):  
`https://alex1c.github.io/logicGamesRuStore/privacy.html`  
(Enable Pages / publish `docs/privacy.html` before storefront submission; do not claim HTTP 200 until verified.)

---

## Code

- [ ] `npm test`
- [ ] `npm run test:audit`
- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run doctor`
- [ ] `npm run check:icons`

---

## Production configuration

- [ ] App name: **Головоломка дня**
- [ ] Android package: `ru.forestmusic.logicgames`
- [ ] version `1.0.0` / versionCode `1`
- [ ] Orientation: portrait
- [ ] AppMetrica production key configured in `src/monetization/config.ts` (not logged)
- [ ] Production ad IDs: banner `-1`, interstitial `-3`, rewarded `-4`
- [ ] Disabled formats remain off: Native `-2`, App Open `-5`, Feed `-6`
- [ ] Release build does **not** use Yandex demo units
- [ ] No secrets in git (keystore, passwords, private keys)

---

## Privacy / Data Safety

- [ ] Privacy page published and URL verified
- [ ] Support email works: `rustore-alex1c@yandex.ru`
- [ ] Store Data Safety answers reviewed against [DATA_SAFETY_DRAFT.md](./DATA_SAFETY_DRAFT.md)
- [ ] **VERIFY AGAINST CURRENT YANDEX SDK DOCUMENTATION BEFORE STORE SUBMISSION**
- [ ] Do not claim «no data collected»

---

## Icon (mandatory)

> **RuStore storefront icon MUST come from the approved `icon_gpt` master / `release-assets/icon-master.png`.**  
> Storefront icon and Android installed icon must be produced from the **same** approved artwork.  
> Do not invent a second «almost the same» icon for the store.

- [ ] Approved source: `assets/icon_gpt.png` (or project `icon_gpt*` master) — do not destructive-overwrite
- [ ] Store master: `release-assets/icon-master.png`
- [ ] Expo / adaptive / density derivatives generated from that master
- [ ] `npm run check:icons` passes
- [ ] No leftover placeholder launcher assets after native generation

---

## Native QA (target: Pixel_10 / API 37)

- [ ] Cold start / splash (no old product name)
- [ ] Today — Daily 10 puzzles, resume, completion summary
- [ ] Practice — all **7** categories including Matchsticks
- [ ] Progress — skills, streak, achievements
- [ ] About — name, version, support mailto
- [ ] Banner on Today / Play / Progress; **no** banner in Puzzle Runner
- [ ] Interstitial policy: first 2 protected, eligible from 3rd, gap/cooldown/cap
- [ ] Result shown **before** interstitial on exit
- [ ] Rewarded Hint 2 + free fallback; Hint 1 and solution free
- [ ] Analytics events fire without blocking UI
- [ ] Offline: full gameplay without network
- [ ] Large font scale / accessibility smoke
- [ ] No App Open on resume from background

---

## Signing (user creates keystore separately)

Do **not** auto-generate a production keystore in CI/agent.
Do **not** copy the `.jks` into the Git repository.

Confirmed local keystore (outside repo):

- Path: `D:\PetProject\secure\logicGames\logic-games-release.jks`
- Alias: `logicgames`

1. [x] Dedicated production keystore for `ru.forestmusic.logicgames` exists outside the repo
2. [ ] Backup keystore the same day
3. [ ] Store password separately from the repo
4. [ ] Never lose the keystore — required for future updates
5. [ ] Copy `credentials/keystore.properties.example` → local gitignored `keystore.properties` (point `storeFile` at the absolute path above)
6. [ ] Confirm `.jks` / `.keystore` / real passwords are **not** committed
7. [ ] `plugins/withReleaseSigning` is listed in `app.config.js` so prebuild wires `signingConfigs.release`

---

## Build

- [ ] Native release / signed **AAB**
- [ ] Output named like `logic-games-1.0.0-v1.aab` under `release-artifacts/` (binaries not committed)
- [ ] Verify package name, versionName, versionCode in the AAB
- [ ] Inspect merged release manifest: no unexpected `SYSTEM_ALERT_WINDOW`, storage, location, or notification permissions without product need
- [ ] List any SDK-added network/ads permissions in the release notes

---

## RuStore upload

- [ ] Screenshots per [RUSTORE_SCREENSHOT_PLAN.md](./RUSTORE_SCREENSHOT_PLAN.md) (verify current RuStore dimensions before capture)
- [ ] Storefront icon from approved master artwork
- [ ] Short / full description (no IQ / medical claims)
- [ ] Privacy URL live
- [ ] Support email
- [ ] Data Safety form filled from draft + current Yandex docs
- [ ] Upload AAB and submit

---

## Related docs

- [MONETIZATION.md](./MONETIZATION.md)
- [ANALYTICS.md](./ANALYTICS.md)
- [PRIVACY_DATA_MAP.md](./PRIVACY_DATA_MAP.md)
- [DATA_SAFETY_DRAFT.md](./DATA_SAFETY_DRAFT.md)
- [privacy.html](./privacy.html)
