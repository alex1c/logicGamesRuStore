import type { Difficulty, SelectItemPuzzle } from '../types'
import {
	buildPuzzleId,
	createGeneratorRng,
	type GeneratePuzzleInput,
	type PuzzleGenerator,
} from '../engine/generator'
import type { RandomSource } from '@/src/utils/prng'

const IDENTITY = {
	generatorId: 'odd_one_out.numbers.v1',
	version: 1,
} as const

type PropertyKind =
	| 'parity_even'
	| 'parity_odd'
	| 'divisible_by'
	| 'perfect_square'
	| 'prime'

const SMALL_PRIMES = [11, 13, 17, 19, 23, 29, 31] as const
const SMALL_SQUARES = [16, 25, 36, 49, 64, 81] as const

function kindsForDifficulty(difficulty: Difficulty): PropertyKind[] {
	if (difficulty <= 2) {
		return ['parity_even', 'parity_odd']
	}
	if (difficulty === 3) {
		return ['parity_even', 'parity_odd', 'divisible_by']
	}
	if (difficulty === 4) {
		return ['divisible_by', 'perfect_square']
	}
	return ['perfect_square', 'prime']
}

function uniquePush(list: number[], value: number, max = 80): boolean {
	if (!Number.isFinite(value) || value < 1 || value > max) {
		return false
	}
	if (list.includes(value)) {
		return false
	}
	list.push(value)
	return true
}

function buildParity(
	rng: RandomSource,
	majorityEven: boolean,
): {
	numbers: number[]
	oddIndex: number
	hint1: string
	hint2: string
	explanation: string
	mechanic: string
} {
	const majority: number[] = []
	while (majority.length < 3) {
		const n = rng.nextInt(10, 40)
		if (majorityEven ? n % 2 === 0 : n % 2 === 1) {
			uniquePush(majority, n)
		}
	}
	let oddOne = rng.nextInt(10, 40)
	while (
		(majorityEven ? oddOne % 2 === 0 : oddOne % 2 === 1) ||
		majority.includes(oddOne)
	) {
		oddOne = rng.nextInt(10, 40)
	}
	const numbers = rng.shuffle([...majority, oddOne])
	const oddIndex = numbers.indexOf(oddOne)
	const majorityLabel = majorityEven ? 'чётные' : 'нечётные'
	const oddLabel = majorityEven ? 'нечётное' : 'чётное'
	return {
		numbers,
		oddIndex,
		hint1: 'Смотрите на чётность чисел.',
		hint2: `Три числа ${majorityLabel}, одно — нет.`,
		explanation: `Числа ${majority.join(', ')} — ${majorityLabel}. Число ${oddOne} — ${oddLabel}, поэтому оно лишнее.`,
		mechanic: majorityEven ? 'parity_even' : 'parity_odd',
	}
}

function buildDivisible(rng: RandomSource): {
	numbers: number[]
	oddIndex: number
	hint1: string
	hint2: string
	explanation: string
	mechanic: string
} {
	const divisor = rng.pick([3, 4, 5])
	const majority: number[] = []
	while (majority.length < 3) {
		const k = rng.nextInt(Math.ceil(10 / divisor), 12)
		uniquePush(majority, k * divisor)
	}
	let oddOne = rng.nextInt(10, 48)
	while (oddOne % divisor === 0 || majority.includes(oddOne)) {
		oddOne = rng.nextInt(10, 48)
	}
	const numbers = rng.shuffle([...majority, oddOne])
	const oddIndex = numbers.indexOf(oddOne)
	return {
		numbers,
		oddIndex,
		hint1: 'Проверьте делимость на одно и то же число.',
		hint2: `Три числа делятся на ${divisor} без остатка.`,
		explanation: `Числа ${majority.join(', ')} делятся на ${divisor}. Число ${oddOne} на ${divisor} не делится — оно лишнее.`,
		mechanic: `divisible_by_${divisor}`,
	}
}

function buildSquare(rng: RandomSource): {
	numbers: number[]
	oddIndex: number
	hint1: string
	hint2: string
	explanation: string
	mechanic: string
} {
	const majority: number[] = rng.shuffle([...SMALL_SQUARES]).slice(0, 3)
	let oddOne = rng.nextInt(10, 60)
	while (
		(SMALL_SQUARES as readonly number[]).includes(oddOne) ||
		majority.includes(oddOne)
	) {
		oddOne = rng.nextInt(10, 60)
	}
	const numbers = rng.shuffle([...majority, oddOne])
	const oddIndex = numbers.indexOf(oddOne)
	return {
		numbers,
		oddIndex,
		hint1: 'Три числа — полные квадраты.',
		hint2: 'Полный квадрат — это 1, 4, 9, 16, 25…',
		explanation: `Числа ${majority.join(', ')} — квадраты целых чисел. ${oddOne} квадратом не является, поэтому оно лишнее.`,
		mechanic: 'perfect_square',
	}
}

function buildPrime(rng: RandomSource): {
	numbers: number[]
	oddIndex: number
	hint1: string
	hint2: string
	explanation: string
	mechanic: string
} {
	const majority: number[] = rng.shuffle([...SMALL_PRIMES]).slice(0, 3)
	const composites = [
		10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28,
	]
	let oddOne = rng.pick(composites)
	while (majority.includes(oddOne)) {
		oddOne = rng.pick(composites)
	}
	const numbers = rng.shuffle([...majority, oddOne])
	const oddIndex = numbers.indexOf(oddOne)
	return {
		numbers,
		oddIndex,
		hint1: 'Три числа — простые.',
		hint2: 'Простое число делится только на 1 и на себя.',
		explanation: `Числа ${majority.join(', ')} — простые. ${oddOne} — составное, поэтому оно лишнее.`,
		mechanic: 'prime',
	}
}

function generateOddOneOutPuzzle(
	input: GeneratePuzzleInput,
): SelectItemPuzzle {
	const rng = createGeneratorRng(IDENTITY, input.seed, input.difficulty)
	const kind = rng.pick(kindsForDifficulty(input.difficulty))

	let built: ReturnType<typeof buildParity>
	switch (kind) {
		case 'parity_even':
			built = buildParity(rng, true)
			break
		case 'parity_odd':
			built = buildParity(rng, false)
			break
		case 'divisible_by':
			built = buildDivisible(rng)
			break
		case 'perfect_square':
			built = buildSquare(rng)
			break
		case 'prime':
			built = buildPrime(rng)
			break
	}

	const items = built.numbers.map((n, index) => ({
		id: `n${index}`,
		label: String(n),
	}))
	const answer = items[built.oddIndex].id
	const id = buildPuzzleId(IDENTITY, input.seed, input.difficulty)

	return {
		id,
		type: IDENTITY.generatorId,
		category: 'odd_one_out',
		difficulty: input.difficulty,
		prompt: 'Какое число лишнее?',
		interactionType: 'select_item',
		items,
		answer,
		hints: [
			{ level: 1, text: built.hint1 },
			{ level: 2, text: built.hint2 },
		],
		explanation: built.explanation,
		seed: input.seed,
		metadata: {
			generatorId: IDENTITY.generatorId,
			generatorVersion: IDENTITY.version,
			tags: ['odd_one_out', built.mechanic],
			extra: {
				mechanic: built.mechanic,
				oddValue: built.numbers[built.oddIndex],
			},
		},
	}
}

export const oddOneOutNumbersGenerator: PuzzleGenerator = {
	...IDENTITY,
	displayName: 'Найди лишнее — числа',
	generate: generateOddOneOutPuzzle,
}
