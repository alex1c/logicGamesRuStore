/**
 * Deterministic PRNG (mulberry32) for puzzle generators.
 * Never use Math.random() inside generators — reproducibility by seed is required.
 */

export type RandomSource = {
	/** Next float in [0, 1). */
	next: () => number
	/** Integer in [min, max] inclusive. */
	nextInt: (min: number, max: number) => number
	/** Pick one element from a non-empty array. */
	pick: <T>(items: readonly T[]) => T
	/** Fisher–Yates shuffle; returns a new array. */
	shuffle: <T>(items: readonly T[]) => T[]
	/** Current seed used to initialize this source. */
	readonly seed: number
}

/**
 * Hash a string into a 32-bit unsigned integer seed.
 * Useful when composing generatorId + difficulty + user seed.
 */
export function hashSeed(input: string): number {
	let h = 2166136261 >>> 0
	for (let i = 0; i < input.length; i += 1) {
		h ^= input.charCodeAt(i)
		h = Math.imul(h, 16777619)
	}
	return h >>> 0
}

/**
 * Normalize any number into an unsigned 32-bit seed.
 */
export function normalizeSeed(seed: number): number {
	if (!Number.isFinite(seed)) {
		return 0
	}
	return seed >>> 0
}

/**
 * Create a deterministic random source from a numeric seed.
 */
export function createRng(seed: number): RandomSource {
	const normalized = normalizeSeed(seed)
	let state = normalized

	const next = (): number => {
		state = (state + 0x6d2b79f5) >>> 0
		let t = state
		t = Math.imul(t ^ (t >>> 15), t | 1)
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296
	}

	const nextInt = (min: number, max: number): number => {
		if (!Number.isInteger(min) || !Number.isInteger(max)) {
			throw new Error('nextInt requires integer bounds')
		}
		if (max < min) {
			throw new Error('nextInt max must be >= min')
		}
		if (min === max) {
			return min
		}
		const span = max - min + 1
		return min + Math.floor(next() * span)
	}

	const pick = <T>(items: readonly T[]): T => {
		if (items.length === 0) {
			throw new Error('pick requires a non-empty array')
		}
		return items[nextInt(0, items.length - 1)]
	}

	const shuffle = <T>(items: readonly T[]): T[] => {
		const copy = [...items]
		for (let i = copy.length - 1; i > 0; i -= 1) {
			const j = nextInt(0, i)
			const tmp = copy[i]
			copy[i] = copy[j]
			copy[j] = tmp
		}
		return copy
	}

	return {
		next,
		nextInt,
		pick,
		shuffle,
		seed: normalized,
	}
}

/**
 * Combine multiple seed parts into one stable numeric seed.
 */
export function combineSeeds(...parts: (string | number)[]): number {
	const joined = parts.map(String).join('::')
	return hashSeed(joined)
}
