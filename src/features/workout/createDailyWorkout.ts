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

/** Categories that ship playable content. */
export const PLAYABLE_CATEGORIES: PuzzleCategory[] = [
	'logic',
	'math',
	'sequence',
	'attention',
	'odd_one_out',
	'words',
	'matchsticks',
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
	matchsticks: { generatorId: 'matchsticks.equation.v1', version: 1 },
}

const CURATED_CATEGORIES: PuzzleCategory[] = ['logic', 'words']

/**
 * Build a diverse 10-puzzle category mix from a seeded RNG.
 * Rules: ≥5 distinct categories, nearly even counts, no 3+ identical in a row.
 */
export function buildCategoryMix(rng: RandomSource, size = DAILY_SIZE): PuzzleCategory[] {
	const base = [...PLAYABLE_CATEGORIES]
	const list: PuzzleCategory[] = []

	// Seed with a shuffled subset covering diversity first.
	const starter = rng.shuffle(base).slice(0, Math.min(5, base.length))
	list.push(...starter)

	while (list.length < size) {
		const counts = new Map<PuzzleCategory, number>()
		for (const category of base) {
			counts.set(category, 0)
		}
		for (const category of list) {
			counts.set(category, (counts.get(category) ?? 0) + 1)
		}
		const min = Math.min(...counts.values())
		let candidates = base.filter((category) => counts.get(category) === min)
		const last = list[list.length - 1]
		const last2 = list[list.length - 2]
		if (last && last === last2) {
			candidates = candidates.filter((category) => category !== last)
			if (candidates.length === 0) {
				candidates = base.filter((category) => category !== last)
			}
		}
		list.push(rng.pick(candidates))
	}

	// Soft reshuffle while preserving no-3-in-a-row where possible.
	return softenRuns(list, rng)
}

function softenRuns(
	input: PuzzleCategory[],
	rng: RandomSource,
): PuzzleCategory[] {
	const list = [...input]
	// Light pairwise swaps that do not create triple runs.
	for (let attempt = 0; attempt < list.length; attempt += 1) {
		const i = rng.nextInt(0, list.length - 1)
		const j = rng.nextInt(0, list.length - 1)
		if (i === j) {
			continue
		}
		const trial = [...list]
		const tmp = trial[i]
		trial[i] = trial[j]
		trial[j] = tmp
		if (!hasTripleRun(trial)) {
			list[i] = trial[i]
			list[j] = trial[j]
		}
	}
	// Final repair pass for any remaining triples.
	for (let i = 2; i < list.length; i += 1) {
		if (list[i] === list[i - 1] && list[i] === list[i - 2]) {
			const swapWith = list.findIndex(
				(category, index) =>
					index !== i &&
					category !== list[i] &&
					!wouldCreateTriple(list, i, index),
			)
			if (swapWith >= 0) {
				const tmp = list[i]
				list[i] = list[swapWith]
				list[swapWith] = tmp
			} else {
				void rng
			}
		}
	}
	return list
}

function hasTripleRun(list: PuzzleCategory[]): boolean {
	for (let i = 2; i < list.length; i += 1) {
		if (list[i] === list[i - 1] && list[i] === list[i - 2]) {
			return true
		}
	}
	return false
}

function wouldCreateTriple(
	list: PuzzleCategory[],
	from: number,
	to: number,
): boolean {
	const trial = [...list]
	const tmp = trial[from]
	trial[from] = trial[to]
	trial[to] = tmp
	return hasTripleRun(trial)
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
