import type {
	MultipleChoicePuzzle,
	NumericInputPuzzle,
	Puzzle,
	SelectItemPuzzle,
	TapTargetPuzzle,
	TextInputPuzzle,
} from '../types'

export type ValidationIssue = {
	code: string
	message: string
	path?: string
}

export type ValidationResult =
	| { ok: true; puzzle: Puzzle }
	| { ok: false; issues: ValidationIssue[] }

function isFiniteNumber(value: unknown): value is number {
	return typeof value === 'number' && Number.isFinite(value)
}

function requireNonEmptyString(
	value: unknown,
	path: string,
	issues: ValidationIssue[],
): void {
	if (typeof value !== 'string' || value.trim().length === 0) {
		issues.push({
			code: 'EMPTY_STRING',
			message: `${path} must be a non-empty string`,
			path,
		})
	}
}

function validateBase(puzzle: Puzzle, issues: ValidationIssue[]): void {
	requireNonEmptyString(puzzle.id, 'id', issues)
	requireNonEmptyString(puzzle.type, 'type', issues)
	requireNonEmptyString(puzzle.prompt, 'prompt', issues)
	requireNonEmptyString(puzzle.explanation, 'explanation', issues)

	if (![1, 2, 3, 4, 5].includes(puzzle.difficulty)) {
		issues.push({
			code: 'INVALID_DIFFICULTY',
			message: 'difficulty must be 1–5',
			path: 'difficulty',
		})
	}

	if (!isFiniteNumber(puzzle.seed)) {
		issues.push({
			code: 'INVALID_SEED',
			message: 'seed must be a finite number',
			path: 'seed',
		})
	}

	if (!puzzle.metadata?.generatorId) {
		issues.push({
			code: 'MISSING_GENERATOR_ID',
			message: 'metadata.generatorId is required',
			path: 'metadata.generatorId',
		})
	}

	if (
		typeof puzzle.metadata?.generatorVersion !== 'number' ||
		!Number.isInteger(puzzle.metadata.generatorVersion) ||
		puzzle.metadata.generatorVersion < 1
	) {
		issues.push({
			code: 'INVALID_GENERATOR_VERSION',
			message: 'metadata.generatorVersion must be an integer >= 1',
			path: 'metadata.generatorVersion',
		})
	}

	if (!Array.isArray(puzzle.hints) || puzzle.hints.length === 0) {
		issues.push({
			code: 'MISSING_HINTS',
			message: 'at least one hint is required',
			path: 'hints',
		})
	} else {
		for (const [index, hint] of puzzle.hints.entries()) {
			if (hint.level !== 1 && hint.level !== 2) {
				issues.push({
					code: 'INVALID_HINT_LEVEL',
					message: `hints[${index}].level must be 1 or 2`,
					path: `hints[${index}].level`,
				})
			}
			requireNonEmptyString(hint.text, `hints[${index}].text`, issues)
		}
	}
}

function validateMultipleChoice(
	puzzle: MultipleChoicePuzzle,
	issues: ValidationIssue[],
): void {
	if (!Array.isArray(puzzle.options) || puzzle.options.length < 2) {
		issues.push({
			code: 'OPTIONS_TOO_FEW',
			message: 'multiple_choice needs at least 2 options',
			path: 'options',
		})
		return
	}

	const labels = new Set<string>()
	const ids = new Set<string>()
	for (const [index, option] of puzzle.options.entries()) {
		requireNonEmptyString(option.id, `options[${index}].id`, issues)
		requireNonEmptyString(option.label, `options[${index}].label`, issues)
		if (ids.has(option.id)) {
			issues.push({
				code: 'DUPLICATE_OPTION_ID',
				message: `duplicate option id: ${option.id}`,
				path: `options[${index}].id`,
			})
		}
		ids.add(option.id)
		const normalized = option.label.trim()
		if (labels.has(normalized)) {
			issues.push({
				code: 'DUPLICATE_OPTION_LABEL',
				message: `duplicate option label: ${option.label}`,
				path: `options[${index}].label`,
			})
		}
		labels.add(normalized)
	}

	requireNonEmptyString(puzzle.answer, 'answer', issues)
	const matches = puzzle.options.filter((o) => o.id === puzzle.answer)
	if (matches.length !== 1) {
		issues.push({
			code: 'ANSWER_NOT_IN_OPTIONS',
			message: 'answer must match exactly one option id',
			path: 'answer',
		})
	}
}

function validateNumeric(
	puzzle: NumericInputPuzzle,
	issues: ValidationIssue[],
): void {
	if (!isFiniteNumber(puzzle.answer)) {
		issues.push({
			code: 'INVALID_ANSWER',
			message: 'numeric answer must be finite',
			path: 'answer',
		})
	}
	if (puzzle.integerOnly && !Number.isInteger(puzzle.answer)) {
		issues.push({
			code: 'NON_INTEGER_ANSWER',
			message: 'integerOnly puzzle has non-integer answer',
			path: 'answer',
		})
	}
}

function validateSelectItem(
	puzzle: SelectItemPuzzle,
	issues: ValidationIssue[],
): void {
	if (!Array.isArray(puzzle.items) || puzzle.items.length < 2) {
		issues.push({
			code: 'ITEMS_TOO_FEW',
			message: 'select_item needs at least 2 items',
			path: 'items',
		})
		return
	}
	const ids = new Set<string>()
	const labels = new Set<string>()
	for (const [index, item] of puzzle.items.entries()) {
		requireNonEmptyString(item.id, `items[${index}].id`, issues)
		requireNonEmptyString(item.label, `items[${index}].label`, issues)
		if (ids.has(item.id)) {
			issues.push({
				code: 'DUPLICATE_ITEM_ID',
				message: `duplicate item id: ${item.id}`,
				path: `items[${index}].id`,
			})
		}
		ids.add(item.id)
		const normalized = item.label.trim()
		if (labels.has(normalized)) {
			issues.push({
				code: 'DUPLICATE_ITEM_LABEL',
				message: `duplicate item label: ${item.label}`,
				path: `items[${index}].label`,
			})
		}
		labels.add(normalized)
	}
	if (!ids.has(puzzle.answer)) {
		issues.push({
			code: 'ANSWER_NOT_IN_ITEMS',
			message: 'answer must match an item id',
			path: 'answer',
		})
	}
}

function validateText(
	puzzle: TextInputPuzzle,
	issues: ValidationIssue[],
): void {
	requireNonEmptyString(puzzle.answer, 'answer', issues)
}

function validateTapTarget(
	puzzle: TapTargetPuzzle,
	issues: ValidationIssue[],
): void {
	const { rows, cols, cells } = puzzle.grid
	if (!Number.isInteger(rows) || rows < 2) {
		issues.push({
			code: 'INVALID_GRID_ROWS',
			message: 'grid.rows must be an integer >= 2',
			path: 'grid.rows',
		})
	}
	if (!Number.isInteger(cols) || cols < 2) {
		issues.push({
			code: 'INVALID_GRID_COLS',
			message: 'grid.cols must be an integer >= 2',
			path: 'grid.cols',
		})
	}
	const expected = rows * cols
	if (!Array.isArray(cells) || cells.length !== expected) {
		issues.push({
			code: 'GRID_CELL_COUNT',
			message: `grid.cells length must equal rows*cols (${expected})`,
			path: 'grid.cells',
		})
		return
	}
	const ids = new Set<string>()
	for (const [index, cell] of cells.entries()) {
		requireNonEmptyString(cell.id, `grid.cells[${index}].id`, issues)
		requireNonEmptyString(cell.symbol, `grid.cells[${index}].symbol`, issues)
		if (ids.has(cell.id)) {
			issues.push({
				code: 'DUPLICATE_CELL_ID',
				message: `duplicate cell id: ${cell.id}`,
				path: `grid.cells[${index}].id`,
			})
		}
		ids.add(cell.id)
	}
	if (!ids.has(puzzle.answer)) {
		issues.push({
			code: 'ANSWER_NOT_IN_GRID',
			message: 'answer must match a cell id',
			path: 'answer',
		})
	}
}

/**
 * Validate a puzzle before it reaches the UI.
 * Returns structured issues — never throws for content problems.
 */
export function validatePuzzle(puzzle: Puzzle): ValidationResult {
	const issues: ValidationIssue[] = []
	validateBase(puzzle, issues)

	switch (puzzle.interactionType) {
		case 'multiple_choice':
			validateMultipleChoice(puzzle, issues)
			break
		case 'numeric_input':
			validateNumeric(puzzle, issues)
			break
		case 'select_item':
			validateSelectItem(puzzle, issues)
			break
		case 'text_input':
			validateText(puzzle, issues)
			break
		case 'tap_target':
			validateTapTarget(puzzle, issues)
			break
		default: {
			const _exhaustive: never = puzzle
			issues.push({
				code: 'UNKNOWN_INTERACTION',
				message: `unknown interactionType: ${(_exhaustive as Puzzle).interactionType}`,
			})
		}
	}

	if (issues.length > 0) {
		return { ok: false, issues }
	}
	return { ok: true, puzzle }
}

/**
 * Throw a detailed Error in development when a generated puzzle is invalid.
 */
export function assertValidPuzzle(puzzle: Puzzle, context?: string): Puzzle {
	const result = validatePuzzle(puzzle)
	if (result.ok) {
		return result.puzzle
	}
	const details = result.issues
		.map((issue) => `${issue.code}: ${issue.message}`)
		.join('; ')
	const prefix = context ? `[${context}] ` : ''
	throw new Error(`${prefix}Invalid puzzle: ${details}`)
}
