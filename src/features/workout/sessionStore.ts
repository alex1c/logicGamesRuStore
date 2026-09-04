import type { Puzzle } from '@/src/features/puzzles/types'
import { createDemoWorkout, type WorkoutSession } from '@/src/features/workout/createDemoWorkout'
import {
	clearDemoWorkout,
	getDemoWorkout,
	saveDemoWorkout,
	type DemoWorkoutPersisted,
} from '@/src/storage'

export type WorkoutLiveState = {
	session: WorkoutSession
	currentIndex: number
	correctCount: number
	wrongCount: number
	hintsUsed: number
	startedAt: number
	results: ('pending' | 'correct' | 'wrong')[]
	finished: boolean
	elapsedMs: number
}

let live: WorkoutLiveState | null = null

export function getLiveWorkout(): WorkoutLiveState | null {
	return live
}

export function startDemoWorkout(baseSeed?: number): WorkoutLiveState {
	const session = createDemoWorkout(baseSeed)
	live = {
		session,
		currentIndex: 0,
		correctCount: 0,
		wrongCount: 0,
		hintsUsed: 0,
		startedAt: Date.now(),
		results: session.puzzles.map(() => 'pending'),
		finished: false,
		elapsedMs: 0,
	}
	void persist().catch(() => undefined)
	return live
}

/** Restore an unfinished, structurally valid demo session after process restart. */
export async function restoreDemoWorkout(): Promise<WorkoutLiveState | null> {
	if (live) return live
	const saved = await getDemoWorkout()
	if (!saved || !saved.sessionId.startsWith('demo-')) return null
	const baseSeed = Number(saved.sessionId.slice(5))
	if (!Number.isFinite(baseSeed)) return null
	const session = createDemoWorkout(baseSeed)
	const valid =
		saved.puzzleIds.length === session.puzzles.length &&
		saved.puzzleIds.every((id, index) => id === session.puzzles[index].id) &&
		saved.results.length === session.puzzles.length &&
		saved.results.every((result) => ['pending', 'correct', 'wrong'].includes(result)) &&
		Number.isInteger(saved.currentIndex) &&
		saved.currentIndex >= 0 &&
		saved.currentIndex < session.puzzles.length &&
		[saved.correctCount, saved.wrongCount, saved.hintsUsed, saved.startedAt].every(Number.isFinite) &&
		saved.correctCount >= 0 && saved.wrongCount >= 0 && saved.hintsUsed >= 0
	if (!valid) return null
	live = {
		session,
		currentIndex: saved.currentIndex,
		correctCount: saved.correctCount,
		wrongCount: saved.wrongCount,
		hintsUsed: saved.hintsUsed,
		startedAt: saved.startedAt,
		results: saved.results,
		finished: false,
		elapsedMs: 0,
	}
	return live
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
}): WorkoutLiveState | null {
	if (!live) {
		return null
	}
	const index = live.currentIndex
	if (live.finished || live.results[index] !== 'pending') {
		return live
	}
	live.hintsUsed += input.hintsUsed
	if (input.isCorrect) {
		live.correctCount += 1
		live.results[index] = 'correct'
	} else {
		live.wrongCount += 1
		live.results[index] = 'wrong'
	}

	if (index + 1 >= live.session.puzzles.length) {
		live.finished = true
		live.elapsedMs = Math.max(0, Date.now() - live.startedAt)
		live.currentIndex = index
	} else {
		live.currentIndex = index + 1
	}
	void persist().catch(() => undefined)
	return live
}

export function abandonWorkout(): void {
	live = null
	void clearDemoWorkout().catch(() => undefined)
}

async function persist(): Promise<void> {
	if (!live) {
		await clearDemoWorkout()
		return
	}
	const payload: DemoWorkoutPersisted = {
		schemaVersion: 1,
		sessionId: live.session.id,
		puzzleIds: live.session.puzzles.map((p) => p.id),
		currentIndex: live.currentIndex,
		correctCount: live.correctCount,
		wrongCount: live.wrongCount,
		hintsUsed: live.hintsUsed,
		startedAt: live.startedAt,
		results: live.results,
	}
	await saveDemoWorkout(payload)
}

export function formatDuration(ms: number): string {
	const totalSec = Math.max(0, Math.round(ms / 1000))
	const minutes = Math.floor(totalSec / 60)
	const seconds = totalSec % 60
	if (minutes === 0) {
		return `${seconds} с`
	}
	return `${minutes} мин ${seconds.toString().padStart(2, '0')} с`
}
