/**
 * App-session interstitial runtime + persistence bridge.
 */

import {
	EMPTY_INTERSTITIAL_POLICY,
	evaluateInterstitialEligibility,
	recordCompletedSessionForAds,
	recordInterstitialShown,
	type InterstitialPolicyState,
} from '@/src/monetization/policy'
import {
	getAdPolicyState,
	saveAdPolicyState,
} from '@/src/storage'

let shownThisAppSession = false
/** __DEV__ only — never honored in production builds. */
let debugForceEligible = false

export function resetAdSessionRuntimeForTests(): void {
	shownThisAppSession = false
	debugForceEligible = false
}

export function markInterstitialShownThisAppSession(): void {
	shownThisAppSession = true
}

export function wasInterstitialShownThisAppSession(): boolean {
	return shownThisAppSession
}

/**
 * Debug-only override for emulator QA. No-op / ignored outside __DEV__.
 */
export function setDebugForceInterstitialEligible(force: boolean): void {
	if (typeof __DEV__ !== 'undefined' && __DEV__) {
		debugForceEligible = force
	}
}

export async function loadAdPolicy(): Promise<InterstitialPolicyState> {
	return getAdPolicyState()
}

export async function noteDurableSessionCompleted(
	sessionId: string,
): Promise<InterstitialPolicyState> {
	const current = await getAdPolicyState()
	const next = recordCompletedSessionForAds(current, sessionId)
	if (next !== current) {
		await saveAdPolicyState(next)
	}
	return next
}

export async function noteInterstitialShown(
	now = Date.now(),
): Promise<InterstitialPolicyState> {
	const current = await getAdPolicyState()
	const next = recordInterstitialShown(current, now)
	await saveAdPolicyState(next)
	shownThisAppSession = true
	return next
}

export async function checkInterstitialEligibility(
	now = Date.now(),
): Promise<ReturnType<typeof evaluateInterstitialEligibility>> {
	const state = await getAdPolicyState()
	return evaluateInterstitialEligibility({
		state,
		now,
		shownThisAppSession,
		debugForceEligible:
			typeof __DEV__ !== 'undefined' && __DEV__
				? debugForceEligible
				: false,
	})
}

export { EMPTY_INTERSTITIAL_POLICY }
