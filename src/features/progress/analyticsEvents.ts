/**
 * Domain event bridge — re-exports centralized analytics facade.
 * Kept so existing imports from features/progress/analyticsEvents keep working.
 */

export {
	addAnalyticsListener,
	trackEvent,
	type AnalyticsEventName,
	type AnalyticsPayload,
} from '@/src/analytics'
