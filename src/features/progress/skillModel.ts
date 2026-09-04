/**
 * Per-category adaptive skill model (internal 1.0–5.0).
 * User-facing scores are mapped to 0–100 separately.
 */

import type { Difficulty, PuzzleCategory } from '@/src/features/puzzles/types'

export const SKILL_MIN = 1
export const SKILL_MAX = 5
export const SKILL_DEFAULT = 2

export type PuzzleOutcomeKind =
	| 'correct_no_hint'
	| 'correct_with_hint'
	| 'wrong'
	| 'solution_revealed'

export type SkillMap = Partial<Record<PuzzleCategory, number>>

const DELTAS: Record<PuzzleOutcomeKind, number> = {
	correct_no_hint: 0.12,
	correct_with_hint: 0.03,
	wrong: -0.1,
	solution_revealed: -0.12,
}

export function clampSkill(value: number): number {
	if (!Number.isFinite(value)) {
		return SKILL_DEFAULT
	}
	return Math.min(SKILL_MAX, Math.max(SKILL_MIN, value))
}

export function getCategorySkill(
	skills: SkillMap,
	category: PuzzleCategory,
): number {
	const raw = skills[category]
	return clampSkill(raw ?? SKILL_DEFAULT)
}

/**
 * Apply one puzzle outcome to a category skill.
 * Deterministic pure function of prior skill + outcome.
 */
export function applySkillOutcome(
	current: number,
	outcome: PuzzleOutcomeKind,
): number {
	return clampSkill(clampSkill(current) + DELTAS[outcome])
}

export function classifyOutcome(input: {
	isCorrect: boolean
	hintsUsed: number
	revealedSolution: boolean
}): PuzzleOutcomeKind {
	if (input.revealedSolution) {
		return 'solution_revealed'
	}
	if (!input.isCorrect) {
		return 'wrong'
	}
	if (input.hintsUsed > 0) {
		return 'correct_with_hint'
	}
	return 'correct_no_hint'
}

/**
 * Map internal skill to a play difficulty with mild deterministic scatter.
 * Uses seed so the same (skill, seed) always yields the same difficulty.
 */
export function skillToDifficulty(
	skill: number,
	scatterSeed: number,
): Difficulty {
	const clamped = clampSkill(skill)
	const center = Math.round(clamped) as Difficulty
	const bucket = Math.abs(scatterSeed >>> 0) % 10
	// ~60% center, ~20% -1, ~20% +1
	let chosen = center
	if (bucket <= 1) {
		chosen = (center - 1) as Difficulty
	} else if (bucket >= 8) {
		chosen = (center + 1) as Difficulty
	}
	if (chosen < 1) {
		return 1
	}
	if (chosen > 5) {
		return 5
	}
	return chosen as Difficulty
}

/** User-facing 0–100 score derived from internal skill. */
export function skillToDisplayScore(skill: number): number {
	const clamped = clampSkill(skill)
	const score = Math.round(((clamped - SKILL_MIN) / (SKILL_MAX - SKILL_MIN)) * 100)
	return Math.min(100, Math.max(0, score))
}

/** Inverse for tests / seeding — display 0–100 → internal skill. */
export function displayScoreToSkill(score: number): number {
	const s = Math.min(100, Math.max(0, score))
	return clampSkill(SKILL_MIN + (s / 100) * (SKILL_MAX - SKILL_MIN))
}
