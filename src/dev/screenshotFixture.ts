/**
 * Temporary AsyncStorage / session fixtures for RuStore screenshot capture.
 * Gated by isStoreScreenshotMode — never affects production behavior.
 */

import AsyncStorage from '@react-native-async-storage/async-storage'
import { isStoreScreenshotMode } from '@/src/constants/screenshotMode'
import {
	STORAGE_SCHEMA_VERSION,
	saveActiveSession,
	saveDailyCompletion,
	saveSkills,
	saveStreakState,
	saveUnlockedAchievements,
	saveAchievementStats,
	type DailyCompletionPersisted,
	type SessionHistoryItem,
} from '@/src/storage'
import type { SkillMap } from '@/src/features/progress/skillModel'
import type { AchievementStats } from '@/src/features/progress/achievements'
import { toLocalDateString } from '@/src/utils/localDate'
import {
	abandonWorkout,
	startPracticeSession,
	getLiveWorkout,
} from '@/src/features/workout/sessionStore'
import type { PuzzleCategory } from '@/src/features/puzzles/types'

const DAY_MS = 24 * 60 * 60 * 1000

function assertScreenshotMode (): void {
	if (!isStoreScreenshotMode) {
		throw new Error('Screenshot fixture is only available in store screenshot mode')
	}
}

/**
 * Seed realistic Progress / Result data (skills, streak, history, achievements).
 * Set includeTodayCompletion to false for a clean Today CTA screenshot.
 */
export async function seedScreenshotProgressFixture (
	options: { includeTodayCompletion?: boolean } = {},
): Promise<void> {
	assertScreenshotMode()
	const includeTodayCompletion = options.includeTodayCompletion !== false
	const today = toLocalDateString()
	const now = Date.now()

	const skills: SkillMap = {
		logic: 3.7,
		math: 3.2,
		sequence: 3.5,
		attention: 2.9,
		odd_one_out: 2.7,
		words: 3.1,
		matchsticks: 3.4,
	}

	await saveSkills(skills)
	await saveStreakState({
		current: includeTodayCompletion ? 6 : 5,
		best: 11,
		lastCompletedDate: includeTodayCompletion
			? today
			: toLocalDateString(new Date(now - DAY_MS)),
	})

	const history: SessionHistoryItem[] = [
		...(includeTodayCompletion
			? [
					{
						sessionId: 'shot-daily-today',
						sessionType: 'daily' as const,
						title: 'Сегодняшняя тренировка',
						workoutDate: today,
						correctCount: 9,
						total: 10,
						hintsUsed: 1,
						elapsedMs: 4 * 60 * 1000 + 32_000,
						completedAt: now - 5 * 60 * 1000,
					},
				]
			: []),
		{
			sessionId: 'shot-daily-1',
			sessionType: 'daily',
			title: 'Сегодняшняя тренировка',
			workoutDate: toLocalDateString(new Date(now - DAY_MS)),
			correctCount: 8,
			total: 10,
			hintsUsed: 2,
			elapsedMs: 5 * 60 * 1000 + 10_000,
			completedAt: now - DAY_MS,
		},
		{
			sessionId: 'shot-prac-logic',
			sessionType: 'practice',
			title: 'Логика',
			practiceCategory: 'logic',
			correctCount: 8,
			total: 10,
			hintsUsed: 1,
			elapsedMs: 6 * 60 * 1000,
			completedAt: now - 2 * DAY_MS,
		},
		{
			sessionId: 'shot-prac-match',
			sessionType: 'practice',
			title: 'Спички',
			practiceCategory: 'matchsticks',
			correctCount: 7,
			total: 10,
			hintsUsed: 2,
			elapsedMs: 7 * 60 * 1000,
			completedAt: now - 3 * DAY_MS,
		},
		{
			sessionId: 'shot-daily-2',
			sessionType: 'daily',
			title: 'Сегодняшняя тренировка',
			workoutDate: toLocalDateString(new Date(now - 4 * DAY_MS)),
			correctCount: 9,
			total: 10,
			hintsUsed: 0,
			elapsedMs: 3 * 60 * 1000 + 50_000,
			completedAt: now - 4 * DAY_MS,
		},
	]

	// Replace history cleanly for deterministic Progress layout.
	await AsyncStorage.setItem('@fm/sessionHistory', JSON.stringify(history))
	await AsyncStorage.setItem(
		'@fm/meta',
		JSON.stringify({ schemaVersion: STORAGE_SCHEMA_VERSION }),
	)

	await saveUnlockedAchievements([
		{ id: 'first_workout', unlockedAt: now - 10 * DAY_MS },
		{ id: 'streak_3', unlockedAt: now - 4 * DAY_MS },
		{ id: 'streak_7', unlockedAt: now - DAY_MS },
		{ id: 'logic_20', unlockedAt: now - 2 * DAY_MS },
		{ id: 'matchsticks_25', unlockedAt: now - 3 * DAY_MS },
		{ id: 'sequence_20', unlockedAt: now - 5 * DAY_MS },
	])

	const stats: AchievementStats = {
		workoutsCompleted: 18,
		puzzlesSolved: 186,
		puzzlesCorrect: 154,
		currentStreak: includeTodayCompletion ? 6 : 5,
		bestStreak: 11,
		noHintStreak: 4,
		correctByCategory: {
			logic: 42,
			math: 28,
			sequence: 31,
			attention: 22,
			odd_one_out: 19,
			words: 24,
			matchsticks: 27,
		},
		playedCategories: [
			'logic',
			'math',
			'sequence',
			'attention',
			'odd_one_out',
			'words',
			'matchsticks',
		],
		perfectDailyCount: 2,
	}
	await saveAchievementStats(stats)

	if (includeTodayCompletion) {
		const completion: DailyCompletionPersisted = {
			schemaVersion: STORAGE_SCHEMA_VERSION,
			workoutDate: today,
			sessionId: 'shot-daily-today',
			correctCount: 9,
			wrongCount: 1,
			hintsUsed: 1,
			elapsedMs: 4 * 60 * 1000 + 32_000,
			categoryBreakdown: [
				{ category: 'logic', correct: 2, total: 2 },
				{ category: 'math', correct: 1, total: 1 },
				{ category: 'sequence', correct: 2, total: 2 },
				{ category: 'attention', correct: 1, total: 1 },
				{ category: 'odd_one_out', correct: 1, total: 1 },
				{ category: 'words', correct: 1, total: 1 },
				{ category: 'matchsticks', correct: 1, total: 2 },
			],
			completedAt: now - 5 * 60 * 1000,
		}
		await saveDailyCompletion(completion)
	} else {
		await AsyncStorage.removeItem('@fm/dailyCompletion')
	}
	await saveActiveSession(null)
	abandonWorkout()
}

/**
 * Start a practice session with a fixed seed for predictable puzzle visuals.
 */
export async function openScreenshotPractice (
	category: PuzzleCategory,
	baseSeed: number,
): Promise<void> {
	assertScreenshotMode()
	abandonWorkout()
	await saveActiveSession(null)
	await startPracticeSession(category, baseSeed)
}

/**
 * Clear in-memory live session so Result reads seeded dailyCompletion.
 */
export function clearLiveForScreenshotResult (): void {
	assertScreenshotMode()
	if (getLiveWorkout()) {
		abandonWorkout()
	}
}

/**
 * Best-effort wipe of screenshot fixture keys after capture.
 * Leaves settings/profile intact.
 */
export async function clearScreenshotFixture (): Promise<void> {
	assertScreenshotMode()
	abandonWorkout()
	await saveActiveSession(null)
	await AsyncStorage.multiRemove([
		'@fm/sessionHistory',
		'@fm/dailyCompletion',
		'@fm/skills',
		'@fm/streak',
		'@fm/achievements',
		'@fm/achievementStats',
		'@fm/recentPuzzles',
		'@fm/adPolicy',
	])
}
