/**
 * Domain types for the Puzzle Engine.
 * Prefer discriminated unions over loose optional bags.
 */

/** Puzzle skill categories shown in the product taxonomy. */
export type PuzzleCategory =
	| 'logic'
	| 'math'
	| 'sequence'
	| 'attention'
	| 'odd_one_out'
	| 'words'
	| 'matchsticks'

/** Compact difficulty scale used by adaptive scheduling later. */
export type Difficulty = 1 | 2 | 3 | 4 | 5

/** How the player submits an answer. */
export type InteractionType =
	| 'multiple_choice'
	| 'numeric_input'
	| 'select_item'
	| 'text_input'
	| 'tap_target'
	| 'matchstick_move'

/** Progressive hints; level 1 is milder than level 2. */
export type PuzzleHint = {
	level: 1 | 2
	text: string
}

/** Shared identity fields every puzzle carries. */
export type PuzzleBase = {
	/** Stable unique id for this concrete instance. */
	id: string
	/** Generator or curated library type key. */
	type: string
	category: PuzzleCategory
	difficulty: Difficulty
	prompt: string
	hints: PuzzleHint[]
	/** Always required: short plain-language explanation of the rule. */
	explanation: string
	/** Seed that produced this puzzle (curated may use a fixed seed). */
	seed: number
	/** Opaque metadata for analytics / debugging; keep serializable. */
	metadata: PuzzleMetadata
}

export type PuzzleMetadata = {
	generatorId: string
	generatorVersion: number
	/** Free-form tags such as mechanic name. */
	tags?: string[]
	/** Extra structured data for renderers (must stay JSON-safe). */
	extra?: Record<string, string | number | boolean | null>
}

export type MultipleChoiceOption = {
	id: string
	label: string
}

export type MultipleChoicePuzzle = PuzzleBase & {
	interactionType: 'multiple_choice'
	options: MultipleChoiceOption[]
	/** Option id of the correct choice. */
	answer: string
}

export type NumericInputPuzzle = PuzzleBase & {
	interactionType: 'numeric_input'
	answer: number
	/** When true, only whole numbers are accepted. */
	integerOnly: boolean
	/** Optional soft bounds for the input UI. */
	inputBounds?: { min?: number; max?: number }
}

export type SelectItem = {
	id: string
	label: string
}

export type SelectItemPuzzle = PuzzleBase & {
	interactionType: 'select_item'
	items: SelectItem[]
	answer: string
}

export type TextInputPuzzle = PuzzleBase & {
	interactionType: 'text_input'
	answer: string
	/** Accepted aliases after normalization (optional). */
	acceptedAnswers?: string[]
	caseSensitive?: boolean
}

export type TapTargetCell = {
	id: string
	symbol: string
	/** Optional style hint for near-miss distractors. */
	variant?: 'normal' | 'odd'
}

export type TapTargetPuzzle = PuzzleBase & {
	interactionType: 'tap_target'
	grid: {
		rows: number
		cols: number
		cells: TapTargetCell[]
	}
	answer: string
}

/** Matchstick equation puzzle — answer is `fromId->toId`. */
export type MatchstickPuzzle = PuzzleBase & {
	interactionType: 'matchstick_move'
	/** Initial broken equation state. */
	state: {
		cells: {
			id: string
			kind: 'digit' | 'operator'
			role: 'left' | 'op' | 'right' | 'eq' | 'result'
		}[]
		sticks: {
			id: string
			cellId: string
			segmentKey: string
			active: boolean
		}[]
	}
	answer: string
	/** Alternate encodings of the unique solution move, if any. */
	acceptedMoves?: string[]
}

export type Puzzle =
	| MultipleChoicePuzzle
	| NumericInputPuzzle
	| SelectItemPuzzle
	| TextInputPuzzle
	| TapTargetPuzzle
	| MatchstickPuzzle

/** Human-readable Russian labels for categories. */
export const CATEGORY_LABELS: Record<PuzzleCategory, string> = {
	logic: 'Логика',
	math: 'Математика',
	sequence: 'Последовательности',
	attention: 'Внимание',
	odd_one_out: 'Найди лишнее',
	words: 'Слова',
	matchsticks: 'Спички',
}

export const ALL_CATEGORIES: PuzzleCategory[] = [
	'logic',
	'math',
	'sequence',
	'attention',
	'odd_one_out',
	'words',
	'matchsticks',
]
