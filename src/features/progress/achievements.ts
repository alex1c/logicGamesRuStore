/**
 * Achievement catalog and pure evaluation.
 */

import type { PuzzleCategory } from '@/src/features/puzzles/types'
import { ALL_CATEGORIES } from '@/src/features/puzzles/types'

export type AchievementId =
	| 'first_workout'
	| 'streak_3'
	| 'streak_7'
	| 'streak_14'
	| 'puzzles_100'
	| 'puzzles_500'
	| 'no_hints_10'
	| 'logic_20'
	| 'math_50'
	| 'attention_30'
	| 'matchsticks_25'
	| 'words_20'
	| 'sequence_20'
	| 'odd_20'
	| 'all_categories'
	| 'perfect_daily'

export type AchievementDef = {
	id: AchievementId
	title: string
	description: string
	icon: string
	/** Optional progress target for UI. */
	target?: number
}

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
	{
		id: 'first_workout',
		title: 'Первый шаг',
		description: 'Завершите первую тренировку',
		icon: '🏁',
	},
	{
		id: 'streak_3',
		title: 'В ритме',
		description: 'Серия 3 дня',
		icon: '🔥',
		target: 3,
	},
	{
		id: 'streak_7',
		title: 'Неделя разума',
		description: 'Серия 7 дней',
		icon: '📅',
		target: 7,
	},
	{
		id: 'streak_14',
		title: 'Две недели',
		description: 'Серия 14 дней',
		icon: '🌟',
		target: 14,
	},
	{
		id: 'puzzles_100',
		title: 'Сотня',
		description: 'Решите 100 задач',
		icon: '💯',
		target: 100,
	},
	{
		id: 'puzzles_500',
		title: 'Пятьсот',
		description: 'Решите 500 задач',
		icon: '🧠',
		target: 500,
	},
	{
		id: 'no_hints_10',
		title: 'Без подсказок',
		description: '10 задач подряд без подсказки',
		icon: '💡',
		target: 10,
	},
	{
		id: 'logic_20',
		title: 'Точная логика',
		description: '20 верных задач по логике',
		icon: '🧩',
		target: 20,
	},
	{
		id: 'math_50',
		title: 'Мастер чисел',
		description: '50 верных математических задач',
		icon: '🔢',
		target: 50,
	},
	{
		id: 'attention_30',
		title: 'Орлиный глаз',
		description: '30 верных задач на внимание',
		icon: '👁',
		target: 30,
	},
	{
		id: 'matchsticks_25',
		title: 'Спичечный мастер',
		description: '25 верных задач со спичками',
		icon: '｜',
		target: 25,
	},
	{
		id: 'words_20',
		title: 'Словесник',
		description: '20 верных словесных задач',
		icon: '🔤',
		target: 20,
	},
	{
		id: 'sequence_20',
		title: 'Ряды чисел',
		description: '20 верных последовательностей',
		icon: '📶',
		target: 20,
	},
	{
		id: 'odd_20',
		title: 'Лишнее звено',
		description: '20 верных «найди лишнее»',
		icon: '🔎',
		target: 20,
	},
	{
		id: 'all_categories',
		title: 'Универсал',
		description: 'Сыграйте во все категории',
		icon: '🎯',
		target: ALL_CATEGORIES.length,
	},
	{
		id: 'perfect_daily',
		title: 'Идеальный день',
		description: 'Завершите Daily на 10 из 10',
		icon: '✨',
	},
]

export type AchievementStats = {
	workoutsCompleted: number
	puzzlesSolved: number
	puzzlesCorrect: number
	currentStreak: number
	bestStreak: number
	noHintStreak: number
	correctByCategory: Partial<Record<PuzzleCategory, number>>
	playedCategories: PuzzleCategory[]
	perfectDailyCount: number
	/** Bounded idempotency ledger for completed-session accounting. */
	processedSessionIds?: string[]
}

export type UnlockedAchievement = {
	id: AchievementId
	unlockedAt: number
}

export type AchievementProgress = {
	id: AchievementId
	current: number
	target: number
}

function progressFor(
	def: AchievementDef,
	stats: AchievementStats,
): AchievementProgress | null {
	if (!def.target) {
		return null
	}
	switch (def.id) {
		case 'streak_3':
		case 'streak_7':
		case 'streak_14':
			return {
				id: def.id,
				current: Math.min(stats.currentStreak, def.target),
				target: def.target,
			}
		case 'puzzles_100':
		case 'puzzles_500':
			return {
				id: def.id,
				current: Math.min(stats.puzzlesCorrect, def.target),
				target: def.target,
			}
		case 'no_hints_10':
			return {
				id: def.id,
				current: Math.min(stats.noHintStreak, def.target),
				target: def.target,
			}
		case 'logic_20':
			return {
				id: def.id,
				current: Math.min(stats.correctByCategory.logic ?? 0, def.target),
				target: def.target,
			}
		case 'math_50':
			return {
				id: def.id,
				current: Math.min(stats.correctByCategory.math ?? 0, def.target),
				target: def.target,
			}
		case 'attention_30':
			return {
				id: def.id,
				current: Math.min(stats.correctByCategory.attention ?? 0, def.target),
				target: def.target,
			}
		case 'matchsticks_25':
			return {
				id: def.id,
				current: Math.min(
					stats.correctByCategory.matchsticks ?? 0,
					def.target,
				),
				target: def.target,
			}
		case 'words_20':
			return {
				id: def.id,
				current: Math.min(stats.correctByCategory.words ?? 0, def.target),
				target: def.target,
			}
		case 'sequence_20':
			return {
				id: def.id,
				current: Math.min(stats.correctByCategory.sequence ?? 0, def.target),
				target: def.target,
			}
		case 'odd_20':
			return {
				id: def.id,
				current: Math.min(
					stats.correctByCategory.odd_one_out ?? 0,
					def.target,
				),
				target: def.target,
			}
		case 'all_categories':
			return {
				id: def.id,
				current: Math.min(stats.playedCategories.length, def.target),
				target: def.target,
			}
		default:
			return null
	}
}

function isUnlocked(def: AchievementDef, stats: AchievementStats): boolean {
	switch (def.id) {
		case 'first_workout':
			return stats.workoutsCompleted >= 1
		case 'streak_3':
			return stats.bestStreak >= 3 || stats.currentStreak >= 3
		case 'streak_7':
			return stats.bestStreak >= 7 || stats.currentStreak >= 7
		case 'streak_14':
			return stats.bestStreak >= 14 || stats.currentStreak >= 14
		case 'puzzles_100':
			return stats.puzzlesCorrect >= 100
		case 'puzzles_500':
			return stats.puzzlesCorrect >= 500
		case 'no_hints_10':
			return stats.noHintStreak >= 10
		case 'logic_20':
			return (stats.correctByCategory.logic ?? 0) >= 20
		case 'math_50':
			return (stats.correctByCategory.math ?? 0) >= 50
		case 'attention_30':
			return (stats.correctByCategory.attention ?? 0) >= 30
		case 'matchsticks_25':
			return (stats.correctByCategory.matchsticks ?? 0) >= 25
		case 'words_20':
			return (stats.correctByCategory.words ?? 0) >= 20
		case 'sequence_20':
			return (stats.correctByCategory.sequence ?? 0) >= 20
		case 'odd_20':
			return (stats.correctByCategory.odd_one_out ?? 0) >= 20
		case 'all_categories':
			return ALL_CATEGORIES.every((c) => stats.playedCategories.includes(c))
		case 'perfect_daily':
			return stats.perfectDailyCount >= 1
		default: {
			const _exhaustive: never = def.id
			return Boolean(_exhaustive)
		}
	}
}

/**
 * Evaluate achievements. Never re-unlocks existing ones.
 * Returns newly unlocked ids (with timestamps).
 */
export function evaluateAchievements(
	stats: AchievementStats,
	alreadyUnlocked: UnlockedAchievement[],
	now = Date.now(),
): {
	newlyUnlocked: UnlockedAchievement[]
	allUnlocked: UnlockedAchievement[]
	progress: AchievementProgress[]
} {
	const unlockedIds = new Set(alreadyUnlocked.map((a) => a.id))
	const newlyUnlocked: UnlockedAchievement[] = []
	for (const def of ACHIEVEMENT_DEFS) {
		if (unlockedIds.has(def.id)) {
			continue
		}
		if (isUnlocked(def, stats)) {
			newlyUnlocked.push({ id: def.id, unlockedAt: now })
			unlockedIds.add(def.id)
		}
	}
	const allUnlocked = [
		...alreadyUnlocked,
		...newlyUnlocked.filter((n) => !alreadyUnlocked.some((a) => a.id === n.id)),
	]
	const progress = ACHIEVEMENT_DEFS.map((def) => progressFor(def, stats)).filter(
		(p): p is AchievementProgress => p != null,
	)
	return { newlyUnlocked, allUnlocked, progress }
}

export function getAchievementDef(id: AchievementId): AchievementDef | undefined {
	return ACHIEVEMENT_DEFS.find((d) => d.id === id)
}
