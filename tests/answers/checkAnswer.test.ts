import {
	checkAnswer,
	normalizeRussianText,
	parseNumericAnswer,
} from '@/src/features/puzzles/validation/checkAnswer'
import type {
	MultipleChoicePuzzle,
	NumericInputPuzzle,
	TextInputPuzzle,
} from '@/src/features/puzzles/types'

const baseMeta = {
	generatorId: 'test',
	generatorVersion: 1,
}

function numericPuzzle(answer: number): NumericInputPuzzle {
	return {
		id: 'n1',
		type: 'test.numeric',
		category: 'math',
		difficulty: 1,
		prompt: 'x',
		interactionType: 'numeric_input',
		answer,
		integerOnly: true,
		hints: [{ level: 1, text: 'h' }],
		explanation: 'e',
		seed: 1,
		metadata: baseMeta,
	}
}

function choicePuzzle(): MultipleChoicePuzzle {
	return {
		id: 'c1',
		type: 'test.choice',
		category: 'logic',
		difficulty: 1,
		prompt: 'x',
		interactionType: 'multiple_choice',
		options: [
			{ id: 'a', label: 'A' },
			{ id: 'b', label: 'B' },
		],
		answer: 'b',
		hints: [{ level: 1, text: 'h' }],
		explanation: 'e',
		seed: 1,
		metadata: baseMeta,
	}
}

function textPuzzle(): TextInputPuzzle {
	return {
		id: 't1',
		type: 'test.text',
		category: 'words',
		difficulty: 1,
		prompt: 'x',
		interactionType: 'text_input',
		answer: 'молоко',
		acceptedAnswers: ['moloko'],
		hints: [{ level: 1, text: 'h' }],
		explanation: 'e',
		seed: 1,
		metadata: baseMeta,
	}
}

describe('answer validation', () => {
	it('parses numeric answers with spaces and leading plus', () => {
		expect(parseNumericAnswer('  +5 ', true)).toBe(5)
		expect(parseNumericAnswer('12', true)).toBe(12)
		expect(parseNumericAnswer('3.5', true)).toBeNull()
		expect(parseNumericAnswer('abc', true)).toBeNull()
		expect(parseNumericAnswer('', true)).toBeNull()
	})

	it('checks numeric puzzle answers', () => {
		const puzzle = numericPuzzle(16)
		expect(checkAnswer(puzzle, '16').isCorrect).toBe(true)
		expect(checkAnswer(puzzle, '+16').isCorrect).toBe(true)
		expect(checkAnswer(puzzle, ' 16 ').isCorrect).toBe(true)
		expect(checkAnswer(puzzle, '15').isCorrect).toBe(false)
		expect(checkAnswer(puzzle, '16.0').isCorrect).toBe(true)
		expect(checkAnswer(puzzle, '16.5').isCorrect).toBe(false)
	})

	it('checks multiple choice by option id', () => {
		const puzzle = choicePuzzle()
		expect(checkAnswer(puzzle, 'b').isCorrect).toBe(true)
		expect(checkAnswer(puzzle, 'a').isCorrect).toBe(false)
	})

	it('normalizes Russian text (trim, case, ё→е)', () => {
		expect(normalizeRussianText('  Ёлка  ')).toBe('елка')
		const puzzle = textPuzzle()
		expect(checkAnswer(puzzle, 'МОЛОКО').isCorrect).toBe(true)
		expect(checkAnswer(puzzle, '  молоко  ').isCorrect).toBe(true)
		expect(checkAnswer(puzzle, 'хлеб').isCorrect).toBe(false)

		const yoPuzzle: TextInputPuzzle = {
			...puzzle,
			id: 't2',
			answer: 'елка',
			acceptedAnswers: [],
		}
		expect(checkAnswer(yoPuzzle, 'Ёлка').isCorrect).toBe(true)
	})
})
