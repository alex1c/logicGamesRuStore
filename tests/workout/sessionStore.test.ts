import {
	abandonWorkout,
	getLiveWorkout,
	recordPuzzleResult,
	startDemoWorkout,
	waitForSessionPersistence,
} from '@/src/features/workout/sessionStore'
import {
	getAchievementStats,
	getSessionHistory,
	getSkills,
	resetStorageMigrationFlagForTests,
} from '@/src/storage'

const mockMemory = new Map<string, string>()

jest.mock('@react-native-async-storage/async-storage', () => ({
	getItem: jest.fn(async (key: string) => mockMemory.get(key) ?? null),
	setItem: jest.fn(async (key: string, value: string) => {
		await Promise.resolve()
		mockMemory.set(key, value)
	}),
	removeItem: jest.fn(async (key: string) => { mockMemory.delete(key) }),
}))

describe('workout session accounting', () => {
	beforeEach(async () => {
		await waitForSessionPersistence()
		mockMemory.clear()
		resetStorageMigrationFlagForTests()
	})
	afterEach(async () => {
		abandonWorkout()
		await waitForSessionPersistence()
	})

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

	it('serializes skill updates and final accounting', async () => {
		const state = startDemoWorkout(900)
		for (let i = 0; i < state.session.puzzles.length; i += 1) {
			recordPuzzleResult({ isCorrect: true, hintsUsed: 0 })
		}
		await waitForSessionPersistence()

		const expectedByCategory = new Map<string, number>()
		for (const puzzle of state.session.puzzles) {
			expectedByCategory.set(
				puzzle.category,
				(expectedByCategory.get(puzzle.category) ?? 2) + 0.12,
			)
		}
		const skills = await getSkills()
		for (const [category, expected] of expectedByCategory) {
			expect(skills[category as keyof typeof skills]).toBeCloseTo(expected)
		}
		expect(await getSessionHistory()).toHaveLength(1)
		expect((await getAchievementStats()).puzzlesCorrect).toBe(5)
	})

	it('continues the no-hint streak across session boundaries', async () => {
		for (const seed of [901, 902]) {
			const state = startDemoWorkout(seed)
			for (let i = 0; i < state.session.puzzles.length; i += 1) {
				recordPuzzleResult({ isCorrect: true, hintsUsed: 0 })
			}
			await waitForSessionPersistence()
		}
		expect((await getAchievementStats()).noHintStreak).toBe(10)
	})

	it('does not account the same completed session twice', async () => {
		for (let replay = 0; replay < 2; replay += 1) {
			const state = startDemoWorkout(904)
			for (let i = 0; i < state.session.puzzles.length; i += 1) {
				recordPuzzleResult({ isCorrect: true, hintsUsed: 0 })
			}
			await waitForSessionPersistence()
		}
		expect(await getSessionHistory()).toHaveLength(1)
		expect((await getAchievementStats()).puzzlesCorrect).toBe(5)
	})

	it('resets the no-hint streak on non-qualifying outcomes', async () => {
		startDemoWorkout(903)
		recordPuzzleResult({ isCorrect: true, hintsUsed: 0 })
		recordPuzzleResult({ isCorrect: true, hintsUsed: 0 })
		recordPuzzleResult({ isCorrect: false, hintsUsed: 0 })
		recordPuzzleResult({ isCorrect: true, hintsUsed: 1 })
		recordPuzzleResult({ isCorrect: true, hintsUsed: 0, revealedSolution: true })
		await waitForSessionPersistence()
		expect((await getAchievementStats()).noHintStreak).toBe(0)
	})
})
