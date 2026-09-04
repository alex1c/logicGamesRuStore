import { CURATED_PUZZLES } from '@/src/features/puzzles/curated/library'
import { checkAnswer } from '@/src/features/puzzles/validation/checkAnswer'

describe('curated library', () => {
	it('has at least 8 puzzles', () => {
		expect(CURATED_PUZZLES.length).toBeGreaterThanOrEqual(8)
	})

	it('has unique stable ids', () => {
		const ids = CURATED_PUZZLES.map((p) => p.id)
		expect(new Set(ids).size).toBe(ids.length)
	})

	it('covers logic, words, odd_one_out', () => {
		const categories = new Set(CURATED_PUZZLES.map((p) => p.category))
		expect(categories.has('logic')).toBe(true)
		expect(categories.has('words')).toBe(true)
		expect(categories.has('odd_one_out')).toBe(true)
	})

	it('has a correct answer that checkAnswer accepts', () => {
		for (const puzzle of CURATED_PUZZLES) {
			const submitted =
				typeof puzzle.answer === 'number'
					? String(puzzle.answer)
					: puzzle.answer
			expect(checkAnswer(puzzle, submitted).isCorrect).toBe(true)
		}
	})
})
