import type { Puzzle } from '../types'
import {
	applyMove,
	evaluateEquation,
} from '../matchsticks/equation'

export type AnswerCheckResult = {
	isCorrect: boolean
	/** Normalized form used for comparison (for debugging / tests). */
	normalizedSubmitted: string
	normalizedExpected: string
}

/**
 * Normalize Russian text for friendly comparison:
 * trim, lowercase, ё→е. No fuzzy matching beyond that.
 */
export function normalizeRussianText(value: string): string {
	return value
		.normalize('NFC')
		.trim()
		.toLocaleLowerCase('ru-RU')
		.replace(/ё/g, 'е')
		.replace(/\s+/g, ' ')
}

/**
 * Parse a numeric answer string safely.
 * Accepts optional leading +, strips spaces. Rejects NaN / Infinity.
 * When integerOnly, rejects floats that are not whole numbers.
 */
export function parseNumericAnswer(
	raw: string,
	integerOnly: boolean,
): number | null {
	const cleaned = raw.replace(/\s+/g, '').replace(/^\+/, '')
	if (cleaned.length === 0) {
		return null
	}
	// Reject scientific notation and trailing junk for predictability.
	if (!/^-?\d+(\.\d+)?$/.test(cleaned)) {
		return null
	}
	const value = Number(cleaned)
	if (!Number.isFinite(value)) {
		return null
	}
	if (integerOnly) {
		if (!Number.isInteger(value)) {
			return null
		}
	}
	return value
}

/**
 * Compare a submitted answer against the puzzle's expected answer.
 */
export function checkAnswer(
	puzzle: Puzzle,
	submitted: string | number,
): AnswerCheckResult {
	const raw =
		typeof submitted === 'number' ? String(submitted) : String(submitted)

	switch (puzzle.interactionType) {
		case 'numeric_input': {
			const parsed = parseNumericAnswer(raw, puzzle.integerOnly)
			const expected = puzzle.answer
			const normalizedSubmitted =
				parsed === null ? normalizeRussianText(raw) : String(parsed)
			const normalizedExpected = String(expected)
			return {
				isCorrect: parsed !== null && parsed === expected,
				normalizedSubmitted,
				normalizedExpected,
			}
		}
		case 'multiple_choice':
		case 'select_item':
		case 'tap_target': {
			const submittedId = raw.trim()
			return {
				isCorrect: submittedId === puzzle.answer,
				normalizedSubmitted: submittedId,
				normalizedExpected: puzzle.answer,
			}
		}
		case 'matchstick_move': {
			const submittedMove = raw.trim()
			const accepted = [
				puzzle.answer,
				...(puzzle.acceptedMoves ?? []),
			]
			let isCorrect = accepted.includes(submittedMove)
			if (!isCorrect && submittedMove.includes('->')) {
				const [fromId, toId] = submittedMove.split('->')
				const next = applyMove(puzzle.state, { fromId, toId })
				const evaled = next ? evaluateEquation(next) : null
				isCorrect = Boolean(evaled?.value)
			}
			return {
				isCorrect,
				normalizedSubmitted: submittedMove,
				normalizedExpected: puzzle.answer,
			}
		}
		case 'text_input': {
			const caseSensitive = puzzle.caseSensitive === true
			const normalize = (value: string) =>
				caseSensitive ? value.trim() : normalizeRussianText(value)
			const submittedNorm = normalize(raw)
			const candidates = [
				puzzle.answer,
				...(puzzle.acceptedAnswers ?? []),
			].map(normalize)
			return {
				isCorrect: candidates.includes(submittedNorm),
				normalizedSubmitted: submittedNorm,
				normalizedExpected: candidates[0] ?? '',
			}
		}
		default: {
			const _exhaustive: never = puzzle
			return {
				isCorrect: false,
				normalizedSubmitted: raw,
				normalizedExpected: String((_exhaustive as Puzzle).answer),
			}
		}
	}
}
