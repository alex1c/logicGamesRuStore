import { sequenceNumberGenerator } from './sequenceNumber'
import { mathPatternGenerator } from './mathPattern'
import { oddOneOutNumbersGenerator } from './oddOneOutNumbers'
import { attentionSymbolsGenerator } from './attentionSymbols'
import { sequenceNumberGeneratorV2 } from './sequenceNumberV2'
import { mathPatternGeneratorV2 } from './mathPatternV2'
import { oddOneOutNumbersGeneratorV2 } from './oddOneOutNumbersV2'
import { attentionSymbolsGeneratorV2 } from './attentionSymbolsV2'
import { matchsticksEquationGenerator } from './matchsticksEquation'
import { registerGenerator, type PuzzleGenerator } from '../engine/generator'
import type { Difficulty, Puzzle } from '../types'
import { assertValidPuzzle, validatePuzzle } from '../validation/validatePuzzle'

export const ALL_GENERATORS: PuzzleGenerator[] = [
	sequenceNumberGenerator,
	mathPatternGenerator,
	oddOneOutNumbersGenerator,
	attentionSymbolsGenerator,
	sequenceNumberGeneratorV2,
	mathPatternGeneratorV2,
	oddOneOutNumbersGeneratorV2,
	attentionSymbolsGeneratorV2,
	matchsticksEquationGenerator,
]

export const PHASE2_GENERATORS: PuzzleGenerator[] = [
	sequenceNumberGeneratorV2,
	mathPatternGeneratorV2,
	oddOneOutNumbersGeneratorV2,
	attentionSymbolsGeneratorV2,
]

/** Phase 3 matchstick generators (oracle-audited separately). */
export const MATCHSTICK_GENERATORS: PuzzleGenerator[] = [
	matchsticksEquationGenerator,
]

let registered = false

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
	maxAttempts?: number
	strict?: boolean
}

export function generateValidatedPuzzle(
	options: SafeGenerateOptions,
): Puzzle {
	ensureGeneratorsRegistered()
	const maxAttempts = options.maxAttempts ?? 5
	const strict =
		options.strict ??
		(typeof __DEV__ !== 'undefined'
			? __DEV__
			: process.env.NODE_ENV !== 'production')

	let lastIssues = ''
	for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
		const seed = options.seed + attempt
		const puzzle = options.generator.generate({
			seed,
			difficulty: options.difficulty,
		})
		const result = validatePuzzle(puzzle, {
			generatorId: options.generator.generatorId,
			version: options.generator.version,
		})
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
	sequenceNumberGeneratorV2,
	mathPatternGeneratorV2,
	oddOneOutNumbersGeneratorV2,
	attentionSymbolsGeneratorV2,
	matchsticksEquationGenerator,
}

ensureGeneratorsRegistered()

export { getGenerator, generatePuzzleByIdentity } from '../engine/generator'
