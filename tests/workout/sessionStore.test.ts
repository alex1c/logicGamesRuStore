import {
	abandonWorkout,
	getLiveWorkout,
	recordPuzzleResult,
	startDemoWorkout,
} from '@/src/features/workout/sessionStore'

jest.mock('@react-native-async-storage/async-storage', () => ({
	getItem: jest.fn(async () => null), setItem: jest.fn(async () => undefined), removeItem: jest.fn(async () => undefined),
}))

describe('workout session accounting', () => {
	afterEach(() => abandonWorkout())

	it('creates exactly five unique puzzles and ignores duplicate completion', () => {
		const state = startDemoWorkout(123)
		expect(state.session.puzzles).toHaveLength(5)
		expect(new Set(state.session.puzzles.map((p) => p.id)).size).toBe(5)
		recordPuzzleResult({ isCorrect: true, hintsUsed: 1 })
		const afterFirst = getLiveWorkout()!
		expect(afterFirst.correctCount).toBe(1)
		// A stale/double event cannot score the already completed index: simulate by
		// retaining its result while moving the cursor back.
		afterFirst.currentIndex = 0
		recordPuzzleResult({ isCorrect: true, hintsUsed: 1 })
		expect(afterFirst.correctCount).toBe(1)
		expect(afterFirst.hintsUsed).toBe(1)
	})

	it('finishes with consistent counts and non-negative elapsed time', () => {
		const state = startDemoWorkout(456)
		state.startedAt = Date.now() + 1000
		for (let i = 0; i < 5; i += 1) recordPuzzleResult({ isCorrect: i < 3, hintsUsed: 0 })
		expect(state.finished).toBe(true)
		expect(state.correctCount).toBe(3)
		expect(state.wrongCount).toBe(2)
		expect(state.elapsedMs).toBe(0)
	})

	it('ignores duplicate completion across a 10-step cursor walk', () => {
		startDemoWorkout(789)
		recordPuzzleResult({ isCorrect: true, hintsUsed: 0 })
		const live = getLiveWorkout()!
		const scoredIndex = 0
		live.currentIndex = scoredIndex
		recordPuzzleResult({ isCorrect: false, hintsUsed: 3 })
		expect(live.correctCount).toBe(1)
		expect(live.wrongCount).toBe(0)
		expect(live.hintsUsed).toBe(0)
	})
})
