import {
	createDailyWorkout,
	PLAYABLE_CATEGORIES,
} from '@/src/features/workout/createDailyWorkout'
import { buildDailySeed } from '@/src/features/workout/dailySeed'

describe('daily workout determinism', () => {
	const profileSeed = 424242
	const skills = {}

	it('same date + profile seed → identical workout', () => {
		const a = createDailyWorkout({
			workoutDate: '2026-09-04',
			profileSeed,
			skills,
		})
		const b = createDailyWorkout({
			workoutDate: '2026-09-04',
			profileSeed,
			skills,
		})
		expect(a.sessionId).toBe(b.sessionId)
		expect(a.plan).toEqual(b.plan)
		expect(a.puzzles.map((p) => p.id)).toEqual(b.puzzles.map((p) => p.id))
	})

	it('different date → different workout', () => {
		const a = createDailyWorkout({
			workoutDate: '2026-09-04',
			profileSeed,
			skills,
		})
		const b = createDailyWorkout({
			workoutDate: '2026-09-05',
			profileSeed,
			skills,
		})
		expect(a.puzzles.map((p) => p.id)).not.toEqual(b.puzzles.map((p) => p.id))
		expect(buildDailySeed('2026-09-04', profileSeed)).not.toBe(
			buildDailySeed('2026-09-05', profileSeed),
		)
	})

	it('has 10 puzzles, playable categories, valid difficulties', () => {
		const workout = createDailyWorkout({
			workoutDate: '2026-12-31',
			profileSeed,
			skills,
		})
		expect(workout.puzzles).toHaveLength(10)
		expect(new Set(workout.puzzles.map((p) => p.id)).size).toBe(10)
		for (const puzzle of workout.puzzles) {
			expect(PLAYABLE_CATEGORIES).toContain(puzzle.category)
			expect(puzzle.difficulty).toBeGreaterThanOrEqual(1)
			expect(puzzle.difficulty).toBeLessThanOrEqual(5)
			expect(puzzle.explanation.trim().length).toBeGreaterThan(0)
		}
		const counts = workout.mix.map((m) => m.count)
		expect(counts.reduce((a, b) => a + b, 0)).toBe(10)
		expect(Math.max(...counts)).toBeLessThanOrEqual(2)
	})

	it('mix uses ≥5 categories and never 3 identical in a row', () => {
		for (let day = 1; day <= 40; day += 1) {
			const date = `2026-03-${String(day).padStart(2, '0')}`
			const workout = createDailyWorkout({
				workoutDate: date,
				profileSeed: profileSeed + day,
				skills,
			})
			const categories = workout.puzzles.map((p) => p.category)
			expect(new Set(categories).size).toBeGreaterThanOrEqual(5)
			for (let i = 2; i < categories.length; i += 1) {
				expect(
					categories[i] === categories[i - 1] &&
						categories[i] === categories[i - 2],
				).toBe(false)
			}
		}
	})

	it('can include matchsticks in the daily mix over a month', () => {
		let sawMatchsticks = false
		for (let day = 1; day <= 31; day += 1) {
			const workout = createDailyWorkout({
				workoutDate: `2026-07-${String(day).padStart(2, '0')}`,
				profileSeed,
				skills,
			})
			if (workout.puzzles.some((p) => p.category === 'matchsticks')) {
				sawMatchsticks = true
				break
			}
		}
		expect(sawMatchsticks).toBe(true)
	})

	it('year boundary dates produce valid workouts', () => {
		for (const date of ['2025-12-31', '2026-01-01', '2024-02-29']) {
			const workout = createDailyWorkout({
				workoutDate: date,
				profileSeed,
				skills,
			})
			expect(workout.puzzles).toHaveLength(10)
		}
	})
})
