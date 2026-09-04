/**
 * Daily streak rules — only Daily Workout completions count.
 */

import {
	localDateDiffDays,
	type LocalDateString,
} from '@/src/utils/localDate'

export type StreakState = {
	current: number
	best: number
	/** Last local date when Daily Workout was completed. */
	lastCompletedDate: LocalDateString | null
}

export const EMPTY_STREAK: StreakState = {
	current: 0,
	best: 0,
	lastCompletedDate: null,
}

/**
 * Apply a daily completion on `today`.
 * Same-day repeat does not change streak.
 * Yesterday → increment; gap → reset to 1.
 */
export function applyDailyCompletion(
	state: StreakState,
	today: LocalDateString,
): StreakState {
	if (state.lastCompletedDate === today) {
		return {
			current: state.current,
			best: Math.max(state.best, state.current),
			lastCompletedDate: today,
		}
	}

	let nextCurrent = 1
	if (state.lastCompletedDate != null) {
		const diff = localDateDiffDays(today, state.lastCompletedDate)
		if (diff === 1) {
			nextCurrent = state.current + 1
		} else if (diff <= 0) {
			// Clock moved backwards — keep best, treat as same logical day or no-op bump.
			nextCurrent = Math.max(1, state.current)
		}
	}

	return {
		current: nextCurrent,
		best: Math.max(state.best, nextCurrent),
		lastCompletedDate: today,
	}
}
