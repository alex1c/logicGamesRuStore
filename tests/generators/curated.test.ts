import { CURATED_PUZZLES } from '@/src/features/puzzles/curated'
import { validatePuzzle } from '@/src/features/puzzles/validation/validatePuzzle'
import { checkAnswer } from '@/src/features/puzzles/validation/checkAnswer'
import { ALL_CATEGORIES } from '@/src/features/puzzles/types'

describe('curated library quality', () => {
	it('has unique stable ids', () => {
		const ids = CURATED_PUZZLES.map((p) => p.id)
		expect(new Set(ids).size).toBe(ids.length)
	})

	it('contains ~35 logic and ~35 words puzzles', () => {
		const logic = CURATED_PUZZLES.filter((p) => p.category === 'logic')
		const words = CURATED_PUZZLES.filter((p) => p.category === 'words')
		expect(logic.length).toBeGreaterThanOrEqual(30)
		expect(logic.length).toBeLessThanOrEqual(45)
		expect(words.length).toBeGreaterThanOrEqual(30)
		expect(words.length).toBeLessThanOrEqual(45)
	})

	it('every puzzle passes validator and answer check', () => {
		for (const puzzle of CURATED_PUZZLES) {
			const result = validatePuzzle(puzzle)
			expect(result.ok).toBe(true)
			expect(puzzle.prompt.trim().length).toBeGreaterThan(0)
			expect(puzzle.explanation.trim().length).toBeGreaterThan(0)
			expect(puzzle.hints.length).toBeGreaterThan(0)
			expect(ALL_CATEGORIES).toContain(puzzle.category)
			expect(puzzle.difficulty).toBeGreaterThanOrEqual(1)
			expect(puzzle.difficulty).toBeLessThanOrEqual(5)
			if (puzzle.interactionType === 'text_input') {
				expect(puzzle.acceptedAnswers?.every((a) => a.trim().length > 0) ?? true).toBe(
					true,
				)
			}
			const submitted =
				typeof puzzle.answer === 'number' ? String(puzzle.answer) : puzzle.answer
			expect(checkAnswer(puzzle, submitted).isCorrect).toBe(true)
		}
	})
})
