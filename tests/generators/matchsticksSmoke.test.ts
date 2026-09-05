import { matchsticksEquationGenerator } from '@/src/features/puzzles/generators/matchsticksEquation'
import {
	buildEquationState,
	countValidSolutions,
	describeMove,
} from '@/src/features/puzzles/matchsticks/equation'
import { validatePuzzle } from '@/src/features/puzzles/validation/validatePuzzle'
import { checkAnswer } from '@/src/features/puzzles/validation/checkAnswer'
import type { Difficulty, MatchstickPuzzle } from '@/src/features/puzzles/types'

describe('matchsticks generator smoke', () => {
	it('describes exact source and destination segments in grammatical Russian', () => {
		const state = buildEquationState({ left: 5, op: 'minus', right: 3, result: 8 })
		expect(describeMove(state, { fromId: 'RES:b', toId: 'L:b' })).toBe(
			'Перенесите верхнюю правую спичку из результата на место верхней правой спички в левой цифре.',
		)
	})

	it('produces unique solvable puzzles for 200 seeds', () => {
		const difficulties: Difficulty[] = [1, 2, 3, 4, 5]
		for (let seed = 0; seed < 200; seed += 1) {
			const difficulty = difficulties[seed % difficulties.length]
			const puzzle = matchsticksEquationGenerator.generate({
				seed,
				difficulty,
			}) as MatchstickPuzzle
			const validated = validatePuzzle(puzzle, {
				generatorId: matchsticksEquationGenerator.generatorId,
				version: matchsticksEquationGenerator.version,
			})
			expect(validated.ok).toBe(true)
			const oracle = countValidSolutions(puzzle.state)
			expect(oracle.count).toBe(1)
			expect(checkAnswer(puzzle, puzzle.answer).isCorrect).toBe(true)
			const again = matchsticksEquationGenerator.generate({
				seed,
				difficulty,
			})
			expect(again).toEqual(puzzle)
		}
	})
})
