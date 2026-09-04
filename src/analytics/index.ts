/**
 * Central analytics facade. Game code calls trackEvent only.
 */

import {
	normalizeEventName,
	type AnalyticsEventName,
	type AnalyticsPayload,
} from '@/src/analytics/events'
import {
	initializeAnalytics,
	reportAnalyticsEvent,
} from '@/src/analytics/appMetrica'

type Listener = (name: AnalyticsEventName, payload?: AnalyticsPayload) => void

const listeners: Listener[] = []
let appOpenSent = false

export type { AnalyticsEventName, AnalyticsPayload }

export function addAnalyticsListener(listener: Listener): () => void {
	listeners.push(listener)
	return () => {
		const index = listeners.indexOf(listener)
		if (index >= 0) {
			listeners.splice(index, 1)
		}
	}
}

export function trackEvent(
	name: AnalyticsEventName,
	payload?: AnalyticsPayload,
): void {
	const normalized = normalizeEventName(name, payload)
	for (const listener of listeners) {
		try {
			listener(normalized, payload)
		} catch {
			// ignore
		}
	}
	reportAnalyticsEvent(normalized, payload)
}

export function bootstrapAnalytics(): void {
	initializeAnalytics()
	if (!appOpenSent) {
		appOpenSent = true
		trackEvent('app_open', {})
	}
}

export function resetAnalyticsFacadeForTests(): void {
	appOpenSent = false
	listeners.length = 0
}

// Re-export for gradual migration from features/progress/analyticsEvents
export { initializeAnalytics }
