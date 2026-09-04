import type { Difficulty, NumericInputPuzzle } from '../types'
import {
	buildPuzzleId,
	createGeneratorRng,
	type GeneratePuzzleInput,
	type PuzzleGenerator,
} from '../engine/generator'
import type { RandomSource } from '@/src/utils/prng'

const IDENTITY = {
	generatorId: 'sequence.number.v1',
	version: 1,
} as const

type SequenceKind =
	| 'arithmetic'
	| 'geometric'
	| 'two_step'
	| 'increasing_diff'

const KIND_BY_DIFFICULTY: Record<Difficulty, SequenceKind[]> = {
	1: ['arithmetic'],
	2: ['arithmetic', 'geometric'],
	3: ['arithmetic', 'geometric', 'two_step'],
	4: ['geometric', 'two_step', 'increasing_diff'],
	5: ['two_step', 'increasing_diff'],
}

function formatSequence(values: number[]): string {
	return values.map(String).join(', ') + ', ?'
}

function buildArithmetic(rng: RandomSource, difficulty: Difficulty) {
	const start = rng.nextInt(1, 12)
	const step =
		difficulty <= 2 ? rng.nextInt(2, 5) : rng.nextInt(3, 9)
	const length = 4
	const shown: number[] = []
	for (let i = 0; i < length; i += 1) {
		shown.push(start + i * step)
	}
	const answer = start + length * step
	return {
		shown,
		answer,
		hint1: 'Числа меняются на одно и то же значение каждый раз.',
		hint2: `Разница между соседними числами постоянна.`,
		explanation: `Это арифметическая прогрессия с шагом ${step}: каждое следующее число больше предыдущего на ${step}. Поэтому ответ — ${answer}.`,
		mechanic: 'arithmetic',
		step,
	}
}

function buildGeometric(rng: RandomSource, difficulty: Difficulty) {
	// Keep products small and integer.
	const start = rng.nextInt(2, difficulty >= 4 ? 3 : 4)
	const ratio = difficulty <= 2 ? 2 : rng.pick([2, 3])
	const length = 4
	const shown: number[] = []
	let current = start
	for (let i = 0; i < length; i += 1) {
		shown.push(current)
		current *= ratio
	}
	const answer = current
	// Cap: if answer grows too large, fall back to ratio 2 from smaller start.
	if (answer > 200) {
		const safeStart = 2
		const safeRatio = 2
		const safeShown = [2, 4, 8, 16]
		return {
			shown: safeShown,
			answer: 32,
			hint1: 'Каждое число получается умножением предыдущего на одно и то же.',
			hint2: 'Множитель равен 2.',
			explanation:
				'Это геометрическая прогрессия с множителем 2: 2×2=4, 4×2=8, 8×2=16, 16×2=32.',
			mechanic: 'geometric',
			step: safeRatio,
			_safeStart: safeStart,
		}
	}
	return {
		shown,
		answer,
		hint1: 'Каждое число получается умножением предыдущего на одно и то же.',
		hint2: `Множитель равен ${ratio}.`,
		explanation: `Это геометрическая прогрессия с множителем ${ratio}. Последнее показанное число ${shown[shown.length - 1]}, умножаем на ${ratio} и получаем ${answer}.`,
		mechanic: 'geometric',
		step: ratio,
	}
}

function buildTwoStep(rng: RandomSource, difficulty: Difficulty) {
	const a = rng.nextInt(1, difficulty >= 4 ? 5 : 4)
	const b = rng.nextInt(1, difficulty >= 4 ? 6 : 5)
	// Ensure steps differ so the pattern is unambiguous.
	const stepA = a === b ? a + 1 : a
	const stepB = b
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
		hint1: 'Шаг чередуется: два разных приращения идут по очереди.',
		hint2: `Чередуются приращения +${stepA} и +${stepB}.`,
		explanation: `Последовательность чередует два шага: +${stepA} и +${stepB}. После ${shown[shown.length - 1]} снова добавляем ${stepA}, получаем ${answer}.`,
		mechanic: 'two_step',
		step: stepA,
	}
}

function buildIncreasingDiff(rng: RandomSource, difficulty: Difficulty) {
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
		hint1: 'Смотрите не на сами числа, а на разницу между ними.',
		hint2: 'Разница каждый раз увеличивается на 1.',
		explanation: `Разности между соседними числами образуют ряд: ${initialDiff}, ${initialDiff + 1}, ${initialDiff + 2}, … Следующая разность равна ${diff}, поэтому ответ — ${answer}.`,
		mechanic: 'increasing_diff',
		step: initialDiff,
	}
}

function generateSequencePuzzle(
	input: GeneratePuzzleInput,
): NumericInputPuzzle {
	const rng = createGeneratorRng(IDENTITY, input.seed, input.difficulty)
	const kind = rng.pick(KIND_BY_DIFFICULTY[input.difficulty])

	let built:
		| ReturnType<typeof buildArithmetic>
		| ReturnType<typeof buildGeometric>
		| ReturnType<typeof buildTwoStep>
		| ReturnType<typeof buildIncreasingDiff>

	switch (kind) {
		case 'arithmetic':
			built = buildArithmetic(rng, input.difficulty)
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
	}

	const id = buildPuzzleId(IDENTITY, input.seed, input.difficulty)

	return {
		id,
		type: IDENTITY.generatorId,
		category: 'sequence',
		difficulty: input.difficulty,
		prompt: `Какое число продолжит ряд?\n${formatSequence(built.shown)}`,
		interactionType: 'numeric_input',
		answer: built.answer,
		integerOnly: true,
		inputBounds: { min: -50, max: 500 },
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
			extra: {
				mechanic: built.mechanic,
				shown: built.shown.join(','),
			},
		},
	}
}

export const sequenceNumberGenerator: PuzzleGenerator = {
	...IDENTITY,
	displayName: 'Числовая последовательность',
	generate: generateSequencePuzzle,
}
