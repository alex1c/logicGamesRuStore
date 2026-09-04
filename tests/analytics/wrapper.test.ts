import {
	bootstrapAnalytics,
	resetAnalyticsFacadeForTests,
	trackEvent,
} from '@/src/analytics'
import {
	resetAnalyticsForTests,
	setAnalyticsAdapterForTests,
	initializeAnalytics,
	isAnalyticsActivated,
	reportAnalyticsEvent,
} from '@/src/analytics/appMetrica'
import { sanitizePayload } from '@/src/analytics/events'

describe('analytics wrapper', () => {
	beforeEach(() => {
		resetAnalyticsForTests()
		resetAnalyticsFacadeForTests()
	})

	it('survives unavailable adapter and init throws', () => {
		setAnalyticsAdapterForTests({
			activate: () => {
				throw new Error('boom')
			},
			reportEvent: () => {
				throw new Error('boom2')
			},
		})
		expect(() => initializeAnalytics()).not.toThrow()
		expect(() =>
			reportAnalyticsEvent('app_open', { category: 'logic' }),
		).not.toThrow()
	})

	it('initializes once and reports app_open once', () => {
		const events: string[] = []
		setAnalyticsAdapterForTests({
			activate: () => {
				events.push('activate')
			},
			reportEvent: (name) => {
				events.push(name)
			},
		})
		bootstrapAnalytics()
		bootstrapAnalytics()
		expect(events.filter((e) => e === 'activate')).toHaveLength(1)
		expect(events.filter((e) => e === 'app_open')).toHaveLength(1)
		expect(isAnalyticsActivated()).toBe(true)
	})

	it('maps legacy workout events to daily_*', () => {
		const names: string[] = []
		setAnalyticsAdapterForTests({
			activate: () => undefined,
			reportEvent: (name) => {
				names.push(name)
			},
		})
		initializeAnalytics()
		trackEvent('workout_started', { sessionType: 'daily' })
		trackEvent('workout_completed', {})
		expect(names).toEqual(
			expect.arrayContaining(['daily_started', 'daily_completed']),
		)
	})

	it('sanitizes banned payload fields', () => {
		expect(
			sanitizePayload({
				category: 'math',
				seed: 123,
				profileSeed: 9,
				answer: 'secret',
				correct: true,
			}),
		).toEqual({ category: 'math', correct: true })
	})

	it('does not crash when reportEvent rejects conceptually via throw', () => {
		setAnalyticsAdapterForTests({
			activate: () => undefined,
			reportEvent: () => {
				throw new Error('network')
			},
		})
		initializeAnalytics()
		expect(() => trackEvent('puzzle_answered', { correct: true })).not.toThrow()
	})
})
