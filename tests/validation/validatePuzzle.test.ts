import { validatePuzzle } from '@/src/features/puzzles/validation/validatePuzzle'
import { CURATED_PUZZLES } from '@/src/features/puzzles/curated/library'
import type { MultipleChoicePuzzle } from '@/src/features/puzzles/types'

describe('validatePuzzle', () => {
	it('accepts all curated puzzles', () => {
		for (const puzzle of CURATED_PUZZLES) {
			const result = validatePuzzle(puzzle)
			expect(result.ok).toBe(true)
		}
	})

	it('rejects duplicate option labels', () => {
		const puzzle: MultipleChoicePuzzle = {
			id: 'bad',
			type: 't',
			category: 'logic',
			difficulty: 1,
			prompt: 'p',
			interactionType: 'multiple_choice',
			options: [
				{ id: 'a', label: 'X' },
				{ id: 'b', label: 'X' },
			],
			answer: 'a',
			hints: [{ level: 1, text: 'h' }],
			explanation: 'e',
			seed: 1,
			metadata: { generatorId: 't', generatorVersion: 1 },
		}
		const result = validatePuzzle(puzzle)
		expect(result.ok).toBe(false)
		if (!result.ok) {
			expect(result.issues.some((i) => i.code === 'DUPLICATE_OPTION_LABEL')).toBe(
				true,
			)
		}
	})

	it('rejects empty explanation', () => {
		const puzzle = { ...CURATED_PUZZLES[0], explanation: '   ' }
		const result = validatePuzzle(puzzle)
		expect(result.ok).toBe(false)
	})
})
