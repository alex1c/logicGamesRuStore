import { PHASE2_GENERATORS } from '@/src/features/puzzles/generators'
import { hasConflictingSimpleOutlier } from '@/src/features/puzzles/generators/oddOneOutNumbersV2'
import { validatePuzzle } from '@/src/features/puzzles/validation/validatePuzzle'
import type { Difficulty } from '@/src/features/puzzles/types'

const SEEDS = 400
const DIFFICULTIES: Difficulty[] = [1, 2, 3, 4, 5]

describe('phase2 generators stress', () => {
	it('rejects a secondary parity answer in a divisibility puzzle', () => {
		expect(hasConflictingSimpleOutlier([21, 37, 27, 30], 1)).toBe(true)
	})

	for (const generator of PHASE2_GENERATORS) {
		it(`${generator.generatorId} validates across ${SEEDS} seeds`, () => {
			for (let seed = 0; seed < SEEDS; seed += 1) {
				const difficulty = DIFFICULTIES[seed % DIFFICULTIES.length]
				const puzzle = generator.generate({ seed, difficulty })
				const result = validatePuzzle(puzzle, {
					generatorId: generator.generatorId,
					version: generator.version,
				})
				if (!result.ok) {
					throw new Error(
						`${generator.generatorId} seed=${seed}: ${result.issues
							.map((i) => i.message)
							.join('; ')}`,
					)
				}
				expect(puzzle.difficulty).toBe(difficulty)
				expect(puzzle.seed).toBe(seed)
			}
		})

		it(`${generator.generatorId} is deterministic`, () => {
			const a = generator.generate({ seed: 99, difficulty: 3 })
			const b = generator.generate({ seed: 99, difficulty: 3 })
			expect(a).toEqual(b)
		})
	}
})
