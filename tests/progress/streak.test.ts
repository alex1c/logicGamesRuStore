import {
	applyDailyCompletion,
	EMPTY_STREAK,
} from '@/src/features/progress/streak'

describe('streak rules', () => {
	it('first completion → 1', () => {
		const next = applyDailyCompletion(EMPTY_STREAK, '2026-03-01')
		expect(next.current).toBe(1)
		expect(next.best).toBe(1)
		expect(next.lastCompletedDate).toBe('2026-03-01')
	})

	it('same-day repeat does not increase streak', () => {
		const once = applyDailyCompletion(EMPTY_STREAK, '2026-03-01')
		const again = applyDailyCompletion(once, '2026-03-01')
		expect(again.current).toBe(1)
		expect(again.best).toBe(1)
	})

	it('next day increments', () => {
		const day1 = applyDailyCompletion(EMPTY_STREAK, '2026-03-01')
		const day2 = applyDailyCompletion(day1, '2026-03-02')
		expect(day2.current).toBe(2)
		expect(day2.best).toBe(2)
	})

	it('skip day resets to 1 but preserves best', () => {
		const built = applyDailyCompletion(
			applyDailyCompletion(EMPTY_STREAK, '2026-03-01'),
			'2026-03-02',
		)
		const skipped = applyDailyCompletion(built, '2026-03-04')
		expect(skipped.current).toBe(1)
		expect(skipped.best).toBe(2)
	})

	it('Dec 31 → Jan 1 continues streak', () => {
		const a = applyDailyCompletion(EMPTY_STREAK, '2025-12-31')
		const b = applyDailyCompletion(a, '2026-01-01')
		expect(b.current).toBe(2)
	})

	it('Feb 28 → Mar 1 non-leap resets (gap)', () => {
		const a = applyDailyCompletion(EMPTY_STREAK, '2025-02-28')
		const b = applyDailyCompletion(a, '2025-03-01')
		expect(b.current).toBe(2)
	})

	it('Feb 28 → Feb 29 leap year continues', () => {
		const a = applyDailyCompletion(EMPTY_STREAK, '2024-02-28')
		const b = applyDailyCompletion(a, '2024-02-29')
		expect(b.current).toBe(2)
		const c = applyDailyCompletion(b, '2024-03-01')
		expect(c.current).toBe(3)
	})
})
