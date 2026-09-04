import { sequenceNumberGenerator } from './sequenceNumber'
import { mathPatternGenerator } from './mathPattern'
import { oddOneOutNumbersGenerator } from './oddOneOutNumbers'
import { attentionSymbolsGenerator } from './attentionSymbols'
import { registerGenerator, type PuzzleGenerator } from '../engine/generator'
import type { Difficulty, Puzzle } from '../types'
import { assertValidPuzzle, validatePuzzle } from '../validation/validatePuzzle'

/** All shipped generators for this phase. */
export const ALL_GENERATORS: PuzzleGenerator[] = [
	sequenceNumberGenerator,
	mathPatternGenerator,
	oddOneOutNumbersGenerator,
	attentionSymbolsGenerator,
]

let registered = false

/**
 * Register built-in generators once (idempotent).
 */
export function ensureGeneratorsRegistered(): void {
	if (registered) {
		return
	}
	for (const generator of ALL_GENERATORS) {
		registerGenerator(generator)
	}
	registered = true
}

export type SafeGenerateOptions = {
	seed: number
	difficulty: Difficulty
	generator: PuzzleGenerator
	/** How many alternate seeds to try if validation fails. */
	maxAttempts?: number
	/** When true, throw with diagnostics instead of skipping. */
	strict?: boolean
}

/**
 * Generate a puzzle and validate it.
 * On failure: in strict/dev mode throw; otherwise try nearby seeds.
 */
export function generateValidatedPuzzle(
	options: SafeGenerateOptions,
): Puzzle {
	ensureGeneratorsRegistered()
	const maxAttempts = options.maxAttempts ?? 5
	const strict =
		options.strict ??
		(typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production')

	let lastIssues = ''
	for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
		const seed = options.seed + attempt
		const puzzle = options.generator.generate({
			seed,
			difficulty: options.difficulty,
		})
		const result = validatePuzzle(puzzle)
		if (result.ok) {
			return result.puzzle
		}
		lastIssues = result.issues
			.map((i) => `${i.code}: ${i.message}`)
			.join('; ')
		if (strict && attempt === 0) {
			assertValidPuzzle(puzzle, options.generator.generatorId)
		}
	}

	throw new Error(
		`Failed to generate valid puzzle for ${options.generator.generatorId} ` +
			`seed=${options.seed}: ${lastIssues}`,
	)
}

export {
	sequenceNumberGenerator,
	mathPatternGenerator,
	oddOneOutNumbersGenerator,
	attentionSymbolsGenerator,
}
