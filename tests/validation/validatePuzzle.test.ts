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

	it.each([
		['empty prompt', { prompt: ' ' }],
		['no hints', { hints: [] }],
		['invalid difficulty', { difficulty: 0 }],
		['NaN seed', { seed: Number.NaN }],
	])('rejects %s', (_label, mutation) => {
		expect(validatePuzzle({ ...CURATED_PUZZLES[0], ...mutation }).ok).toBe(false)
	})

	it('rejects malformed grids without throwing', () => {
		const malformed = {
			...CURATED_PUZZLES[0], interactionType: 'tap_target', grid: undefined,
		}
		expect(() => validatePuzzle(malformed)).not.toThrow()
		expect(validatePuzzle(malformed).ok).toBe(false)
	})

	it('rejects duplicate ids and an answer absent from choices', () => {
		const base = CURATED_PUZZLES[0] as MultipleChoicePuzzle
		const puzzle = { ...base, options: [{ id: 'x', label: 'A' }, { id: 'x', label: 'B' }], answer: 'missing' }
		const result = validatePuzzle(puzzle)
		expect(result.ok).toBe(false)
		if (!result.ok) {
			expect(result.issues.map((issue) => issue.code)).toEqual(
				expect.arrayContaining(['DUPLICATE_OPTION_ID', 'ANSWER_NOT_IN_OPTIONS']),
			)
		}
	})

	it('rejects incompatible generator identity when an implementation is expected', () => {
		const result = validatePuzzle(CURATED_PUZZLES[0], { generatorId: 'unknown', version: 99 })
		expect(result.ok).toBe(false)
		if (!result.ok) expect(result.issues.some((issue) => issue.code === 'GENERATOR_IDENTITY_MISMATCH')).toBe(true)
	})
})
