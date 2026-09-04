/**
 * Domain event names reserved for future AppMetrica wiring.
 * Emitters should call trackEvent() — analytics SDK stays out of generators.
 */

export type AnalyticsEventName =
	| 'workout_started'
	| 'workout_resumed'
	| 'workout_completed'
	| 'practice_started'
	| 'practice_completed'
	| 'puzzle_answered'
	| 'hint_used'
	| 'solution_revealed'
	| 'category_selected'
	| 'streak_updated'

export type AnalyticsPayload = Record<
	string,
	string | number | boolean | null | undefined
>

type Listener = (name: AnalyticsEventName, payload?: AnalyticsPayload) => void

const listeners: Listener[] = []

/** Subscribe a future analytics bridge without coupling to generators. */
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
	for (const listener of listeners) {
		try {
			listener(name, payload)
		} catch {
			// Never let analytics break gameplay.
		}
	}
}
