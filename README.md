# Головоломка дня

Android-first приложение ForestMusic — логические задачи, головоломки и короткие ежедневные тренировки.

Репозиторий: `logicGamesRuStore`. Package: `ru.forestmusic.logicgames`.

Приложение **не** является IQ-тестом и не делает медицинских или псевдонаучных заявлений.

## Возможности

- **7 категорий:** logic, math, sequence, attention, odd_one_out, words, matchsticks
- **Daily Workout** — 10 задач ≈ 5 минут, день + локальный profile seed
- Practice по категориям (без влияния на streak)
- Adaptive difficulty / skills, streak, achievements
- **Offline-first** — полный геймплей без сети
- **Yandex Mobile Ads** — banner, interstitial, rewarded
- **AppMetrica** — продуктовая аналитика

## Стек

- Expo SDK 57 · React Native 0.86 · React 19 · TypeScript (strict)
- Expo Router · Jest · AsyncStorage
- `yandex-mobile-ads` · `@appmetrica/react-native-analytics`

Ориентир устройства: **Pixel_10 / API 37**.

## Native build required

Ads and AppMetrica need a **dev client / release native build**.  
Expo Go is not a production path for this app.

```bash
npm install
npx expo prebuild --platform android   # when native project needed
npm run android
```

## Быстрый старт (JS / Metro)

```bash
npm install
npx expo start
```

## Проверки

```bash
npm test
npm run test:audit
npm run typecheck
npm run lint
npm run doctor
npm run check:icons
```

| Script | Purpose |
|--------|---------|
| `npm test` | Unit/smoke (без тяжёлых 10k audit) |
| `npm run test:audit` | Generator + matchstick oracle audits |
| `npm run check:icons` | Release icon presence / basic PNG checks |

## Реклама (production)

**Enabled:** banner `R-M-19984070-1`, interstitial `-3`, rewarded `-4`.

**Disabled in v1:** Native `-2`, App Open `-5`, Feed `-6`.

Placements and policy: [docs/MONETIZATION.md](docs/MONETIZATION.md).

## Аналитика

AppMetrica events and payload rules: [docs/ANALYTICS.md](docs/ANALYTICS.md).  
API key is configured in `src/monetization/config.ts` (not published in docs).

Analytics must not drive game state; gameplay does not depend on event delivery.

## Структура

```text
app/                    # Expo Router screens
  (tabs)/               # Сегодня / Играть / Прогресс / Ещё
  workout/              # Daily/practice runner + result
src/
  analytics/            # AppMetrica facade
  monetization/         # Yandex Ads + policy
  features/puzzles/     # Puzzle Engine
  features/progress/    # Skills, streak, achievements
  features/workout/     # Daily mix + session store
  storage/              # Persistence (schema v4)
docs/                   # Architecture + release docs
release-assets/         # Icon master for store/install
release-artifacts/      # Local AAB/screenshots (binaries not committed)
credentials/            # keystore.properties.example only
```

## Документация

- [docs/PUZZLE_ENGINE.md](docs/PUZZLE_ENGINE.md)
- [docs/STORAGE.md](docs/STORAGE.md)
- [docs/MONETIZATION.md](docs/MONETIZATION.md)
- [docs/ANALYTICS.md](docs/ANALYTICS.md)
- [docs/PRIVACY_DATA_MAP.md](docs/PRIVACY_DATA_MAP.md)
- [docs/DATA_SAFETY_DRAFT.md](docs/DATA_SAFETY_DRAFT.md)
- [docs/privacy.html](docs/privacy.html) — expected Pages URL:  
  `https://alex1c.github.io/logicGamesRuStore/privacy.html`
- [docs/RELEASE_CHECKLIST.md](docs/RELEASE_CHECKLIST.md)
- [docs/RUSTORE_SCREENSHOT_PLAN.md](docs/RUSTORE_SCREENSHOT_PLAN.md)

Release AAB naming: `logic-games-1.0.0-v1.aab`.  
Production keystore is created by the maintainer separately — see checklist; never commit secrets.

## Лицензия

См. `LICENSE`.
