import type { Puzzle } from '@/src/features/puzzles/types'
import { createDemoWorkout, type WorkoutSession } from '@/src/features/workout/createDemoWorkout'
import {
	clearDemoWorkout,
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
	void persist()
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
		live.elapsedMs = Date.now() - live.startedAt
		live.currentIndex = index
	} else {
		live.currentIndex = index + 1
	}
	void persist()
	return live
}

export function abandonWorkout(): void {
	live = null
	void clearDemoWorkout()
}

async function persist(): Promise<void> {
	if (!live) {
		await clearDemoWorkout()
		return
	}
	const payload: DemoWorkoutPersisted = {
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
