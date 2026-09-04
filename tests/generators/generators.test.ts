import { sequenceNumberGenerator } from '@/src/features/puzzles/generators/sequenceNumber'
import { mathPatternGenerator } from '@/src/features/puzzles/generators/mathPattern'
import { oddOneOutNumbersGenerator } from '@/src/features/puzzles/generators/oddOneOutNumbers'
import { attentionSymbolsGenerator } from '@/src/features/puzzles/generators/attentionSymbols'
import { validatePuzzle } from '@/src/features/puzzles/validation/validatePuzzle'
import type { Difficulty, Puzzle } from '@/src/features/puzzles/types'
import type { PuzzleGenerator } from '@/src/features/puzzles/engine/generator'

const SEED_COUNT = 1000
const DIFFICULTIES: Difficulty[] = [1, 2, 3, 4, 5]

function assertCommonInvariants(puzzle: Puzzle, difficulty: Difficulty, seed: number) {
	const result = validatePuzzle(puzzle)
	if (!result.ok) {
		throw new Error(
			`${puzzle.type} seed=${seed} d=${difficulty}: ` +
				result.issues.map((i) => i.message).join('; '),
		)
	}
	expect(puzzle.difficulty).toBe(difficulty)
	expect(puzzle.seed).toBe(seed)
	expect(puzzle.explanation.trim().length).toBeGreaterThan(0)
	expect(puzzle.prompt.trim().length).toBeGreaterThan(0)
	expect(puzzle.hints.length).toBeGreaterThan(0)
	expect(Number.isFinite(puzzle.seed)).toBe(true)
}

function runGeneratorBattery(generator: PuzzleGenerator, seeds: number) {
	describe(generator.generatorId, () => {
		it(`passes validation for ${seeds} seeds across difficulties`, () => {
			for (let seed = 0; seed < seeds; seed += 1) {
				const difficulty = DIFFICULTIES[seed % DIFFICULTIES.length]
				const puzzle = generator.generate({ seed, difficulty })
				assertCommonInvariants(puzzle, difficulty, seed)

				if (puzzle.interactionType === 'numeric_input') {
					expect(Number.isFinite(puzzle.answer)).toBe(true)
					expect(Number.isInteger(puzzle.answer)).toBe(true)
				}
				if (puzzle.interactionType === 'select_item') {
					const labels = puzzle.items.map((i) => i.label)
					expect(new Set(labels).size).toBe(labels.length)
					expect(puzzle.items.some((i) => i.id === puzzle.answer)).toBe(true)
				}
				if (puzzle.interactionType === 'multiple_choice') {
					const labels = puzzle.options.map((o) => o.label)
					expect(new Set(labels).size).toBe(labels.length)
					expect(puzzle.options.some((o) => o.id === puzzle.answer)).toBe(true)
				}
				if (puzzle.interactionType === 'tap_target') {
					expect(puzzle.grid.cells.length).toBe(
						puzzle.grid.rows * puzzle.grid.cols,
					)
					expect(puzzle.grid.cells.some((c) => c.id === puzzle.answer)).toBe(
						true,
					)
				}
			}
		})

		it('is deterministic for the same seed+difficulty', () => {
			const seed = 12345
			const difficulty: Difficulty = 3
			const a = generator.generate({ seed, difficulty })
			const b = generator.generate({ seed, difficulty })
			expect(a).toEqual(b)
		})

		it('exposes stable generator version metadata', () => {
			const puzzle = generator.generate({ seed: 1, difficulty: 1 })
			expect(puzzle.metadata.generatorId).toBe(generator.generatorId)
			expect(puzzle.metadata.generatorVersion).toBe(generator.version)
		})
	})
}

describe('generators stress', () => {
	const generators: PuzzleGenerator[] = [
		sequenceNumberGenerator,
		mathPatternGenerator,
		oddOneOutNumbersGenerator,
		attentionSymbolsGenerator,
	]

	for (const generator of generators) {
		runGeneratorBattery(generator, SEED_COUNT)
	}
})

describe('sequence next-term correctness samples', () => {
	it('arithmetic sample matches expected next term', () => {
		// Probe many seeds until we hit an arithmetic mechanic, then verify diffs.
		let found = false
		for (let seed = 0; seed < 200 && !found; seed += 1) {
			const puzzle = sequenceNumberGenerator.generate({
				seed,
				difficulty: 1,
			})
			if (puzzle.metadata.extra?.mechanic !== 'arithmetic') {
				continue
			}
			found = true
			const shown = String(puzzle.metadata.extra.shown)
				.split(',')
				.map(Number)
			const diffs = []
			for (let i = 1; i < shown.length; i += 1) {
				diffs.push(shown[i] - shown[i - 1])
			}
			expect(new Set(diffs).size).toBe(1)
			const step = diffs[0]
			expect(puzzle.answer).toBe(shown[shown.length - 1] + step)
		}
		expect(found).toBe(true)
	})
})

describe('math pattern row-sum correctness', () => {
	it('answer equals a+b for bottom row', () => {
		for (let seed = 0; seed < 100; seed += 1) {
			const puzzle = mathPatternGenerator.generate({ seed, difficulty: 2 })
			const a = Number(puzzle.metadata.extra?.a)
			const b = Number(puzzle.metadata.extra?.b)
			expect(puzzle.answer).toBe(a + b)
		}
	})
})
