import AsyncStorage from '@react-native-async-storage/async-storage'
import {
	ensureStorageMigrated,
	getAchievementStats,
	getSkills,
	getStreakState,
	getUnlockedAchievements,
	resetStorageMigrationFlagForTests,
	STORAGE_SCHEMA_VERSION,
} from '@/src/storage'

const mockMemory = new Map<string, string>()

jest.mock('@react-native-async-storage/async-storage', () => ({
	getItem: jest.fn(async (key: string) => mockMemory.get(key) ?? null),
	setItem: jest.fn(async (key: string, value: string) => {
		mockMemory.set(key, value)
	}),
	removeItem: jest.fn(async (key: string) => {
		mockMemory.delete(key)
	}),
}))

describe('storage migration v2 → v4', () => {
	beforeEach(() => {
		mockMemory.clear()
		resetStorageMigrationFlagForTests()
		jest.clearAllMocks()
	})

	it('preserves streak/skills and initializes achievements', async () => {
		mockMemory.set('@fm/meta', JSON.stringify({ schemaVersion: 2 }))
		mockMemory.set(
			'@fm/streak',
			JSON.stringify({
				current: 4,
				best: 9,
				lastCompletedDate: '2026-09-03',
			}),
		)
		mockMemory.set('@fm/skills', JSON.stringify({ logic: 3, matchsticks: 2 }))
		mockMemory.set(
			'@fm/recentPuzzles',
			JSON.stringify(['matchsticks.equation.v1:1:1:0']),
		)
		mockMemory.set(
			'@fm/activeSession',
			JSON.stringify({
				schemaVersion: 2,
				sessionId: 's1',
				sessionType: 'daily',
				title: 'test',
				plan: [],
				puzzleIds: [],
				currentIndex: 0,
				correctCount: 0,
				wrongCount: 0,
				hintsUsed: 0,
				startedAt: 1,
				elapsedMs: 0,
				results: [],
				finished: false,
			}),
		)

		await ensureStorageMigrated()

		const meta = JSON.parse(mockMemory.get('@fm/meta')!)
		expect(meta.schemaVersion).toBe(STORAGE_SCHEMA_VERSION)

		const streak = await getStreakState()
		expect(streak).toEqual({
			current: 4,
			best: 9,
			lastCompletedDate: '2026-09-03',
		})

		const skills = await getSkills()
		expect(skills.logic).toBe(3)
		expect(skills.matchsticks).toBe(2)

		expect(await getUnlockedAchievements()).toEqual([])
		const stats = await getAchievementStats()
		expect(stats.workoutsCompleted).toBe(0)
		expect(stats.playedCategories).toEqual([])

		const active = JSON.parse(mockMemory.get('@fm/activeSession')!)
		expect(active.schemaVersion).toBe(4)

		expect(mockMemory.get('@fm/recentPuzzles')).toContain('matchsticks')
		expect(mockMemory.get('@fm/adPolicy')).toBeTruthy()
		expect(AsyncStorage.setItem).toHaveBeenCalled()
	})

	it('is idempotent on repeated migrate', async () => {
		mockMemory.set('@fm/meta', JSON.stringify({ schemaVersion: 4 }))
		mockMemory.set(
			'@fm/achievements',
			JSON.stringify([{ id: 'first_workout', unlockedAt: 1 }]),
		)
		await ensureStorageMigrated()
		resetStorageMigrationFlagForTests()
		await ensureStorageMigrated()
		expect(await getUnlockedAchievements()).toEqual([
			{ id: 'first_workout', unlockedAt: 1 },
		])
	})

	it('does not downgrade or mutate an unknown future schema', async () => {
		mockMemory.set('@fm/meta', JSON.stringify({ schemaVersion: 99 }))
		mockMemory.set('@fm/achievements', '{future-format:true}')
		const before = new Map(mockMemory)

		await ensureStorageMigrated()

		expect(mockMemory).toEqual(before)
	})
})
