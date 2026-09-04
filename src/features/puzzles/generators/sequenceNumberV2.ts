import type { Difficulty, NumericInputPuzzle } from '../types'
import {
	buildPuzzleId,
	createGeneratorRng,
	type GeneratePuzzleInput,
	type PuzzleGenerator,
} from '../engine/generator'
import type { RandomSource } from '@/src/utils/prng'

/** Expanded sequence generator (Phase 2). Bumped version — do not reuse v1 seeds. */
const IDENTITY = {
	generatorId: 'sequence.number.v2',
	version: 2,
} as const

type SequenceKind =
	| 'arithmetic'
	| 'decreasing_arithmetic'
	| 'geometric'
	| 'two_step'
	| 'increasing_diff'
	| 'decreasing_diff'
	| 'multiply_add'

const KIND_BY_DIFFICULTY: Record<Difficulty, SequenceKind[]> = {
	1: ['arithmetic', 'decreasing_arithmetic'],
	2: ['arithmetic', 'decreasing_arithmetic', 'geometric'],
	3: ['arithmetic', 'geometric', 'two_step', 'increasing_diff'],
	4: ['geometric', 'two_step', 'increasing_diff', 'decreasing_diff'],
	5: ['two_step', 'increasing_diff', 'decreasing_diff', 'multiply_add'],
}

function formatSequence(values: number[]): string {
	return `${values.map(String).join(', ')}, ?`
}

type Built = {
	shown: number[]
	answer: number
	hint1: string
	hint2: string
	explanation: string
	mechanic: string
}

function buildArithmetic(rng: RandomSource, difficulty: Difficulty): Built {
	const start = rng.nextInt(1, 12)
	const step = difficulty <= 2 ? rng.nextInt(2, 5) : rng.nextInt(3, 9)
	const shown: number[] = []
	for (let i = 0; i < 4; i += 1) {
		shown.push(start + i * step)
	}
	const answer = start + 4 * step
	return {
		shown,
		answer,
		hint1: 'Числа меняются на одно и то же значение каждый раз.',
		hint2: `Постоянный шаг равен ${step}.`,
		explanation: `Арифметическая прогрессия с шагом ${step}. После ${shown[3]} получаем ${answer}.`,
		mechanic: 'arithmetic',
	}
}

function buildDecreasing(rng: RandomSource, difficulty: Difficulty): Built {
	const start = rng.nextInt(20, difficulty >= 4 ? 40 : 30)
	const step = difficulty <= 2 ? rng.nextInt(2, 5) : rng.nextInt(3, 7)
	const shown: number[] = []
	for (let i = 0; i < 4; i += 1) {
		shown.push(start - i * step)
	}
	const answer = start - 4 * step
	return {
		shown,
		answer,
		hint1: 'Ряд убывает с постоянным шагом.',
		hint2: `Каждый раз вычитается ${step}.`,
		explanation: `Убывающая арифметическая прогрессия с шагом ${step}. Ответ — ${answer}.`,
		mechanic: 'decreasing_arithmetic',
	}
}

function buildGeometric(rng: RandomSource, difficulty: Difficulty): Built {
	const start = rng.nextInt(2, difficulty >= 4 ? 3 : 4)
	const ratio = difficulty <= 2 ? 2 : rng.pick([2, 3])
	const shown: number[] = []
	let current = start
	for (let i = 0; i < 4; i += 1) {
		shown.push(current)
		current *= ratio
	}
	let answer = current
	if (answer > 243) {
		return {
			shown: [2, 4, 8, 16],
			answer: 32,
			hint1: 'Каждое число — предыдущее, умноженное на одно и то же.',
			hint2: 'Множитель равен 2.',
			explanation: 'Геометрическая прогрессия ×2: следующее число 32.',
			mechanic: 'geometric',
		}
	}
	return {
		shown,
		answer,
		hint1: 'Каждое число получается умножением предыдущего на одно и то же.',
		hint2: `Множитель равен ${ratio}.`,
		explanation: `Геометрическая прогрессия с множителем ${ratio}. Ответ — ${answer}.`,
		mechanic: 'geometric',
	}
}

function buildTwoStep(rng: RandomSource, difficulty: Difficulty): Built {
	const stepA = rng.nextInt(1, difficulty >= 4 ? 5 : 4)
	let stepB = rng.nextInt(1, difficulty >= 4 ? 6 : 5)
	if (stepB === stepA) {
		stepB += 1
	}
	const start = rng.nextInt(1, 10)
	const shown: number[] = [start]
	let value = start
	const steps = [stepA, stepB, stepA, stepB, stepA]
	for (let i = 0; i < 4; i += 1) {
		value += steps[i]
		shown.push(value)
	}
	const answer = value + steps[4]
	return {
		shown,
		answer,
		hint1: 'Шаг чередуется: два разных приращения по очереди.',
		hint2: `Чередуются +${stepA} и +${stepB}.`,
		explanation: `Чередование шагов +${stepA} и +${stepB}. Ответ — ${answer}.`,
		mechanic: 'two_step',
	}
}

function buildIncreasingDiff(rng: RandomSource, difficulty: Difficulty): Built {
	const start = rng.nextInt(1, 8)
	const initialDiff = rng.nextInt(1, difficulty >= 4 ? 3 : 2)
	const shown: number[] = [start]
	let value = start
	let diff = initialDiff
	for (let i = 0; i < 4; i += 1) {
		value += diff
		shown.push(value)
		diff += 1
	}
	const answer = value + diff
	return {
		shown,
		answer,
		hint1: 'Смотрите на разницу между соседними числами.',
		hint2: 'Разница каждый раз увеличивается на 1.',
		explanation: `Разности растут на 1, начиная с ${initialDiff}. Ответ — ${answer}.`,
		mechanic: 'increasing_diff',
	}
}

function buildDecreasingDiff(rng: RandomSource, difficulty: Difficulty): Built {
	const initialDiff = rng.nextInt(5, difficulty >= 4 ? 8 : 7)
	const start = rng.nextInt(1, 10)
	const shown: number[] = [start]
	let value = start
	let diff = initialDiff
	for (let i = 0; i < 4; i += 1) {
		value += diff
		shown.push(value)
		diff -= 1
	}
	const answer = value + diff
	return {
		shown,
		answer,
		hint1: 'Разницы между числами уменьшаются.',
		hint2: `Разности начинаются с ${initialDiff} и уменьшаются на 1.`,
		explanation: `Убывающие разности от ${initialDiff}. Ответ — ${answer}.`,
		mechanic: 'decreasing_diff',
	}
}

function buildMultiplyAdd(rng: RandomSource): Built {
	const mult = rng.pick([2, 3])
	const add = rng.nextInt(1, 4)
	const start = rng.nextInt(1, 5)
	const shown: number[] = [start]
	let value = start
	for (let i = 0; i < 3; i += 1) {
		value = value * mult + add
		shown.push(value)
	}
	const answer = value * mult + add
	if (answer > 200) {
		return buildArithmetic(rng, 2)
	}
	return {
		shown,
		answer,
		hint1: 'Каждый шаг: умножение, затем сложение одного и того же.',
		hint2: `Правило: ×${mult}, затем +${add}.`,
		explanation: `Каждое следующее число: предыдущее ×${mult} + ${add}. Ответ — ${answer}.`,
		mechanic: 'multiply_add',
	}
}

function generate(input: GeneratePuzzleInput): NumericInputPuzzle {
	const rng = createGeneratorRng(IDENTITY, input.seed, input.difficulty)
	const kind = rng.pick(KIND_BY_DIFFICULTY[input.difficulty])
	let built: Built
	switch (kind) {
		case 'arithmetic':
			built = buildArithmetic(rng, input.difficulty)
			break
		case 'decreasing_arithmetic':
			built = buildDecreasing(rng, input.difficulty)
			break
		case 'geometric':
			built = buildGeometric(rng, input.difficulty)
			break
		case 'two_step':
			built = buildTwoStep(rng, input.difficulty)
			break
		case 'increasing_diff':
			built = buildIncreasingDiff(rng, input.difficulty)
			break
		case 'decreasing_diff':
			built = buildDecreasingDiff(rng, input.difficulty)
			break
		case 'multiply_add':
			built = buildMultiplyAdd(rng)
			break
	}

	return {
		id: buildPuzzleId(IDENTITY, input.seed, input.difficulty),
		type: IDENTITY.generatorId,
		category: 'sequence',
		difficulty: input.difficulty,
		prompt: `Какое число продолжит ряд?\n${formatSequence(built.shown)}`,
		interactionType: 'numeric_input',
		answer: built.answer,
		integerOnly: true,
		inputBounds: { min: -100, max: 500 },
		hints: [
			{ level: 1, text: built.hint1 },
			{ level: 2, text: built.hint2 },
		],
		explanation: built.explanation,
		seed: input.seed,
		metadata: {
			generatorId: IDENTITY.generatorId,
			generatorVersion: IDENTITY.version,
			tags: ['sequence', built.mechanic],
			extra: { mechanic: built.mechanic, shown: built.shown.join(',') },
		},
	}
}

export const sequenceNumberGeneratorV2: PuzzleGenerator = {
	...IDENTITY,
	displayName: 'Числовая последовательность v2',
	generate,
}
