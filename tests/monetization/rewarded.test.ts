import {
	requestRewardedHint2,
	resetRewardedControllerForTests,
	__testOnlyMarkGranted,
} from '@/src/monetization/rewarded/controller'

describe('rewarded hint controller fallbacks', () => {
	beforeEach(() => {
		resetRewardedControllerForTests()
	})

	it('falls back freely when native ads unavailable (jest/node)', async () => {
		const ctx = {
			sessionId: 'sess-1',
			puzzleId: 'p1',
			puzzleIndex: 0,
		}
		const first = await requestRewardedHint2(ctx)
		expect(first.status).toBe('fallback')
		const second = await requestRewardedHint2(ctx)
		expect(second.status).toBe('busy')
	})

	it('blocks rapid duplicate grants for same puzzle context', async () => {
		const ctx = {
			sessionId: 'sess-2',
			puzzleId: 'p2',
			puzzleIndex: 1,
		}
		__testOnlyMarkGranted(ctx)
		const result = await requestRewardedHint2(ctx)
		expect(result.status).toBe('busy')
	})
})
