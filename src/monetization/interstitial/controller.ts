/**
 * Interstitial load/show controller. Screens call maybeShowInterstitial only.
 */

import { Platform } from 'react-native'
import { resolveAdUnitId, INTERSTITIAL_POLICY } from '@/src/monetization/config'
import {
	checkInterstitialEligibility,
	markInterstitialShownThisAppSession,
	noteInterstitialShown,
	wasInterstitialShownThisAppSession,
} from '@/src/monetization/session'
import { trackEvent } from '@/src/analytics'
import { isStoreScreenshotMode } from '@/src/constants/screenshotMode'

type LoadedInterstitial = {
	show: () => void
	onAdShown?: () => void
	onAdFailedToShow?: (error: unknown) => void
	onAdDismissed?: () => void
}

let cachedAd: LoadedInterstitial | null = null
let loading = false
let showInFlight = false

function canUseNativeAds(): boolean {
	return Platform.OS === 'android' || Platform.OS === 'ios'
}

async function loadSdkModules(): Promise<{
	InterstitialAdLoader: {
		create: () => Promise<{
			loadAd: (config: { adUnitId: string }) => Promise<LoadedInterstitial>
		}>
	}
} | null> {
	try {
		// Dynamic require keeps Jest/web from hard-failing on native module.
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const mod = require('yandex-mobile-ads') as {
			InterstitialAdLoader: {
				create: () => Promise<{
					loadAd: (config: { adUnitId: string }) => Promise<LoadedInterstitial>
				}>
			}
		}
		return mod
	} catch {
		return null
	}
}

export async function preloadInterstitial(): Promise<void> {
	if (!canUseNativeAds() || loading || cachedAd) {
		return
	}
	const unitId = resolveAdUnitId('interstitial')
	if (!unitId) {
		return
	}
	loading = true
	try {
		const sdk = await loadSdkModules()
		if (!sdk) {
			return
		}
		const loader = await sdk.InterstitialAdLoader.create()
		const ad = await loader.loadAd({ adUnitId: unitId })
		cachedAd = ad
		trackEvent('ad_interstitial_loaded', {
			placement: INTERSTITIAL_POLICY.placement,
		})
	} catch {
		cachedAd = null
		trackEvent('ad_interstitial_failed', {
			placement: INTERSTITIAL_POLICY.placement,
			stage: 'load',
		})
	} finally {
		loading = false
	}
}

/**
 * Show interstitial only when policy + loaded ad allow it.
 * Never blocks navigation with a spinner — resolves when closed or skipped.
 */
export async function maybeShowInterstitial(): Promise<'shown' | 'skipped'> {
	// Never interrupt RuStore screenshot capture with ads.
	if (isStoreScreenshotMode) {
		return 'skipped'
	}
	if (showInFlight || wasInterstitialShownThisAppSession()) {
		return 'skipped'
	}
	const eligibility = await checkInterstitialEligibility()
	if (!eligibility.eligible) {
		return 'skipped'
	}
	if (!cachedAd) {
		await preloadInterstitial()
	}
	const ad = cachedAd
	if (!ad) {
		return 'skipped'
	}

	showInFlight = true
	cachedAd = null
	return new Promise((resolve) => {
		let settled = false
		let didShow = false
		const finish = async (outcome: 'shown' | 'skipped') => {
			if (settled) {
				return
			}
			settled = true
			showInFlight = false
			if (outcome === 'shown') {
				markInterstitialShownThisAppSession()
				await noteInterstitialShown()
				trackEvent('ad_interstitial_shown', {
					placement: INTERSTITIAL_POLICY.placement,
				})
			}
			void preloadInterstitial()
			resolve(outcome)
		}

		ad.onAdShown = () => {
			didShow = true
		}
		ad.onAdFailedToShow = () => {
			trackEvent('ad_interstitial_failed', {
				placement: INTERSTITIAL_POLICY.placement,
				stage: 'show',
			})
			void finish('skipped')
		}
		ad.onAdDismissed = () => {
			void finish(didShow ? 'shown' : 'skipped')
		}

		try {
			ad.show()
		} catch {
			trackEvent('ad_interstitial_failed', {
				placement: INTERSTITIAL_POLICY.placement,
				stage: 'show_throw',
			})
			void finish('skipped')
		}
	})
}

export function resetInterstitialControllerForTests(): void {
	cachedAd = null
	loading = false
	showInFlight = false
}
