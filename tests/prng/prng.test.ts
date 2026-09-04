import { createRng, hashSeed, normalizeSeed } from '@/src/utils/prng'

describe('PRNG (mulberry32)', () => {
	it('produces the same sequence for the same seed', () => {
		const a = createRng(42)
		const b = createRng(42)
		const seqA = Array.from({ length: 20 }, () => a.next())
		const seqB = Array.from({ length: 20 }, () => b.next())
		expect(seqA).toEqual(seqB)
	})

	it('usually diverges for different seeds', () => {
		const a = createRng(1)
		const b = createRng(2)
		const seqA = Array.from({ length: 10 }, () => a.next())
		const seqB = Array.from({ length: 10 }, () => b.next())
		expect(seqA).not.toEqual(seqB)
	})

	it('nextInt stays within inclusive bounds', () => {
		const rng = createRng(7)
		for (let i = 0; i < 200; i += 1) {
			const n = rng.nextInt(3, 8)
			expect(n).toBeGreaterThanOrEqual(3)
			expect(n).toBeLessThanOrEqual(8)
			expect(Number.isInteger(n)).toBe(true)
		}
	})

	it('hashSeed is stable', () => {
		expect(hashSeed('abc')).toBe(hashSeed('abc'))
		expect(hashSeed('abc')).not.toBe(hashSeed('abd'))
	})

	it('normalizeSeed handles non-finite values', () => {
		expect(normalizeSeed(Number.NaN)).toBe(0)
		expect(normalizeSeed(Number.POSITIVE_INFINITY)).toBe(0)
	})

	it('shuffle is deterministic for a seed', () => {
		const items = [1, 2, 3, 4, 5, 6]
		expect(createRng(99).shuffle(items)).toEqual(createRng(99).shuffle(items))
	})
})
