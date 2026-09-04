# Логические игры / Игры разума

Android-first приложение — сборник логических задач и коротких ежедневных тренировок мозга.

Рабочее название продукта: **Логические игры**. Кодовое имя репозитория: `logicGamesRuStore` (ForestMusic family).

Приложение **не** является IQ-тестом и не делает псевдонаучных заявлений.

## Стек

- Expo SDK 57
- React Native 0.86
- React 19
- TypeScript (strict)
- Expo Router
- Jest + jest-expo
- ESLint (eslint-config-expo)
- AsyncStorage (минимальная persistence)

Ориентир устройства: **Pixel_10 / API 37**.

## Быстрый старт

```bash
npm install
npx expo start
```

Android:

```bash
npm run android
```

## Проверки

```bash
npm test
npm run test:audit
npm run typecheck
npm run lint
npm run doctor
```

`npm test` — unit/smoke (без тяжёлых 10k audit-сюитов).  
`npm run test:audit` — Codex generator audit + matchstick oracle (10k seeds).

## Структура

```text
app/                    # Expo Router screens
  (tabs)/               # Сегодня / Играть / Прогресс / Ещё
  workout/              # Daily/practice runner + result
src/
  features/puzzles/     # Puzzle Engine (domain)
    engine/             # Generator contract, PuzzleRunner
    generators/         # Seeded generators (incl. matchsticks)
    matchsticks/        # Seven-segment equation model + oracle
    renderers/          # Interaction-type UI
    validation/         # Puzzle + answer validation
    types/              # Discriminated unions
    curated/            # Hand-authored puzzles
  features/progress/    # Skills, streak, achievements
  features/workout/     # Daily mix + session store
  storage/              # Persistence (schema v3)
  theme/                # Design tokens
  utils/                # Deterministic PRNG, haptics
tests/                  # Unit + smoke
tests/audit/            # Heavy stress / oracle audits
docs/                   # Architecture docs
```

UI и puzzle-domain разделены: экраны не содержат логики генерации.

## Puzzle Engine (кратко)

- Типобезопасная модель `Puzzle` (discriminated union по `interactionType`)
- Deterministic PRNG (`src/utils/prng.ts`) — генераторы **не** используют `Math.random()`
- Контракт генератора + `generatorId` / `version`
- Validator перед выдачей задачи в UI
- Universal `PuzzleRunner` + renderers по типу взаимодействия
- Matchsticks: tap-to-move, seven-segment, reverse generator, independent oracle

Подробности: [docs/PUZZLE_ENGINE.md](docs/PUZZLE_ENGINE.md)

## Daily / Practice

На вкладке **Сегодня** — Daily Workout из **10** задач (день + profile seed), до 7 категорий включая спички.

На вкладке **Играть** — practice по категориям (10 задач, без влияния на streak).

На вкладке **Прогресс** — навыки, активность, достижения.

Подробности: [docs/PUZZLE_ENGINE.md](docs/PUZZLE_ENGINE.md) · Storage: [docs/STORAGE.md](docs/STORAGE.md)

## Что сознательно отложено

Реклама (РСЯ), AppMetrica SDK, interstitial/rewarded, production signing, облако, аккаунты, push, покупки, монеты/магазин.

## Лицензия

См. `LICENSE`.
