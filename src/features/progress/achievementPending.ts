import type { UnlockedAchievement } from '@/src/features/progress/achievements'

/** Ephemeral newly unlocked achievements for Result UI / toast. */
let pending: UnlockedAchievement[] = []

export function setPendingAchievements(list: UnlockedAchievement[]): void {
	pending = list
}

export function consumePendingAchievements(): UnlockedAchievement[] {
	const list = pending
	pending = []
	return list
}

export function peekPendingAchievements(): UnlockedAchievement[] {
	return pending
}
