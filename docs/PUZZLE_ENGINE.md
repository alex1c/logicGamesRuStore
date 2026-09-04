# Puzzle Engine

Architectural contract for generating, validating, and presenting logic puzzles.

## Goals

- Add dozens of puzzle types later without rewriting screens
- Reproduce any generated puzzle from `generatorId + version + seed + difficulty`
- Keep UI dumb: it receives a validated `Puzzle` and renders by `interactionType`

## Puzzle model

`Puzzle` is a discriminated union on `interactionType`:

| interactionType   | Answer shape        | Typical use              |
|-------------------|---------------------|--------------------------|
| `multiple_choice` | option id           | curated logic / words    |
| `numeric_input`   | finite number       | sequences, math grids    |
| `select_item`     | item id             | odd-one-out              |
| `text_input`      | normalized string   | word puzzles             |
| `tap_target`      | cell id             | attention grids          |

Every puzzle must include:

- `id`, `type`, `category`, `difficulty` (1–5)
- `prompt`, `hints[]`, `explanation`
- `seed`, `metadata.generatorId`, `metadata.generatorVersion`

Empty explanations are invalid.

## Categories

`logic | math | sequence | attention | odd_one_out | words | matchsticks`

Not all categories have generators in Phase 1.

## Deterministic RNG

Use `createRng(seed)` / `createGeneratorRng(identity, seed, difficulty)` from:

- `src/utils/prng.ts`
- `src/features/puzzles/engine/generator.ts`

**Never** call `Math.random()` inside generators.

Identical `(generatorId, version, seed, difficulty)` must yield a deep-equal puzzle.

## Generator contract

```ts
type PuzzleGenerator = {
  generatorId: string
  version: number
  displayName: string
  generate: (input: { seed: number; difficulty: Difficulty }) => Puzzle
}
```

### Versioning rule

If the algorithm changes in a way that would alter outputs for old seeds, **bump `version`** (and usually `generatorId` suffix). Old seeds must not silently map to different content.

Register generators via `registerGenerator` / `ensureGeneratorsRegistered()`.

Prefer `generateValidatedPuzzle()` for production paths: it validates and can retry nearby seeds when not in strict mode.

## Validity rules (validator)

`validatePuzzle()` checks, among other things:

- non-empty prompt / explanation / hints
- difficulty in 1–5
- finite seed
- metadata generator id + version >= 1
- interaction-specific constraints:
  - unique option/item labels and ids
  - exactly one correct option where required
  - numeric answers finite; integer when `integerOnly`
  - tap grid cell count = rows × cols
  - answer references an existing option/item/cell

## Answer checking

`checkAnswer(puzzle, submitted)`:

- numeric: trim spaces, optional leading `+`, reject NaN / junk; integer puzzles reject non-integers
- text: trim, case-fold, `ё`→`е` (no fuzzy matching)
- choice / select / tap: exact id match

## How to add a generator

1. Create `src/features/puzzles/generators/myGenerator.ts`
2. Define stable `IDENTITY = { generatorId, version }`
3. Implement `generate({ seed, difficulty })` using `createGeneratorRng`
4. Return a fully populated `Puzzle` (hints + explanation required)
5. Export and add to `ALL_GENERATORS` in `generators/index.ts`
6. Add stress tests in `tests/generators/` (hundreds/thousands of seeds)
7. Optionally wire into demo workout plan

## How to add a curated puzzle

1. Append to `CURATED_PUZZLES` in `src/features/puzzles/curated/library.ts`
2. Use a **stable** `id` (`curated.<category>.<slug>`)
3. Provide difficulty, hint(s), explanation, correct answer
4. Original wording only — do not copy commercial puzzle banks
5. Ensure `validatePuzzle` passes (covered by tests)

## PuzzleRunner

`src/features/puzzles/engine/PuzzleRunner.tsx` is the single play shell:

1. category + progress
2. prompt
3. renderer by `interactionType`
4. check answer
5. hints / reveal solution
6. explanation («Почему так?»)
7. next

Do not create one screen per puzzle type.

## Current generators (Phase 1)

| generatorId                 | category     | interaction   |
|-----------------------------|--------------|---------------|
| `sequence.number.v1`        | sequence     | numeric_input |
| `math.pattern.grid.v1`      | math         | numeric_input |
| `odd_one_out.numbers.v1`    | odd_one_out  | select_item   |
| `attention.symbols.v1`      | attention    | tap_target    |

Plus curated library (`curated.library` v1) for logic / words / odd_one_out.
