/**
 * Session runtime for Daily + Practice (+ legacy demo for Codex regression tests).
 * Preserves duplicate-score / finish guards from Phase 1 Codex hardening.
 */

import type { Puzzle, PuzzleCategory } from '@/src/features/puzzles/types'
import {
	createDailyWorkout,
	createPracticeWorkout,
	materializePlan,
	DAILY_ESTIMATED_MINUTES,
} from '@/src/features/workout/createDailyWorkout'
import { createDemoWorkout, type WorkoutSession } from '@/src/features/workout/createDemoWorkout'
import {
	applySkillOutcome,
	classifyOutcome,
	getCategorySkill,
	type SkillMap,
} from '@/src/features/progress/skillModel'
import { applyDailyCompletion } from '@/src/features/progress/streak'
import { trackEvent } from '@/src/features/progress/analyticsEvents'
import {
	appendSessionHistory,
	getAchievementStats,
	getActiveSession,
	getOrCreateProfile,
	getRecentPuzzleIds,
	getSkills,
	getStreakState,
	getUnlockedAchievements,
	pushRecentPuzzleIds,
	saveAchievementStats,
	saveActiveSession,
	saveDailyCompletion,
	saveSkills,
	saveStreakState,
	saveUnlockedAchievements,
	STORAGE_SCHEMA_VERSION,
	type ActiveSessionPersisted,
	type PuzzlePlanPersisted,
	type PuzzleResultPersisted,
	type SessionType,
} from '@/src/storage'
import {
	evaluateAchievements,
	type AchievementStats,
} from '@/src/features/progress/achievements'
import { setPendingAchievements } from '@/src/features/progress/achievementPending'
import { formatClock, toLocalDateString, type LocalDateString } from '@/src/utils/localDate'

export type WorkoutLiveState = {
	session: WorkoutSession
	sessionType: SessionType
	workoutDate?: LocalDateString
	practiceCategory?: PuzzleCategory
	plan: PuzzlePlanPersisted[]
	currentIndex: number
	correctCount: number
	wrongCount: number
	hintsUsed: number
	startedAt: number
	results: ('pending' | 'correct' | 'wrong')[]
	resultDetails: PuzzleResultPersisted[]
	finished: boolean
	elapsedMs: number
	mix: { category: PuzzleCategory; label: string; count: number }[]
}

let live: WorkoutLiveState | null = null

export function getLiveWorkout(): WorkoutLiveState | null {
	return live
}

function toLegacySession(
	id: string,
	title: string,
	plan: PuzzlePlanPersisted[],
	puzzles: Puzzle[],
): WorkoutSession {
	return {
		id,
		title,
		items: plan.map((item) =>
			item.source === 'curated'
				? { source: 'curated' as const, curatedId: item.curatedId }
				: {
						source: 'generator' as const,
						generatorId: item.generatorId,
						difficulty: item.difficulty,
						seed: item.seed,
					},
		),
		puzzles,
		createdAt: Date.now(),
	}
}

function buildLiveFromParts(input: {
	sessionType: SessionType
	sessionId: string
	title: string
	plan: PuzzlePlanPersisted[]
	puzzles: Puzzle[]
	mix: WorkoutLiveState['mix']
	workoutDate?: LocalDateString
	practiceCategory?: PuzzleCategory
}): WorkoutLiveState {
	return {
		session: toLegacySession(
			input.sessionId,
			input.title,
			input.plan,
			input.puzzles,
		),
		sessionType: input.sessionType,
		workoutDate: input.workoutDate,
		practiceCategory: input.practiceCategory,
		plan: input.plan,
		currentIndex: 0,
		correctCount: 0,
		wrongCount: 0,
		hintsUsed: 0,
		startedAt: Date.now(),
		results: input.puzzles.map(() => 'pending'),
		resultDetails: input.puzzles.map(() => ({
			status: 'pending',
			hintsUsed: 0,
			revealedSolution: false,
		})),
		finished: false,
		elapsedMs: 0,
		mix: input.mix,
	}
}

/** Legacy 5-puzzle demo — kept for Codex regression tests. */
export function startDemoWorkout(baseSeed?: number): WorkoutLiveState {
	const session = createDemoWorkout(baseSeed)
	live = {
		session,
		sessionType: 'practice',
		plan: session.items.map((item, index) => {
			const puzzle = session.puzzles[index]
			if (item.source === 'curated') {
				return {
					source: 'curated',
					curatedId: item.curatedId,
					category: puzzle.category,
					difficulty: puzzle.difficulty,
				}
			}
			return {
				source: 'generator',
				generatorId: item.generatorId,
				generatorVersion: puzzle.metadata.generatorVersion,
				difficulty: item.difficulty,
				seed: item.seed,
				category: puzzle.category,
			}
		}),
		currentIndex: 0,
		correctCount: 0,
		wrongCount: 0,
		hintsUsed: 0,
		startedAt: Date.now(),
		results: session.puzzles.map(() => 'pending'),
		resultDetails: session.puzzles.map(() => ({
			status: 'pending',
			hintsUsed: 0,
			revealedSolution: false,
		})),
		finished: false,
		elapsedMs: 0,
		mix: [],
	}
	void persist().catch(() => undefined)
	return live
}

export async function startDailyWorkoutSession(options?: {
	workoutDate?: LocalDateString
}): Promise<WorkoutLiveState> {
	const profile = await getOrCreateProfile()
	const skills = await getSkills()
	const recentIds = await getRecentPuzzleIds()
	const workoutDate = options?.workoutDate ?? toLocalDateString()
	const built = createDailyWorkout({
		workoutDate,
		profileSeed: profile.profileSeed,
		skills,
		recentIds,
	})
	live = buildLiveFromParts({
		sessionType: 'daily',
		sessionId: built.sessionId,
		title: built.title,
		plan: built.plan,
		puzzles: built.puzzles,
		mix: built.mix,
		workoutDate,
	})
	trackEvent('workout_started', {
		sessionId: live.session.id,
		workoutDate,
		size: built.puzzles.length,
	})
	void persist().catch(() => undefined)
	return live
}

export async function startPracticeSession(
	category: PuzzleCategory,
	baseSeed?: number,
): Promise<WorkoutLiveState> {
	const profile = await getOrCreateProfile()
	const skills = await getSkills()
	const recentIds = await getRecentPuzzleIds()
	const built = createPracticeWorkout({
		category,
		profileSeed: profile.profileSeed,
		skills,
		recentIds,
		baseSeed,
	})
	live = buildLiveFromParts({
		sessionType: 'practice',
		sessionId: built.sessionId,
		title: built.title,
		plan: built.plan,
		puzzles: built.puzzles,
		mix: built.mix,
		practiceCategory: category,
	})
	trackEvent('practice_started', {
		sessionId: live.session.id,
		category,
		size: built.puzzles.length,
	})
	trackEvent('category_selected', { category })
	void persist().catch(() => undefined)
	return live
}

export async function restoreActiveWorkout(): Promise<WorkoutLiveState | null> {
	if (live && !live.finished) {
		return live
	}
	const saved = await getActiveSession()
	if (!saved || saved.finished) {
		return null
	}
	try {
		const puzzles = materializePlan(saved.plan)
		const valid =
			saved.puzzleIds.length === puzzles.length &&
			saved.puzzleIds.every((id, index) => id === puzzles[index].id) &&
			saved.results.length === puzzles.length &&
			Number.isInteger(saved.currentIndex) &&
			saved.currentIndex >= 0 &&
			saved.currentIndex < puzzles.length
		if (!valid) {
			await saveActiveSession(null)
			return null
		}
		live = {
			session: toLegacySession(
				saved.sessionId,
				saved.title,
				saved.plan,
				puzzles,
			),
			sessionType: saved.sessionType,
			workoutDate: saved.workoutDate,
			practiceCategory: saved.practiceCategory,
			plan: saved.plan,
			currentIndex: saved.currentIndex,
			correctCount: saved.correctCount,
			wrongCount: saved.wrongCount,
			hintsUsed: saved.hintsUsed,
			startedAt: saved.startedAt,
			results: saved.results.map((r) => r.status),
			resultDetails: saved.results,
			finished: false,
			elapsedMs: Math.max(0, saved.elapsedMs),
			mix: [],
		}
		trackEvent(
			saved.sessionType === 'daily' ? 'workout_resumed' : 'practice_started',
			{ sessionId: saved.sessionId },
		)
		return live
	} catch {
		await saveActiveSession(null)
		return null
	}
}

/** @deprecated Alias kept for Codex play screen — prefer restoreActiveWorkout. */
export async function restoreDemoWorkout(): Promise<WorkoutLiveState | null> {
	return restoreActiveWorkout()
}

export function getCurrentPuzzle(): Puzzle | null {
	if (!live || live.finished) {
		return null
	}
	return live.session.puzzles[live.currentIndex] ?? null
}

export function recordPuzzleResult(input: {
	isCorrect: boolean
	hintsUsed: number
	revealedSolution?: boolean
}): WorkoutLiveState | null {
	if (!live) {
		return null
	}
	const index = live.currentIndex
	if (live.finished || live.results[index] !== 'pending') {
		return live
	}

	const revealedSolution = input.revealedSolution === true
	live.hintsUsed += input.hintsUsed
	live.resultDetails[index] = {
		status: input.isCorrect && !revealedSolution ? 'correct' : 'wrong',
		hintsUsed: input.hintsUsed,
		revealedSolution,
	}

	if (input.isCorrect && !revealedSolution) {
		live.correctCount += 1
		live.results[index] = 'correct'
	} else {
		live.wrongCount += 1
		live.results[index] = 'wrong'
	}

	trackEvent('puzzle_answered', {
		sessionId: live.session.id,
		category: live.session.puzzles[index].category,
		correct: input.isCorrect && !revealedSolution,
		hintsUsed: input.hintsUsed,
		revealedSolution,
	})
	if (input.hintsUsed > 0) {
		trackEvent('hint_used', { count: input.hintsUsed })
	}
	if (revealedSolution) {
		trackEvent('solution_revealed', {})
	}

	void applySkillForPuzzle(live.session.puzzles[index].category, {
		isCorrect: input.isCorrect,
		hintsUsed: input.hintsUsed,
		revealedSolution,
	}).catch(() => undefined)

	if (index + 1 >= live.session.puzzles.length) {
		live.finished = true
		live.elapsedMs = Math.max(
			0,
			live.elapsedMs + Math.max(0, Date.now() - live.startedAt),
		)
		live.currentIndex = index
		void finalizeSession(live).catch(() => undefined)
	} else {
		live.currentIndex = index + 1
	}
	void persist().catch(() => undefined)
	return live
}

async function applySkillForPuzzle(
	category: PuzzleCategory,
	outcome: {
		isCorrect: boolean
		hintsUsed: number
		revealedSolution: boolean
	},
): Promise<void> {
	const skills: SkillMap = { ...(await getSkills()) }
	const current = getCategorySkill(skills, category)
	const kind = classifyOutcome(outcome)
	skills[category] = applySkillOutcome(current, kind)
	await saveSkills(skills)
}

async function finalizeSession(state: WorkoutLiveState): Promise<void> {
	await pushRecentPuzzleIds(state.session.puzzles.map((p) => p.id))
	await appendSessionHistory({
		sessionId: state.session.id,
		sessionType: state.sessionType,
		title: state.session.title,
		workoutDate: state.workoutDate,
		practiceCategory: state.practiceCategory,
		correctCount: state.correctCount,
		total: state.session.puzzles.length,
		hintsUsed: state.hintsUsed,
		elapsedMs: state.elapsedMs,
		completedAt: Date.now(),
	})

	let streakState = await getStreakState()

	if (state.sessionType === 'daily' && state.workoutDate) {
		const breakdownMap = new Map<
			PuzzleCategory,
			{ correct: number; total: number }
		>()
		state.session.puzzles.forEach((puzzle, index) => {
			const row = breakdownMap.get(puzzle.category) ?? {
				correct: 0,
				total: 0,
			}
			row.total += 1
			if (state.results[index] === 'correct') {
				row.correct += 1
			}
			breakdownMap.set(puzzle.category, row)
		})
		await saveDailyCompletion({
			schemaVersion: STORAGE_SCHEMA_VERSION,
			workoutDate: state.workoutDate,
			sessionId: state.session.id,
			correctCount: state.correctCount,
			wrongCount: state.wrongCount,
			hintsUsed: state.hintsUsed,
			elapsedMs: state.elapsedMs,
			categoryBreakdown: [...breakdownMap.entries()].map(
				([category, stats]) => ({ category, ...stats }),
			),
			completedAt: Date.now(),
		})
		streakState = applyDailyCompletion(streakState, state.workoutDate)
		await saveStreakState(streakState)
		trackEvent('streak_updated', {
			current: streakState.current,
			best: streakState.best,
		})
		trackEvent('workout_completed', {
			sessionId: state.session.id,
			correct: state.correctCount,
			total: state.session.puzzles.length,
		})
	} else {
		trackEvent('practice_completed', {
			sessionId: state.session.id,
			correct: state.correctCount,
			total: state.session.puzzles.length,
		})
	}

	const stats = await updateAchievementStatsFromSession(state, streakState)
	const already = await getUnlockedAchievements()
	const { newlyUnlocked, allUnlocked } = evaluateAchievements(stats, already)
	if (newlyUnlocked.length > 0) {
		await saveUnlockedAchievements(allUnlocked)
		setPendingAchievements(newlyUnlocked)
		for (const item of newlyUnlocked) {
			trackEvent('achievement_unlocked', { id: item.id })
		}
	}

	await saveActiveSession(null)
}

async function updateAchievementStatsFromSession(
	state: WorkoutLiveState,
	streakState: Awaited<ReturnType<typeof getStreakState>>,
): Promise<AchievementStats> {
	const stats = await getAchievementStats()
	stats.workoutsCompleted += 1
	stats.puzzlesSolved += state.session.puzzles.length
	stats.puzzlesCorrect += state.correctCount
	stats.currentStreak = streakState.current
	stats.bestStreak = streakState.best

	let run = 0
	let bestNoHint = stats.noHintStreak
	state.session.puzzles.forEach((puzzle, index) => {
		const detail = state.resultDetails[index]
		const ok = state.results[index] === 'correct'
		if (ok) {
			stats.correctByCategory[puzzle.category] =
				(stats.correctByCategory[puzzle.category] ?? 0) + 1
		}
		if (ok && detail.hintsUsed === 0 && !detail.revealedSolution) {
			run += 1
			bestNoHint = Math.max(bestNoHint, run)
		} else {
			run = 0
		}
		if (!stats.playedCategories.includes(puzzle.category)) {
			stats.playedCategories = [...stats.playedCategories, puzzle.category]
		}
	})
	stats.noHintStreak = bestNoHint

	if (
		state.sessionType === 'daily' &&
		state.correctCount === state.session.puzzles.length
	) {
		stats.perfectDailyCount += 1
	}

	await saveAchievementStats(stats)
	return stats
}

export function abandonWorkout(): void {
	live = null
	void saveActiveSession(null).catch(() => undefined)
}

async function persist(): Promise<void> {
	if (!live || live.finished) {
		await saveActiveSession(null)
		return
	}
	const payload: ActiveSessionPersisted = {
		schemaVersion: STORAGE_SCHEMA_VERSION,
		sessionId: live.session.id,
		sessionType: live.sessionType,
		workoutDate: live.workoutDate,
		practiceCategory: live.practiceCategory,
		title: live.session.title,
		plan: live.plan,
		puzzleIds: live.session.puzzles.map((p) => p.id),
		currentIndex: live.currentIndex,
		correctCount: live.correctCount,
		wrongCount: live.wrongCount,
		hintsUsed: live.hintsUsed,
		startedAt: live.startedAt,
		elapsedMs: live.elapsedMs,
		results: live.resultDetails,
		finished: false,
	}
	await saveActiveSession(payload)
}

export function formatDuration(ms: number): string {
	return formatClock(ms)
}

export { DAILY_ESTIMATED_MINUTES }
