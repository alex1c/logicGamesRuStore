/**
 * Ads SDK bootstrap — after UI is usable. Never blocks Today.
 */

import { Platform } from 'react-native'
import { preloadInterstitial } from '@/src/monetization/interstitial/controller'
import { preloadRewarded } from '@/src/monetization/rewarded/controller'

let initialized = false

export async function initializeAds(): Promise<void> {
	if (initialized) {
		return
	}
	initialized = true
	if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
		return
	}
	try {
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const { MobileAds } = require('yandex-mobile-ads') as {
			MobileAds: {
				initialize: () => Promise<void> | void
				enableLogging?: (v: boolean) => void
			}
		}
		if (typeof __DEV__ !== 'undefined' && __DEV__) {
			MobileAds.enableLogging?.(true)
		}
		await MobileAds.initialize()
		void preloadInterstitial()
		void preloadRewarded()
	} catch {
		// Ads remain secondary — game continues offline.
	}
}

export function resetAdsInitForTests(): void {
	initialized = false
}
