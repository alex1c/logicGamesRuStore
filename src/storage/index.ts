/**
 * Minimal local persistence abstraction.
 * Ready to grow into workout history / streak / skill scores later.
 */

import AsyncStorage from '@react-native-async-storage/async-storage'

const KEYS = {
	onboardingVersion: '@fm/onboardingVersion',
	settings: '@fm/settings',
	demoWorkout: '@fm/demoWorkout',
	streakPlaceholder: '@fm/streakDays',
} as const

export type AppSettings = {
	/** Preferred color scheme; 'system' reserved for later. */
	theme: 'light' | 'dark' | 'system'
	soundEnabled: boolean
}

export const DEFAULT_SETTINGS: AppSettings = {
	theme: 'light',
	soundEnabled: true,
}

export type DemoWorkoutPersisted = {
	schemaVersion: 1
	sessionId: string
	puzzleIds: string[]
	currentIndex: number
	correctCount: number
	wrongCount: number
	hintsUsed: number
	startedAt: number
	/** Serialized answers status per index. */
	results: ('pending' | 'correct' | 'wrong')[]
}

async function readJson<T>(key: string): Promise<T | null> {
	try {
		const raw = await AsyncStorage.getItem(key)
		if (raw == null) {
			return null
		}
		return JSON.parse(raw) as T
	} catch {
		return null
	}
}

async function writeJson(key: string, value: unknown): Promise<void> {
	await AsyncStorage.setItem(key, JSON.stringify(value))
}

export async function getOnboardingVersion(): Promise<number> {
	const raw = await AsyncStorage.getItem(KEYS.onboardingVersion)
	if (raw == null) {
		return 0
	}
	const n = Number(raw)
	return Number.isFinite(n) ? n : 0
}

export async function setOnboardingVersion(version: number): Promise<void> {
	await AsyncStorage.setItem(KEYS.onboardingVersion, String(version))
}

export async function getSettings(): Promise<AppSettings> {
	const stored = await readJson<Partial<AppSettings>>(KEYS.settings)
	return { ...DEFAULT_SETTINGS, ...stored }
}

export async function saveSettings(
	settings: Partial<AppSettings>,
): Promise<AppSettings> {
	const current = await getSettings()
	const next = { ...current, ...settings }
	await writeJson(KEYS.settings, next)
	return next
}

export async function getDemoWorkout(): Promise<DemoWorkoutPersisted | null> {
	const value = await readJson<DemoWorkoutPersisted>(KEYS.demoWorkout)
	if (
		!value ||
		value.schemaVersion !== 1 ||
		typeof value.sessionId !== 'string' ||
		!Array.isArray(value.puzzleIds) ||
		!Array.isArray(value.results) ||
		![value.currentIndex, value.correctCount, value.wrongCount, value.hintsUsed, value.startedAt].every(Number.isFinite)
	) return null
	return value
}

export async function saveDemoWorkout(
	state: DemoWorkoutPersisted | null,
): Promise<void> {
	if (state == null) {
		await AsyncStorage.removeItem(KEYS.demoWorkout)
		return
	}
	await writeJson(KEYS.demoWorkout, state)
}

export async function clearDemoWorkout(): Promise<void> {
	await AsyncStorage.removeItem(KEYS.demoWorkout)
}

/** Streak is a placeholder until Phase 2 progress logic. */
export async function getStreakDays(): Promise<number> {
	const raw = await AsyncStorage.getItem(KEYS.streakPlaceholder)
	if (raw == null) {
		return 0
	}
	const n = Number(raw)
	return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0
}
