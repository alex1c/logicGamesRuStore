import {
	ACHIEVEMENT_DEFS,
	evaluateAchievements,
	type AchievementStats,
} from '@/src/features/progress/achievements'
import { ALL_CATEGORIES } from '@/src/features/puzzles/types'

function baseStats(patch: Partial<AchievementStats> = {}): AchievementStats {
	return {
		workoutsCompleted: 0,
		puzzlesSolved: 0,
		puzzlesCorrect: 0,
		currentStreak: 0,
		bestStreak: 0,
		noHintStreak: 0,
		correctByCategory: {},
		playedCategories: [],
		perfectDailyCount: 0,
		...patch,
	}
}

describe('achievements evaluator', () => {
	it('catalog has 12–18 achievements', () => {
		expect(ACHIEVEMENT_DEFS.length).toBeGreaterThanOrEqual(12)
		expect(ACHIEVEMENT_DEFS.length).toBeLessThanOrEqual(18)
		const ids = ACHIEVEMENT_DEFS.map((d) => d.id)
		expect(new Set(ids).size).toBe(ids.length)
	})

	it('unlocks first workout once', () => {
		const first = evaluateAchievements(baseStats({ workoutsCompleted: 1 }), [])
		expect(first.newlyUnlocked.map((a) => a.id)).toContain('first_workout')
		const again = evaluateAchievements(
			baseStats({ workoutsCompleted: 5 }),
			first.allUnlocked,
		)
		expect(again.newlyUnlocked.map((a) => a.id)).not.toContain('first_workout')
	})

	it('unlocks streak tiers from best streak', () => {
		const result = evaluateAchievements(
			baseStats({ bestStreak: 7, currentStreak: 2, workoutsCompleted: 1 }),
			[],
		)
		const ids = result.newlyUnlocked.map((a) => a.id)
		expect(ids).toEqual(
			expect.arrayContaining(['first_workout', 'streak_3', 'streak_7']),
		)
		expect(ids).not.toContain('streak_14')
	})

	it('tracks puzzle count and category milestones', () => {
		const result = evaluateAchievements(
			baseStats({
				workoutsCompleted: 1,
				puzzlesCorrect: 100,
				correctByCategory: {
					logic: 20,
					math: 50,
					attention: 30,
					matchsticks: 25,
				},
			}),
			[],
		)
		const ids = result.newlyUnlocked.map((a) => a.id)
		expect(ids).toEqual(
			expect.arrayContaining([
				'puzzles_100',
				'logic_20',
				'math_50',
				'attention_30',
				'matchsticks_25',
			]),
		)
		expect(ids).not.toContain('puzzles_500')
	})

	it('unlocks all_categories when every category played', () => {
		const result = evaluateAchievements(
			baseStats({
				workoutsCompleted: 1,
				playedCategories: [...ALL_CATEGORIES],
			}),
			[],
		)
		expect(result.newlyUnlocked.map((a) => a.id)).toContain('all_categories')
	})

	it('reports progress without unlocking early', () => {
		const result = evaluateAchievements(
			baseStats({ puzzlesCorrect: 40, noHintStreak: 4 }),
			[],
		)
		const hundred = result.progress.find((p) => p.id === 'puzzles_100')
		const noHint = result.progress.find((p) => p.id === 'no_hints_10')
		expect(hundred).toEqual({ id: 'puzzles_100', current: 40, target: 100 })
		expect(noHint).toEqual({ id: 'no_hints_10', current: 4, target: 10 })
		expect(result.newlyUnlocked.map((a) => a.id)).not.toContain('puzzles_100')
	})
})
