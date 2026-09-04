/**
 * Versioned app persistence (schema v2).
 * Demo schema v1 sessions are dropped safely; settings/profile migrate forward.
 */

import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Difficulty, PuzzleCategory } from '@/src/features/puzzles/types'
import type { SkillMap } from '@/src/features/progress/skillModel'
import { EMPTY_STREAK, type StreakState } from '@/src/features/progress/streak'
import type { LocalDateString } from '@/src/utils/localDate'
import { createRng } from '@/src/utils/prng'

export const STORAGE_SCHEMA_VERSION = 2 as const

const KEYS = {
	meta: '@fm/meta',
	settings: '@fm/settings',
	profile: '@fm/profile',
	skills: '@fm/skills',
	streak: '@fm/streak',
	activeSession: '@fm/activeSession',
	dailyCompletion: '@fm/dailyCompletion',
	sessionHistory: '@fm/sessionHistory',
	recentPuzzles: '@fm/recentPuzzles',
	/** Legacy Phase 1 / Codex demo key — cleared on migrate. */
	legacyDemoWorkout: '@fm/demoWorkout',
	legacyOnboarding: '@fm/onboardingVersion',
	legacyStreak: '@fm/streakDays',
} as const

export type AppSettings = {
	theme: 'light' | 'dark' | 'system'
	soundEnabled: boolean
	hapticsEnabled: boolean
}

export const DEFAULT_SETTINGS: AppSettings = {
	theme: 'light',
	soundEnabled: true,
	hapticsEnabled: true,
}

export type UserProfile = {
	/** Anonymous installation seed for daily workout identity. */
	profileSeed: number
	createdAt: number
}

export type SessionType = 'daily' | 'practice'

export type PuzzlePlanPersisted =
	| {
			source: 'generator'
			generatorId: string
			generatorVersion: number
			difficulty: Difficulty
			seed: number
			category: PuzzleCategory
	  }
	| {
			source: 'curated'
			curatedId: string
			category: PuzzleCategory
			difficulty: Difficulty
	  }

export type PuzzleResultPersisted = {
	status: 'pending' | 'correct' | 'wrong'
	hintsUsed: number
	revealedSolution: boolean
}

export type ActiveSessionPersisted = {
	schemaVersion: typeof STORAGE_SCHEMA_VERSION
	sessionId: string
	sessionType: SessionType
	/** Present for daily sessions. */
	workoutDate?: LocalDateString
	/** Present for practice. */
	practiceCategory?: PuzzleCategory
	title: string
	plan: PuzzlePlanPersisted[]
	puzzleIds: string[]
	currentIndex: number
	correctCount: number
	wrongCount: number
	hintsUsed: number
	startedAt: number
	/** Accumulated active elapsed before last pause (ms). */
	elapsedMs: number
	results: PuzzleResultPersisted[]
	finished: boolean
}

export type DailyCompletionPersisted = {
	schemaVersion: typeof STORAGE_SCHEMA_VERSION
	workoutDate: LocalDateString
	sessionId: string
	correctCount: number
	wrongCount: number
	hintsUsed: number
	elapsedMs: number
	categoryBreakdown: { category: PuzzleCategory; correct: number; total: number }[]
	completedAt: number
}

export type SessionHistoryItem = {
	sessionId: string
	sessionType: SessionType
	title: string
	workoutDate?: LocalDateString
	practiceCategory?: PuzzleCategory
	correctCount: number
	total: number
	hintsUsed: number
	elapsedMs: number
	completedAt: number
}

export type ProgressAggregates = {
	workoutsCompleted: number
	practiceCompleted: number
	puzzlesSolved: number
	puzzlesCorrect: number
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

type MetaState = {
	schemaVersion: number
}

let migrated = false

/**
 * Ensure storage is on schema v2. Safe to call repeatedly.
 * Drops incompatible demo sessions; preserves settings when possible.
 */
export async function ensureStorageMigrated(): Promise<void> {
	if (migrated) {
		return
	}
	const meta = await readJson<MetaState>(KEYS.meta)
	if (meta?.schemaVersion === STORAGE_SCHEMA_VERSION) {
		migrated = true
		return
	}

	// Drop legacy demo session — puzzle identity cannot be reliably rebuilt
	// into the new ActiveSessionPersisted plan format.
	await AsyncStorage.removeItem(KEYS.legacyDemoWorkout)

	const legacySettings = await readJson<Partial<AppSettings>>(KEYS.settings)
	if (legacySettings) {
		await writeJson(KEYS.settings, {
			...DEFAULT_SETTINGS,
			...legacySettings,
			hapticsEnabled:
				typeof legacySettings.hapticsEnabled === 'boolean'
					? legacySettings.hapticsEnabled
					: true,
		})
	}

	// Legacy streak placeholder was never a real completion streak — reset.
	await AsyncStorage.removeItem(KEYS.legacyStreak)

	await writeJson(KEYS.meta, { schemaVersion: STORAGE_SCHEMA_VERSION })
	migrated = true
}

export async function getSettings(): Promise<AppSettings> {
	await ensureStorageMigrated()
	const stored = await readJson<Partial<AppSettings>>(KEYS.settings)
	return { ...DEFAULT_SETTINGS, ...stored }
}

export async function saveSettings(
	patch: Partial<AppSettings>,
): Promise<AppSettings> {
	await ensureStorageMigrated()
	const current = await getSettings()
	const next = { ...current, ...patch }
	await writeJson(KEYS.settings, next)
	return next
}

function createProfileSeed(): number {
	const entropy = `${Date.now()}-${Math.floor(Math.random() * 1e9)}`
	return createRng(
		entropy.split('').reduce((acc, ch) => {
			acc = (Math.imul(acc ^ ch.charCodeAt(0), 16777619) >>> 0)
			return acc
		}, 2166136261),
	).seed
}

export async function getOrCreateProfile(): Promise<UserProfile> {
	await ensureStorageMigrated()
	const existing = await readJson<UserProfile>(KEYS.profile)
	if (
		existing &&
		Number.isFinite(existing.profileSeed) &&
		Number.isFinite(existing.createdAt)
	) {
		return existing
	}
	const profile: UserProfile = {
		profileSeed: createProfileSeed(),
		createdAt: Date.now(),
	}
	await writeJson(KEYS.profile, profile)
	return profile
}

/** Test helper — set a fixed profile seed. */
export async function setProfileForTests(profile: UserProfile): Promise<void> {
	await ensureStorageMigrated()
	await writeJson(KEYS.profile, profile)
}

export async function getSkills(): Promise<SkillMap> {
	await ensureStorageMigrated()
	return (await readJson<SkillMap>(KEYS.skills)) ?? {}
}

export async function saveSkills(skills: SkillMap): Promise<void> {
	await ensureStorageMigrated()
	await writeJson(KEYS.skills, skills)
}

export async function getStreakState(): Promise<StreakState> {
	await ensureStorageMigrated()
	const stored = await readJson<StreakState>(KEYS.streak)
	if (!stored) {
		return { ...EMPTY_STREAK }
	}
	return {
		current: Number.isFinite(stored.current) ? Math.max(0, stored.current) : 0,
		best: Number.isFinite(stored.best) ? Math.max(0, stored.best) : 0,
		lastCompletedDate: stored.lastCompletedDate ?? null,
	}
}

export async function saveStreakState(state: StreakState): Promise<void> {
	await ensureStorageMigrated()
	await writeJson(KEYS.streak, state)
}

export async function getActiveSession(): Promise<ActiveSessionPersisted | null> {
	await ensureStorageMigrated()
	const value = await readJson<ActiveSessionPersisted>(KEYS.activeSession)
	if (!value || value.schemaVersion !== STORAGE_SCHEMA_VERSION) {
		return null
	}
	if (!Array.isArray(value.plan) || !Array.isArray(value.results)) {
		return null
	}
	return value
}

export async function saveActiveSession(
	state: ActiveSessionPersisted | null,
): Promise<void> {
	await ensureStorageMigrated()
	if (state == null) {
		await AsyncStorage.removeItem(KEYS.activeSession)
		return
	}
	await writeJson(KEYS.activeSession, state)
}

export async function getDailyCompletion(
	workoutDate: LocalDateString,
): Promise<DailyCompletionPersisted | null> {
	await ensureStorageMigrated()
	const value = await readJson<DailyCompletionPersisted>(KEYS.dailyCompletion)
	if (
		!value ||
		value.schemaVersion !== STORAGE_SCHEMA_VERSION ||
		value.workoutDate !== workoutDate
	) {
		return null
	}
	return value
}

export async function getAnyDailyCompletion(): Promise<DailyCompletionPersisted | null> {
	await ensureStorageMigrated()
	const value = await readJson<DailyCompletionPersisted>(KEYS.dailyCompletion)
	if (!value || value.schemaVersion !== STORAGE_SCHEMA_VERSION) {
		return null
	}
	return value
}

export async function saveDailyCompletion(
	value: DailyCompletionPersisted,
): Promise<void> {
	await ensureStorageMigrated()
	await writeJson(KEYS.dailyCompletion, value)
}

const HISTORY_LIMIT = 20

export async function getSessionHistory(): Promise<SessionHistoryItem[]> {
	await ensureStorageMigrated()
	const list = await readJson<SessionHistoryItem[]>(KEYS.sessionHistory)
	return Array.isArray(list) ? list : []
}

export async function appendSessionHistory(
	item: SessionHistoryItem,
): Promise<void> {
	await ensureStorageMigrated()
	const list = await getSessionHistory()
	const next = [item, ...list].slice(0, HISTORY_LIMIT)
	await writeJson(KEYS.sessionHistory, next)
}

const RECENT_LIMIT = 80

export async function getRecentPuzzleIds(): Promise<string[]> {
	await ensureStorageMigrated()
	const list = await readJson<string[]>(KEYS.recentPuzzles)
	return Array.isArray(list) ? list : []
}

export async function pushRecentPuzzleIds(ids: string[]): Promise<void> {
	await ensureStorageMigrated()
	const current = await getRecentPuzzleIds()
	const merged = [...ids, ...current.filter((id) => !ids.includes(id))]
	await writeJson(KEYS.recentPuzzles, merged.slice(0, RECENT_LIMIT))
}

export async function getProgressAggregates(): Promise<ProgressAggregates> {
	const history = await getSessionHistory()
	let workoutsCompleted = 0
	let practiceCompleted = 0
	let puzzlesSolved = 0
	let puzzlesCorrect = 0
	for (const item of history) {
		if (item.sessionType === 'daily') {
			workoutsCompleted += 1
		} else {
			practiceCompleted += 1
		}
		puzzlesSolved += item.total
		puzzlesCorrect += item.correctCount
	}
	return {
		workoutsCompleted,
		practiceCompleted,
		puzzlesSolved,
		puzzlesCorrect,
	}
}

/** @deprecated Use getStreakState — kept for transitional UI. */
export async function getStreakDays(): Promise<number> {
	const state = await getStreakState()
	return state.current
}
