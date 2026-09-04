/**
 * Rewarded ad controller for Hint 2.
 * Reward only on confirmed onRewarded callback; free fallback on failure.
 */

import { Platform } from 'react-native'
import { REWARDED_POLICY, resolveAdUnitId } from '@/src/monetization/config'
import { trackEvent } from '@/src/analytics'

export type RewardedContext = {
	sessionId: string
	puzzleId: string
	puzzleIndex: number
}

export type RewardedHintResult =
	| { status: 'rewarded'; context: RewardedContext }
	| { status: 'fallback'; context: RewardedContext; reason: string }
	| { status: 'cancelled'; context: RewardedContext }
	| { status: 'busy' }

type LoadedRewarded = {
	show: () => void
	onAdShown?: () => void
	onAdFailedToShow?: (error: unknown) => void
	onAdDismissed?: () => void
	onRewarded?: (reward: unknown) => void
}

let cachedAd: LoadedRewarded | null = null
let loading = false
let inFlightKey: string | null = null
const grantedKeys = new Set<string>()

function contextKey(ctx: RewardedContext): string {
	return `${ctx.sessionId}::${ctx.puzzleId}::${ctx.puzzleIndex}`
}

function canUseNativeAds(): boolean {
	return Platform.OS === 'android' || Platform.OS === 'ios'
}

async function loadSdkModules(): Promise<{
	RewardedAdLoader: {
		create: () => Promise<{
			loadAd: (config: { adUnitId: string }) => Promise<LoadedRewarded>
		}>
	}
} | null> {
	try {
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		return require('yandex-mobile-ads') as {
			RewardedAdLoader: {
				create: () => Promise<{
					loadAd: (config: { adUnitId: string }) => Promise<LoadedRewarded>
				}>
			}
		}
	} catch {
		return null
	}
}

export async function preloadRewarded(): Promise<void> {
	if (!canUseNativeAds() || loading || cachedAd) {
		return
	}
	const unitId = resolveAdUnitId('rewarded')
	if (!unitId) {
		return
	}
	loading = true
	try {
		const sdk = await loadSdkModules()
		if (!sdk) {
			return
		}
		const loader = await sdk.RewardedAdLoader.create()
		cachedAd = await loader.loadAd({ adUnitId: unitId })
		trackEvent('ad_rewarded_loaded', {
			placement: REWARDED_POLICY.placement,
		})
	} catch {
		cachedAd = null
		trackEvent('ad_rewarded_failed', {
			placement: REWARDED_POLICY.placement,
			stage: 'load',
		})
	} finally {
		loading = false
	}
}

/**
 * Request Hint 2 via rewarded ad. Falls back to free grant when unavailable.
 */
export async function requestRewardedHint2(
	context: RewardedContext,
): Promise<RewardedHintResult> {
	const key = contextKey(context)
	if (grantedKeys.has(key)) {
		return { status: 'busy' }
	}
	if (inFlightKey != null) {
		return { status: 'busy' }
	}
	inFlightKey = key

	const finishBusy = () => {
		inFlightKey = null
	}

	if (!canUseNativeAds()) {
		finishBusy()
		if (REWARDED_POLICY.freeFallbackWhenUnavailable) {
			grantedKeys.add(key)
			return { status: 'fallback', context, reason: 'unsupported_platform' }
		}
		return { status: 'cancelled', context }
	}

	if (!cachedAd) {
		await preloadRewarded()
	}
	const ad = cachedAd
	if (!ad) {
		finishBusy()
		trackEvent('ad_rewarded_failed', {
			placement: REWARDED_POLICY.placement,
			stage: 'unavailable',
		})
		if (REWARDED_POLICY.freeFallbackWhenUnavailable) {
			grantedKeys.add(key)
			return { status: 'fallback', context, reason: 'no_fill' }
		}
		return { status: 'cancelled', context }
	}

	cachedAd = null
	return new Promise((resolve) => {
		let rewarded = false
		let settled = false
		const settle = (result: RewardedHintResult) => {
			if (settled) {
				return
			}
			settled = true
			finishBusy()
			void preloadRewarded()
			resolve(result)
		}

		ad.onRewarded = () => {
			if (grantedKeys.has(key)) {
				return
			}
			rewarded = true
			grantedKeys.add(key)
			trackEvent('ad_rewarded_completed', {
				placement: REWARDED_POLICY.placement,
			})
			settle({ status: 'rewarded', context })
		}
		ad.onAdShown = () => {
			trackEvent('ad_rewarded_shown', {
				placement: REWARDED_POLICY.placement,
			})
		}
		ad.onAdFailedToShow = () => {
			trackEvent('ad_rewarded_failed', {
				placement: REWARDED_POLICY.placement,
				stage: 'show',
			})
			if (REWARDED_POLICY.freeFallbackWhenUnavailable) {
				grantedKeys.add(key)
				settle({ status: 'fallback', context, reason: 'show_fail' })
			} else {
				settle({ status: 'cancelled', context })
			}
		}
		ad.onAdDismissed = () => {
			if (rewarded) {
				return
			}
			// Close without reward must not grant; user can retry or use free Hint 1 only.
			settle({ status: 'cancelled', context })
		}

		try {
			ad.show()
		} catch {
			trackEvent('ad_rewarded_failed', {
				placement: REWARDED_POLICY.placement,
				stage: 'show_throw',
			})
			if (REWARDED_POLICY.freeFallbackWhenUnavailable) {
				grantedKeys.add(key)
				settle({ status: 'fallback', context, reason: 'show_throw' })
			} else {
				settle({ status: 'cancelled', context })
			}
		}
	})
}

export function resetRewardedControllerForTests(): void {
	cachedAd = null
	loading = false
	inFlightKey = null
	grantedKeys.clear()
}

export function __testOnlyMarkGranted(context: RewardedContext): void {
	grantedKeys.add(contextKey(context))
}
