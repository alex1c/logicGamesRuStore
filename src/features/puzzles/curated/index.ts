import type { Difficulty, Puzzle, PuzzleCategory } from '../types'
import type { RandomSource } from '@/src/utils/prng'
import { CURATED_LOGIC_PUZZLES } from './logicPuzzles'
import { CURATED_WORDS_PUZZLES } from './wordsPuzzles'
import { CURATED_ODD_PUZZLES } from './oddPuzzles'

/** Full curated library for Phase 2. */
export const CURATED_PUZZLES: Puzzle[] = [
	...CURATED_LOGIC_PUZZLES,
	...CURATED_WORDS_PUZZLES,
	...CURATED_ODD_PUZZLES,
]

export function getCuratedById(id: string): Puzzle | undefined {
	return CURATED_PUZZLES.find((puzzle) => puzzle.id === id)
}

export function listCuratedByCategory(category: PuzzleCategory): Puzzle[] {
	return CURATED_PUZZLES.filter((puzzle) => puzzle.category === category)
}

/**
 * Pick a curated puzzle avoiding recent/used IDs.
 * Falls back to oldest-in-recent, then any in category.
 */
export function pickCuratedAvoidingRecent(input: {
	category: PuzzleCategory
	difficulty: Difficulty
	recentIds: string[]
	usedIds: Set<string>
	rng: RandomSource
}): Puzzle | null {
	const pool = listCuratedByCategory(input.category)
	if (pool.length === 0) {
		return null
	}

	const difficultyNear = pool.filter(
		(p) => Math.abs(p.difficulty - input.difficulty) <= 1,
	)
	const preferred = difficultyNear.length > 0 ? difficultyNear : pool

	const fresh = preferred.filter(
		(p) => !input.usedIds.has(p.id) && !input.recentIds.includes(p.id),
	)
	if (fresh.length > 0) {
		return input.rng.pick(fresh)
	}

	const unused = preferred.filter((p) => !input.usedIds.has(p.id))
	if (unused.length > 0) {
		// Prefer least-recent among unused
		const sorted = [...unused].sort((a, b) => {
			const ia = input.recentIds.indexOf(a.id)
			const ib = input.recentIds.indexOf(b.id)
			const ra = ia === -1 ? Number.MAX_SAFE_INTEGER : ia
			const rb = ib === -1 ? Number.MAX_SAFE_INTEGER : ib
			return rb - ra // higher index = older in our newest-first list → prefer
		})
		return sorted[0]
	}

	return input.rng.pick(preferred)
}
