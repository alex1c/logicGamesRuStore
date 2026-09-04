import type { Difficulty, Puzzle } from '../types'
import type { RandomSource } from '@/src/utils/prng'
import { createRng, combineSeeds } from '@/src/utils/prng'

/**
 * Shared input for every puzzle generator.
 */
export type GeneratePuzzleInput = {
	seed: number
	difficulty: Difficulty
}

/**
 * Stable identity for a generator algorithm.
 * Changing `version` means old seeds must not silently map to new content.
 */
export type GeneratorIdentity = {
	generatorId: string
	version: number
}

export type PuzzleGenerator = GeneratorIdentity & {
	/** Human-readable name for docs / debugging. */
	displayName: string
	/**
	 * Produce a puzzle for the given seed + difficulty.
	 * Must be pure given the same seed/difficulty (deterministic).
	 */
	generate: (input: GeneratePuzzleInput) => Puzzle
}

/**
 * Create an RNG scoped to a generator identity so different generators
 * with the same numeric seed do not collide on the same stream.
 */
export function createGeneratorRng(
	identity: GeneratorIdentity,
	seed: number,
	difficulty: Difficulty,
): RandomSource {
	const combined = combineSeeds(
		identity.generatorId,
		identity.version,
		seed,
		difficulty,
	)
	return createRng(combined)
}

/**
 * Build a stable puzzle id from generator identity + seed + difficulty.
 */
export function buildPuzzleId(
	identity: GeneratorIdentity,
	seed: number,
	difficulty: Difficulty,
): string {
	return `${identity.generatorId}.v${identity.version}.d${difficulty}.s${seed}`
}

/**
 * Registry of generators available to the workout builder.
 */
const registry = new Map<string, PuzzleGenerator>()

export function registerGenerator(generator: PuzzleGenerator): void {
	const key = `${generator.generatorId}@${generator.version}`
	registry.set(key, generator)
	registry.set(generator.generatorId, generator)
}

export function getGenerator(generatorId: string): PuzzleGenerator | undefined {
	return registry.get(generatorId)
}

export function listGenerators(): PuzzleGenerator[] {
	const seen = new Set<string>()
	const result: PuzzleGenerator[] = []
	for (const generator of registry.values()) {
		const key = `${generator.generatorId}@${generator.version}`
		if (seen.has(key)) {
			continue
		}
		seen.add(key)
		result.push(generator)
	}
	return result
}
