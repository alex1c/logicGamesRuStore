import type { Difficulty, Puzzle } from '../puzzles/types'
import {
	attentionSymbolsGenerator,
	generateValidatedPuzzle,
	mathPatternGenerator,
	oddOneOutNumbersGenerator,
	sequenceNumberGenerator,
} from '../puzzles/generators'
import { getCuratedById } from '../puzzles/curated'
import { createRng } from '@/src/utils/prng'

export type WorkoutPlanItem =
	| {
			source: 'generator'
			generatorId: string
			difficulty: Difficulty
			seed: number
	  }
	| {
			source: 'curated'
			curatedId: string
	  }

export type WorkoutSession = {
	id: string
	title: string
	items: WorkoutPlanItem[]
	puzzles: Puzzle[]
	createdAt: number
}

const GENERATOR_MAP = {
	'sequence.number.v1': sequenceNumberGenerator,
	'math.pattern.grid.v1': mathPatternGenerator,
	'odd_one_out.numbers.v1': oddOneOutNumbersGenerator,
	'attention.symbols.v1': attentionSymbolsGenerator,
} as const

/**
 * Build the Phase-1 demo workout: 5 mixed puzzles.
 */
export function createDemoWorkout(baseSeed?: number): WorkoutSession {
	const seedRoot =
		baseSeed ??
		(Date.now() % 1_000_000) + createRng(Date.now() >>> 0).nextInt(1, 999)

	const plan: WorkoutPlanItem[] = [
		{
			source: 'generator',
			generatorId: 'sequence.number.v1',
			difficulty: 2,
			seed: seedRoot + 1,
		},
		{
			source: 'generator',
			generatorId: 'math.pattern.grid.v1',
			difficulty: 2,
			seed: seedRoot + 2,
		},
		{
			source: 'generator',
			generatorId: 'attention.symbols.v1',
			difficulty: 2,
			seed: seedRoot + 3,
		},
		{
			source: 'generator',
			generatorId: 'odd_one_out.numbers.v1',
			difficulty: 2,
			seed: seedRoot + 4,
		},
		{
			source: 'curated',
			curatedId: 'curated.logic.p01',
		},
	]

	const puzzles = plan.map((item) => resolvePlanItem(item))

	return {
		id: `demo-${seedRoot}`,
		title: 'Мини-тренировка',
		items: plan,
		puzzles,
		createdAt: Date.now(),
	}
}

function resolvePlanItem(item: WorkoutPlanItem): Puzzle {
	if (item.source === 'curated') {
		const puzzle = getCuratedById(item.curatedId)
		if (!puzzle) {
			throw new Error(`Curated puzzle not found: ${item.curatedId}`)
		}
		return puzzle
	}

	const generator =
		GENERATOR_MAP[item.generatorId as keyof typeof GENERATOR_MAP]
	if (!generator) {
		throw new Error(`Unknown generator: ${item.generatorId}`)
	}

	return generateValidatedPuzzle({
		generator,
		seed: item.seed,
		difficulty: item.difficulty,
		strict: true,
	})
}

/** Planned mix shown on the Today screen (conceptual daily workout). */
export const DAILY_WORKOUT_CONCEPT = {
	totalPuzzles: 10,
	estimatedMinutes: 7,
	mix: [
		{ categoryLabel: 'Логика', count: 3 },
		{ categoryLabel: 'Счёт', count: 2 },
		{ categoryLabel: 'Последовательности', count: 2 },
		{ categoryLabel: 'Внимание', count: 2 },
		{ categoryLabel: 'Слова', count: 1 },
	],
} as const
