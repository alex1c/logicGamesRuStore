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
npm run typecheck
npm run lint
npm run doctor
```

## Структура

```text
app/                    # Expo Router screens
  (tabs)/               # Сегодня / Играть / Прогресс / Ещё
  workout/              # Demo workout + result
src/
  features/puzzles/     # Puzzle Engine (domain)
    engine/             # Generator contract, PuzzleRunner
    generators/         # Seeded generators
    renderers/          # Interaction-type UI
    validation/         # Puzzle + answer validation
    types/              # Discriminated unions
    curated/            # Hand-authored puzzles
  features/workout/     # Demo workout assembly
  storage/              # Persistence abstraction
  theme/                # Design tokens
  utils/                # Deterministic PRNG
tests/                  # Unit + stress tests
docs/                   # Architecture docs
```

UI и puzzle-domain разделены: экраны не содержат логики генерации.

## Puzzle Engine (кратко)

- Типобезопасная модель `Puzzle` (discriminated union по `interactionType`)
- Deterministic PRNG (`src/utils/prng.ts`) — генераторы **не** используют `Math.random()`
- Контракт генератора + `generatorId` / `version`
- Validator перед выдачей задачи в UI
- Universal `PuzzleRunner` + renderers по типу взаимодействия

Подробности: [docs/PUZZLE_ENGINE.md](docs/PUZZLE_ENGINE.md)

## Demo / Daily

На вкладке **Сегодня** — полноценная Daily Workout из **10** задач (детерминированная на календарный день + profile seed).

На вкладке **Играть** — practice по категориям (10 задач, без влияния на streak).

Подробности движка: [docs/PUZZLE_ENGINE.md](docs/PUZZLE_ENGINE.md) · Storage: [docs/STORAGE.md](docs/STORAGE.md)

## Что сознательно не входит в Phase 0–1

Реклама (РСЯ), AppMetrica, interstitial/rewarded, production signing, облако, аккаунты, push, покупки, полноценный daily adaptive workout.

## Лицензия

См. `LICENSE`.
