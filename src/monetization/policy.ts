/**
 * Pure interstitial eligibility policy — no SDK imports.
 */

import {
	INTERSTITIAL_POLICY,
	type BannerPlacement,
} from '@/src/monetization/config'

export type InterstitialPolicyState = {
	/** Durable completed game sessions counted for ads (idempotent by sessionId). */
	completedSessions: number
	/** Completed sessions since the last actual interstitial show. */
	sessionsSinceLastShow: number
	/** Timestamp of last actual interstitial show, or null if never. */
	lastShownAt: number | null
	/** Bounded set of already-counted session ids. */
	processedSessionIds: string[]
}

export const EMPTY_INTERSTITIAL_POLICY: InterstitialPolicyState = {
	completedSessions: 0,
	sessionsSinceLastShow: 0,
	lastShownAt: null,
	processedSessionIds: [],
}

export type EligibilityInput = {
	state: InterstitialPolicyState
	now: number
	shownThisAppSession: boolean
	/** __DEV__-only override; ignored when force is false/undefined. */
	debugForceEligible?: boolean
}

export type EligibilityResult = {
	eligible: boolean
	reason:
		| 'ok'
		| 'app_session_cap'
		| 'first_use'
		| 'session_gap'
		| 'cooldown'
		| 'clock_skew'
		| 'debug_force'
}

export function evaluateInterstitialEligibility(
	input: EligibilityInput,
): EligibilityResult {
	if (input.debugForceEligible === true) {
		return { eligible: true, reason: 'debug_force' }
	}
	if (input.shownThisAppSession) {
		return { eligible: false, reason: 'app_session_cap' }
	}
	const { state, now } = input
	if (state.lastShownAt != null && state.lastShownAt > now) {
		return { eligible: false, reason: 'clock_skew' }
	}
	if (
		state.completedSessions <
		INTERSTITIAL_POLICY.firstEligibleAtCompletedSessions
	) {
		return { eligible: false, reason: 'first_use' }
	}
	if (state.lastShownAt == null) {
		return { eligible: true, reason: 'ok' }
	}
	if (
		state.sessionsSinceLastShow < INTERSTITIAL_POLICY.sessionsGapAfterShow
	) {
		return { eligible: false, reason: 'session_gap' }
	}
	if (now - state.lastShownAt < INTERSTITIAL_POLICY.cooldownMs) {
		return { eligible: false, reason: 'cooldown' }
	}
	return { eligible: true, reason: 'ok' }
}

const PROCESSED_IDS_LIMIT = 40

/**
 * Record a newly finalized game session for ad counters.
 * Returns previous state unchanged if sessionId already processed.
 */
export function recordCompletedSessionForAds(
	state: InterstitialPolicyState,
	sessionId: string,
): InterstitialPolicyState {
	if (!sessionId || state.processedSessionIds.includes(sessionId)) {
		return state
	}
	return {
		...state,
		completedSessions: state.completedSessions + 1,
		sessionsSinceLastShow: state.sessionsSinceLastShow + 1,
		processedSessionIds: [sessionId, ...state.processedSessionIds].slice(
			0,
			PROCESSED_IDS_LIMIT,
		),
	}
}

export function recordInterstitialShown(
	state: InterstitialPolicyState,
	now: number,
): InterstitialPolicyState {
	return {
		...state,
		lastShownAt: now,
		sessionsSinceLastShow: 0,
	}
}

export function isValidBannerPlacement(
	value: string,
): value is BannerPlacement {
	return value === 'today' || value === 'play' || value === 'progress'
}
