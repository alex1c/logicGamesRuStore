import {
	ADS_CONFIG,
	APP_IDENTITY,
	INTERSTITIAL_POLICY,
	isProductionAdBuild,
	resolveAdUnitId,
	YANDEX_DEMO_UNITS,
} from '@/src/monetization/config'
import {
	EMPTY_INTERSTITIAL_POLICY,
	evaluateInterstitialEligibility,
	recordCompletedSessionForAds,
	recordInterstitialShown,
} from '@/src/monetization/policy'

describe('production ad config invariants', () => {
	it('keeps production block IDs and disables unused formats', () => {
		expect(ADS_CONFIG.banner).toEqual({
			enabled: true,
			blockId: 'R-M-19984070-1',
		})
		expect(ADS_CONFIG.interstitial).toEqual({
			enabled: true,
			blockId: 'R-M-19984070-3',
		})
		expect(ADS_CONFIG.rewarded).toEqual({
			enabled: true,
			blockId: 'R-M-19984070-4',
		})
		expect(ADS_CONFIG.native.enabled).toBe(false)
		expect(ADS_CONFIG.appOpen.enabled).toBe(false)
		expect(ADS_CONFIG.feed.enabled).toBe(false)
		expect(ADS_CONFIG.native.blockId).toBe('R-M-19984070-2')
		expect(ADS_CONFIG.appOpen.blockId).toBe('R-M-19984070-5')
		expect(ADS_CONFIG.feed.blockId).toBe('R-M-19984070-6')
	})

	it('uses official demo units only outside production build flag', () => {
		// Jest runs with __DEV__ typically true → demo units.
		if (!isProductionAdBuild()) {
			expect(resolveAdUnitId('banner')).toBe(YANDEX_DEMO_UNITS.banner)
			expect(resolveAdUnitId('interstitial')).toBe(
				YANDEX_DEMO_UNITS.interstitial,
			)
			expect(resolveAdUnitId('rewarded')).toBe(YANDEX_DEMO_UNITS.rewarded)
		}
	})

	it('app identity matches release targets', () => {
		expect(APP_IDENTITY.name).toBe('Головоломка дня')
		expect(APP_IDENTITY.packageName).toBe('ru.forestmusic.logicgames')
		expect(APP_IDENTITY.version).toBe('1.0.0')
		expect(APP_IDENTITY.versionCode).toBe(1)
		expect(APP_IDENTITY.orientation).toBe('portrait')
		expect(APP_IDENTITY.supportEmail).toBe('rustore-alex1c@yandex.ru')
	})
})

describe('interstitial policy', () => {
	const cooldown = INTERSTITIAL_POLICY.cooldownMs

	it('protects first two completed sessions', () => {
		let state = EMPTY_INTERSTITIAL_POLICY
		state = recordCompletedSessionForAds(state, 's1')
		expect(
			evaluateInterstitialEligibility({
				state,
				now: 1_000_000,
				shownThisAppSession: false,
			}).eligible,
		).toBe(false)
		state = recordCompletedSessionForAds(state, 's2')
		expect(
			evaluateInterstitialEligibility({
				state,
				now: 1_000_000,
				shownThisAppSession: false,
			}).eligible,
		).toBe(false)
	})

	it('becomes eligible on third completed session', () => {
		let state = EMPTY_INTERSTITIAL_POLICY
		state = recordCompletedSessionForAds(state, 's1')
		state = recordCompletedSessionForAds(state, 's2')
		state = recordCompletedSessionForAds(state, 's3')
		expect(
			evaluateInterstitialEligibility({
				state,
				now: 1_000_000,
				shownThisAppSession: false,
			}),
		).toEqual({ eligible: true, reason: 'ok' })
	})

	it('requires 3 new sessions after a show', () => {
		let state = EMPTY_INTERSTITIAL_POLICY
		state = recordCompletedSessionForAds(state, 's1')
		state = recordCompletedSessionForAds(state, 's2')
		state = recordCompletedSessionForAds(state, 's3')
		state = recordInterstitialShown(state, 1_000_000)
		state = recordCompletedSessionForAds(state, 's4')
		expect(
			evaluateInterstitialEligibility({
				state,
				now: 1_000_000 + cooldown,
				shownThisAppSession: false,
			}).eligible,
		).toBe(false)
		state = recordCompletedSessionForAds(state, 's5')
		expect(
			evaluateInterstitialEligibility({
				state,
				now: 1_000_000 + cooldown,
				shownThisAppSession: false,
			}).eligible,
		).toBe(false)
		state = recordCompletedSessionForAds(state, 's6')
		expect(
			evaluateInterstitialEligibility({
				state,
				now: 1_000_000 + cooldown,
				shownThisAppSession: false,
			}).eligible,
		).toBe(true)
	})

	it('enforces cooldown and clock skew fail-safe', () => {
		let state = EMPTY_INTERSTITIAL_POLICY
		state = recordCompletedSessionForAds(state, 'a')
		state = recordCompletedSessionForAds(state, 'b')
		state = recordCompletedSessionForAds(state, 'c')
		state = recordInterstitialShown(state, 5_000_000)
		state = recordCompletedSessionForAds(state, 'd')
		state = recordCompletedSessionForAds(state, 'e')
		state = recordCompletedSessionForAds(state, 'f')
		expect(
			evaluateInterstitialEligibility({
				state,
				now: 5_000_000 + cooldown - 1,
				shownThisAppSession: false,
			}).reason,
		).toBe('cooldown')
		expect(
			evaluateInterstitialEligibility({
				state,
				now: 4_000_000,
				shownThisAppSession: false,
			}).reason,
		).toBe('clock_skew')
	})

	it('blocks second show in same app session', () => {
		let state = EMPTY_INTERSTITIAL_POLICY
		state = recordCompletedSessionForAds(state, 'x1')
		state = recordCompletedSessionForAds(state, 'x2')
		state = recordCompletedSessionForAds(state, 'x3')
		expect(
			evaluateInterstitialEligibility({
				state,
				now: 1,
				shownThisAppSession: true,
			}).reason,
		).toBe('app_session_cap')
	})

	it('ignores duplicate session ids', () => {
		let state = EMPTY_INTERSTITIAL_POLICY
		state = recordCompletedSessionForAds(state, 'dup')
		const again = recordCompletedSessionForAds(state, 'dup')
		expect(again.completedSessions).toBe(1)
		expect(again.processedSessionIds).toEqual(['dup'])
	})
})
