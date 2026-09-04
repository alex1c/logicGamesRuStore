import {
	ALL_GENERATORS,
	generatePuzzleByIdentity,
} from '@/src/features/puzzles/generators'
import { validatePuzzle } from '@/src/features/puzzles/validation/validatePuzzle'
import type { Difficulty, Puzzle } from '@/src/features/puzzles/types'

const DIFFICULTIES: Difficulty[] = [1, 2, 3, 4, 5]
const SEEDS_PER_GENERATOR = 10_000

function numbers(puzzle: Puzzle): number[] {
	if (puzzle.interactionType !== 'select_item') throw new Error('expected items')
	return puzzle.items.map((item) => Number(item.label))
}

function isPrime(value: number): boolean {
	if (value < 2) return false
	for (let divisor = 2; divisor * divisor <= value; divisor += 1) {
		if (value % divisor === 0) return false
	}
	return true
}

describe('Codex independent generator audit', () => {
	jest.setTimeout(120_000)

	for (const generator of ALL_GENERATORS) {
		it(`${generator.generatorId}: 10,000 seeds across every difficulty`, () => {
			for (let seed = 0; seed < SEEDS_PER_GENERATOR; seed += 1) {
				for (const difficulty of DIFFICULTIES) {
					const puzzle = generator.generate({ seed, difficulty })
					expect(generator.generate({ seed, difficulty })).toEqual(puzzle)
					expect(validatePuzzle(puzzle).ok).toBe(true)
					expect(puzzle.metadata.generatorId).toBe(generator.generatorId)
					expect(puzzle.metadata.generatorVersion).toBe(generator.version)

					if (puzzle.type === 'sequence.number.v1') {
						if (puzzle.interactionType !== 'numeric_input') throw new Error('type')
						const shown = String(puzzle.metadata.extra?.shown).split(',').map(Number)
						const diffs = shown.slice(1).map((n, i) => n - shown[i])
						const mechanic = puzzle.metadata.extra?.mechanic
						let expected: number
						if (mechanic === 'arithmetic') expected = shown.at(-1)! + diffs[0]
						else if (mechanic === 'geometric') expected = shown.at(-1)! * (shown[1] / shown[0])
						else if (mechanic === 'two_step') expected = shown.at(-1)! + diffs[0]
						else expected = shown.at(-1)! + diffs.at(-1)! + 1
						expect(puzzle.answer).toBe(expected)
					}

					if (puzzle.type === 'math.pattern.grid.v1') {
						if (puzzle.interactionType !== 'numeric_input') throw new Error('type')
						expect(puzzle.answer).toBe(
							Number(puzzle.metadata.extra?.a) + Number(puzzle.metadata.extra?.b),
						)
					}

					if (puzzle.type === 'odd_one_out.numbers.v1') {
						if (puzzle.interactionType !== 'select_item') throw new Error('type')
						const values = numbers(puzzle)
						const mechanic = String(puzzle.metadata.extra?.mechanic)
						let majority: (n: number) => boolean
						if (mechanic === 'parity_even') majority = (n) => n % 2 === 0
						else if (mechanic === 'parity_odd') majority = (n) => n % 2 !== 0
						else if (mechanic.startsWith('divisible_by_')) {
							const divisor = Number(mechanic.split('_').at(-1))
							majority = (n) => n % divisor === 0
						} else if (mechanic === 'perfect_square') majority = (n) => Number.isInteger(Math.sqrt(n))
						else majority = isPrime
						expect(values.filter(majority)).toHaveLength(3)
						const oddIndex = values.findIndex((n) => !majority(n))
						expect(puzzle.answer).toBe(puzzle.items[oddIndex].id)
					}

					if (puzzle.type === 'attention.symbols.v1') {
						if (puzzle.interactionType !== 'tap_target') throw new Error('type')
						const answer = puzzle.grid.cells.find((cell) => cell.id === puzzle.answer)!
						expect(puzzle.grid.cells.filter((cell) => cell.symbol === answer.symbol)).toHaveLength(1)
						expect(puzzle.grid.cells.filter((cell) => cell.variant === 'odd')).toHaveLength(1)
					}
				}
			}
		})
	}

	it('reproduces an exact registered historical version and rejects missing versions', () => {
		const reference = ALL_GENERATORS[0].generate({ seed: 12345, difficulty: 3 })
		expect(generatePuzzleByIdentity({
			generatorId: reference.metadata.generatorId,
			version: reference.metadata.generatorVersion,
			seed: reference.seed,
			difficulty: reference.difficulty,
		})).toEqual(reference)
		expect(() => generatePuzzleByIdentity({
			generatorId: reference.metadata.generatorId,
			version: 2,
			seed: reference.seed,
			difficulty: reference.difficulty,
		})).toThrow('Unknown generator version')
	})
})
