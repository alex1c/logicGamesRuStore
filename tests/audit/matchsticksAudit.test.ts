import { matchsticksEquationGenerator } from '@/src/features/puzzles/generators/matchsticksEquation'
import {
	applyMove,
	countValidSolutions,
	evaluateEquation,
	listLegalMoves,
} from '@/src/features/puzzles/matchsticks/equation'
import { validatePuzzle } from '@/src/features/puzzles/validation/validatePuzzle'
import { checkAnswer } from '@/src/features/puzzles/validation/checkAnswer'
import type { Difficulty, MatchstickPuzzle } from '@/src/features/puzzles/types'

const SEEDS = 10_000
const DIFFICULTIES: Difficulty[] = [1, 2, 3, 4, 5]

/**
 * Independent oracle: enumerate every legal single-stick move and count
 * how many yield a true equation — must equal 1 for every generated puzzle.
 */
describe('matchsticks oracle audit', () => {
	jest.setTimeout(180_000)

	it(`unique solvable puzzles for ${SEEDS} seeds at every difficulty`, () => {
		let generated = 0
		let invalid = 0
		let ambiguous = 0
		let determinismFails = 0
		let oracleFails = 0

		for (const difficulty of DIFFICULTIES) {
			for (let seed = 0; seed < SEEDS; seed += 1) {
			const puzzle = matchsticksEquationGenerator.generate({
				seed,
				difficulty,
			}) as MatchstickPuzzle
			generated += 1

			const again = matchsticksEquationGenerator.generate({
				seed,
				difficulty,
			})
			if (JSON.stringify(again) !== JSON.stringify(puzzle)) {
				determinismFails += 1
			}

			const validated = validatePuzzle(puzzle, {
				generatorId: matchsticksEquationGenerator.generatorId,
				version: matchsticksEquationGenerator.version,
			})
			if (!validated.ok) {
				invalid += 1
				continue
			}

			const oracle = countValidSolutions(puzzle.state)
			if (oracle.count !== 1) {
				ambiguous += 1
			}

			// Independent recount without trusting generator metadata.
			let independent = 0
			for (const move of listLegalMoves(puzzle.state)) {
				const next = applyMove(puzzle.state, move)
				if (!next) {
					continue
				}
				const evaled = evaluateEquation(next)
				if (evaled?.value) {
					independent += 1
				}
			}
			if (independent !== 1 || independent !== oracle.count) {
				oracleFails += 1
			}

			if (!checkAnswer(puzzle, puzzle.answer).isCorrect) {
				oracleFails += 1
			}
			}
		}

		expect({
			generated,
			invalid,
			ambiguous,
			determinismFails,
			oracleFails,
		}).toEqual({
			generated: SEEDS * DIFFICULTIES.length,
			invalid: 0,
			ambiguous: 0,
			determinismFails: 0,
			oracleFails: 0,
		})
	})
})
