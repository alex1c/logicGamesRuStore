/**
 * Central production monetization + analytics identity config.
 * Screens must not hardcode Yandex block IDs or AppMetrica keys.
 */

export const APP_IDENTITY = {
	name: 'Головоломка дня',
	packageName: 'ru.forestmusic.logicgames',
	version: '1.0.0',
	versionCode: 1,
	orientation: 'portrait' as const,
	supportEmail: 'rustore-alex1c@yandex.ru',
	developerWebsite: 'https://forest-music.ru',
	tagline:
		'Головоломка дня — логика, математика, спички и короткие задачи для ума.',
	dailyLoop: '10 задач · около 5 минут · каждый день',
} as const

/** Production AppMetrica API key — do not log in production. */
export const APPMETRICA_API_KEY =
	'94ee3d21-3aef-46be-b826-9c1591c2ff19'

export type AdFormatKey =
	| 'banner'
	| 'native'
	| 'interstitial'
	| 'rewarded'
	| 'appOpen'
	| 'feed'

export type AdFormatConfig = {
	enabled: boolean
	blockId: string
}

/**
 * Official Yandex demo unit IDs for development/native smoke only.
 * Never used when __DEV__ is false.
 */
export const YANDEX_DEMO_UNITS = {
	banner: 'demo-banner-yandex',
	interstitial: 'demo-interstitial-yandex',
	rewarded: 'demo-rewarded-yandex',
} as const

export const ADS_CONFIG: Record<AdFormatKey, AdFormatConfig> = {
	banner: { enabled: true, blockId: 'R-M-19984070-1' },
	native: { enabled: false, blockId: 'R-M-19984070-2' },
	interstitial: { enabled: true, blockId: 'R-M-19984070-3' },
	rewarded: { enabled: true, blockId: 'R-M-19984070-4' },
	appOpen: { enabled: false, blockId: 'R-M-19984070-5' },
	feed: { enabled: false, blockId: 'R-M-19984070-6' },
}

export const INTERSTITIAL_POLICY = {
	/** First N completed sessions never show interstitial. */
	firstUseProtectedSessions: 2,
	/** First eligible exit is on this completed-session ordinal. */
	firstEligibleAtCompletedSessions: 3,
	/** After a show, require this many new completed sessions. */
	sessionsGapAfterShow: 3,
	/** Minimum ms between actual interstitial shows. */
	cooldownMs: 5 * 60 * 1000,
	maxPerAppSession: 1,
	placement: 'session_result_exit' as const,
}

export const REWARDED_POLICY = {
	placement: 'puzzle_hint_2' as const,
	/** Fallback grant Hint 2 when SDK unavailable / no-fill. */
	freeFallbackWhenUnavailable: true,
}

export type BannerPlacement = 'today' | 'play' | 'progress'

export function resolveAdUnitId(
	format: 'banner' | 'interstitial' | 'rewarded',
): string | null {
	const entry = ADS_CONFIG[format]
	if (!entry.enabled) {
		return null
	}
	if (typeof __DEV__ !== 'undefined' && __DEV__) {
		return YANDEX_DEMO_UNITS[format]
	}
	return entry.blockId
}

export function isProductionAdBuild(): boolean {
	return typeof __DEV__ === 'undefined' || __DEV__ === false
}
