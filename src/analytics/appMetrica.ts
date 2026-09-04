/**
 * AppMetrica SDK adapter — failure-safe, init-once.
 */

import { Platform } from 'react-native'
import { APPMETRICA_API_KEY, APP_IDENTITY } from '@/src/monetization/config'
import type { AnalyticsEventName, AnalyticsPayload } from '@/src/analytics/events'
import { sanitizePayload } from '@/src/analytics/events'

export type AnalyticsAdapter = {
	activate: () => void
	reportEvent: (name: string, payload?: Record<string, string | number | boolean>) => void
}

let activated = false
let adapter: AnalyticsAdapter | null = null

function createNativeAdapter(): AnalyticsAdapter | null {
	if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
		return null
	}
	try {
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const AppMetrica = require('@appmetrica/react-native-analytics').default as {
			activate: (config: Record<string, unknown>) => void
			reportEvent: (name: string, attrs?: Record<string, unknown>) => void
		}
		return {
			activate: () => {
				AppMetrica.activate({
					apiKey: APPMETRICA_API_KEY,
					appVersion: APP_IDENTITY.version,
					sessionTimeout: 120,
					logs: typeof __DEV__ !== 'undefined' && __DEV__,
					locationTracking: false,
					statisticsSending: true,
				})
			},
			reportEvent: (name, payload) => {
				AppMetrica.reportEvent(name, payload)
			},
		}
	} catch {
		return null
	}
}

export function setAnalyticsAdapterForTests(next: AnalyticsAdapter | null): void {
	adapter = next
	activated = false
}

export function resetAnalyticsForTests(): void {
	adapter = null
	activated = false
}

export function initializeAnalytics(): void {
	if (activated) {
		return
	}
	activated = true
	try {
		if (!adapter) {
			adapter = createNativeAdapter()
		}
		adapter?.activate()
	} catch {
		adapter = null
	}
}

export function reportAnalyticsEvent(
	name: AnalyticsEventName,
	payload?: AnalyticsPayload,
): void {
	try {
		if (!activated) {
			initializeAnalytics()
		}
		const clean = sanitizePayload(payload)
		adapter?.reportEvent(name, clean)
	} catch {
		// Never throw to callers.
	}
}

export function isAnalyticsActivated(): boolean {
	return activated
}
