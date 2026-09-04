/**
 * Deterministic daily workout seed from local date + profile seed.
 */

import { combineSeeds, createRng } from '@/src/utils/prng'
import type { LocalDateString } from '@/src/utils/localDate'

export function buildDailySeed(
	workoutDate: LocalDateString,
	profileSeed: number,
): number {
	return combineSeeds('daily.v1', workoutDate, profileSeed)
}

export function createDailyRng(
	workoutDate: LocalDateString,
	profileSeed: number,
) {
	return createRng(buildDailySeed(workoutDate, profileSeed))
}
