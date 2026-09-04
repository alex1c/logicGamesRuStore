import type { Difficulty, Puzzle, PuzzleCategory } from '@/src/features/puzzles/types'
import { CATEGORY_LABELS } from '@/src/features/puzzles/types'
import {
	generatePuzzleByIdentity,
	ensureGeneratorsRegistered,
} from '@/src/features/puzzles/generators'
import { getCuratedById, pickCuratedAvoidingRecent } from '@/src/features/puzzles/curated'
import {
	getCategorySkill,
	skillToDifficulty,
	type SkillMap,
} from '@/src/features/progress/skillModel'
import { createDailyRng } from '@/src/features/workout/dailySeed'
import { combineSeeds, createRng } from '@/src/utils/prng'
import type { PuzzlePlanPersisted } from '@/src/storage'
import type { LocalDateString } from '@/src/utils/localDate'
import type { RandomSource } from '@/src/utils/prng'

/** Categories that ship playable content in Phase 2. */
export const PLAYABLE_CATEGORIES: PuzzleCategory[] = [
	'logic',
	'math',
	'sequence',
	'attention',
	'odd_one_out',
	'words',
]

export const DAILY_SIZE = 10
export const PRACTICE_SIZE = 10

export type WorkoutBuildResult = {
	sessionId: string
	title: string
	plan: PuzzlePlanPersisted[]
	puzzles: Puzzle[]
	mix: { category: PuzzleCategory; label: string; count: number }[]
}

const GENERATOR_FOR_CATEGORY: Partial<
	Record<PuzzleCategory, { generatorId: string; version: number }>
> = {
	math: { generatorId: 'math.pattern.grid.v2', version: 2 },
	sequence: { generatorId: 'sequence.number.v2', version: 2 },
	attention: { generatorId: 'attention.symbols.v2', version: 2 },
	odd_one_out: { generatorId: 'odd_one_out.numbers.v2', version: 2 },
}

const CURATED_CATEGORIES: PuzzleCategory[] = ['logic', 'words']

/**
 * Build a diverse 10-puzzle category mix from a seeded RNG.
 * Keeps counts nearly even (max − min ≤ 1).
 */
export function buildCategoryMix(rng: RandomSource, size = DAILY_SIZE): PuzzleCategory[] {
	const base = [...PLAYABLE_CATEGORIES]
	const list: PuzzleCategory[] = [...rng.shuffle(base)]
	while (list.length < size) {
		const counts = new Map<PuzzleCategory, number>()
		for (const category of base) {
			counts.set(category, 0)
		}
		for (const category of list) {
			counts.set(category, (counts.get(category) ?? 0) + 1)
		}
		const min = Math.min(...counts.values())
		const candidates = base.filter((category) => counts.get(category) === min)
		list.push(rng.pick(candidates))
	}
	return rng.shuffle(list)
}

function summarizeMix(categories: PuzzleCategory[]) {
	const order = PLAYABLE_CATEGORIES
	return order
		.map((category) => ({
			category,
			label: CATEGORY_LABELS[category],
			count: categories.filter((c) => c === category).length,
		}))
		.filter((row) => row.count > 0)
}

function resolvePuzzle(
	category: PuzzleCategory,
	difficulty: Difficulty,
	seed: number,
	rng: RandomSource,
	recentIds: string[],
	usedIds: Set<string>,
): { plan: PuzzlePlanPersisted; puzzle: Puzzle } {
	ensureGeneratorsRegistered()

	if (CURATED_CATEGORIES.includes(category)) {
		const curated = pickCuratedAvoidingRecent({
			category,
			difficulty,
			recentIds,
			usedIds,
			rng,
		})
		if (curated) {
			usedIds.add(curated.id)
			return {
				plan: {
					source: 'curated',
					curatedId: curated.id,
					category: curated.category,
					difficulty: curated.difficulty,
				},
				puzzle: curated,
			}
		}
	}

	const gen = GENERATOR_FOR_CATEGORY[category]
	if (!gen) {
		// Fallback: odd_one_out generator for unexpected gaps.
		const fallback = GENERATOR_FOR_CATEGORY.odd_one_out!
		const puzzle = generatePuzzleByIdentity({
			generatorId: fallback.generatorId,
			version: fallback.version,
			seed,
			difficulty,
		})
		usedIds.add(puzzle.id)
		return {
			plan: {
				source: 'generator',
				generatorId: fallback.generatorId,
				generatorVersion: fallback.version,
				difficulty,
				seed,
				category: puzzle.category,
			},
			puzzle,
		}
	}

	// Deterministic retry if somehow colliding with recent ids.
	for (let attempt = 0; attempt < 8; attempt += 1) {
		const puzzle = generatePuzzleByIdentity({
			generatorId: gen.generatorId,
			version: gen.version,
			seed: seed + attempt * 9973,
			difficulty,
		})
		if (!usedIds.has(puzzle.id) && !recentIds.includes(puzzle.id)) {
			usedIds.add(puzzle.id)
			return {
				plan: {
					source: 'generator',
					generatorId: gen.generatorId,
					generatorVersion: gen.version,
					difficulty,
					seed: seed + attempt * 9973,
					category,
				},
				puzzle,
			}
		}
		if (attempt === 7) {
			usedIds.add(puzzle.id)
			return {
				plan: {
					source: 'generator',
					generatorId: gen.generatorId,
					generatorVersion: gen.version,
					difficulty,
					seed: seed + attempt * 9973,
					category,
				},
				puzzle,
			}
		}
	}

	throw new Error('unreachable')
}

export function createDailyWorkout(input: {
	workoutDate: LocalDateString
	profileSeed: number
	skills: SkillMap
	recentIds?: string[]
}): WorkoutBuildResult {
	const rng = createDailyRng(input.workoutDate, input.profileSeed)
	const categories = buildCategoryMix(rng, DAILY_SIZE)
	const recentIds = input.recentIds ?? []
	const usedIds = new Set<string>()
	const plan: PuzzlePlanPersisted[] = []
	const puzzles: Puzzle[] = []

	categories.forEach((category, index) => {
		const skill = getCategorySkill(input.skills, category)
		const difficulty = skillToDifficulty(skill, rng.nextInt(0, 1_000_000))
		const seed = rng.nextInt(1, 1_000_000_000)
		const resolved = resolvePuzzle(
			category,
			difficulty,
			seed,
			rng,
			recentIds,
			usedIds,
		)
		plan.push(resolved.plan)
		puzzles.push(resolved.puzzle)
		void index
	})

	return {
		sessionId: `daily:${input.workoutDate}:${input.profileSeed}`,
		title: 'Сегодняшняя тренировка',
		plan,
		puzzles,
		mix: summarizeMix(categories),
	}
}

export function createPracticeWorkout(input: {
	category: PuzzleCategory
	profileSeed: number
	skills: SkillMap
	recentIds?: string[]
	baseSeed?: number
}): WorkoutBuildResult {
	ensureGeneratorsRegistered()
	const seedRoot =
		input.baseSeed ??
		(Date.now() % 1_000_000) + (input.profileSeed % 997)
	const rng = createRng(
		combineSeeds('practice.v1', input.category, input.profileSeed, seedRoot),
	)
	const recentIds = input.recentIds ?? []
	const usedIds = new Set<string>()
	const plan: PuzzlePlanPersisted[] = []
	const puzzles: Puzzle[] = []
	const categories = Array.from({ length: PRACTICE_SIZE }, () => input.category)

	categories.forEach((category) => {
		const skill = getCategorySkill(input.skills, category)
		const difficulty = skillToDifficulty(skill, rng.nextInt(0, 1_000_000))
		const seed = rng.nextInt(1, 1_000_000_000)
		const resolved = resolvePuzzle(
			category,
			difficulty,
			seed,
			rng,
			recentIds,
			usedIds,
		)
		plan.push(resolved.plan)
		puzzles.push(resolved.puzzle)
	})

	return {
		sessionId: `practice:${input.category}:${seedRoot}`,
		title: CATEGORY_LABELS[input.category],
		plan,
		puzzles,
		mix: summarizeMix(categories),
	}
}

export function materializePlan(plan: PuzzlePlanPersisted[]): Puzzle[] {
	ensureGeneratorsRegistered()
	return plan.map((item) => {
		if (item.source === 'curated') {
			const puzzle = getCuratedById(item.curatedId)
			if (!puzzle) {
				throw new Error(`Missing curated puzzle: ${item.curatedId}`)
			}
			return puzzle
		}
		return generatePuzzleByIdentity({
			generatorId: item.generatorId,
			version: item.generatorVersion,
			seed: item.seed,
			difficulty: item.difficulty,
		})
	})
}

export const DAILY_ESTIMATED_MINUTES = 7
