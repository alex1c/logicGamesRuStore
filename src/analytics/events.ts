/**
 * Typed analytics event catalog for AppMetrica bridge.
 */

export type AnalyticsEventName =
	| 'app_open'
	| 'daily_started'
	| 'daily_resumed'
	| 'daily_completed'
	| 'practice_started'
	| 'practice_completed'
	| 'puzzle_answered'
	| 'hint_used'
	| 'solution_revealed'
	| 'category_selected'
	| 'achievement_unlocked'
	| 'streak_updated'
	| 'ad_banner_loaded'
	| 'ad_banner_failed'
	| 'ad_interstitial_loaded'
	| 'ad_interstitial_shown'
	| 'ad_interstitial_failed'
	| 'ad_rewarded_loaded'
	| 'ad_rewarded_shown'
	| 'ad_rewarded_completed'
	| 'ad_rewarded_failed'
	/** @deprecated mapped to daily_* for legacy callers */
	| 'workout_started'
	| 'workout_resumed'
	| 'workout_completed'

export type AnalyticsPayload = Record<
	string,
	string | number | boolean | null | undefined
>

/** Normalize legacy workout_* names to daily_* when session is daily. */
export function normalizeEventName(
	name: AnalyticsEventName,
	payload?: AnalyticsPayload,
): AnalyticsEventName {
	if (name === 'workout_started') {
		return 'daily_started'
	}
	if (name === 'workout_resumed') {
		return 'daily_resumed'
	}
	if (name === 'workout_completed') {
		return 'daily_completed'
	}
	void payload
	return name
}

/** Strip prohibited fields before SDK export. */
export function sanitizePayload(
	payload?: AnalyticsPayload,
): Record<string, string | number | boolean> | undefined {
	if (!payload) {
		return undefined
	}
	const banned = new Set([
		'profileSeed',
		'seed',
		'answer',
		'rawAnswer',
		'explanation',
		'prompt',
		'deviceId',
		'androidId',
		'advertisingId',
		'imei',
		'email',
		'storage',
	])
	const out: Record<string, string | number | boolean> = {}
	for (const [key, value] of Object.entries(payload)) {
		if (banned.has(key) || value == null) {
			continue
		}
		if (
			typeof value === 'string' ||
			typeof value === 'number' ||
			typeof value === 'boolean'
		) {
			out[key] = value
		}
	}
	return Object.keys(out).length > 0 ? out : undefined
}
