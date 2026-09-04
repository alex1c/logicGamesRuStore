import type { Difficulty, TapTargetPuzzle } from '../types'
import {
	buildPuzzleId,
	createGeneratorRng,
	type GeneratePuzzleInput,
	type PuzzleGenerator,
} from '../engine/generator'

const IDENTITY = {
	generatorId: 'attention.symbols.v2',
	version: 2,
} as const

const SYMBOL_PAIRS: { normal: string; odd: string }[] = [
	{ normal: '●', odd: '○' },
	{ normal: '■', odd: '□' },
	{ normal: '▲', odd: '△' },
	{ normal: '◆', odd: '◇' },
	{ normal: '+', odd: '×' },
	{ normal: '★', odd: '☆' },
	{ normal: 'A', odd: 'А' }, // Latin A vs Cyrillic А — visually close
]

const DIGIT_PAIRS: { normal: string; odd: string }[] = [
	{ normal: '8', odd: '0' },
	{ normal: '1', odd: '7' },
	{ normal: '6', odd: '9' },
	{ normal: '5', odd: '3' },
]

function gridSize(difficulty: Difficulty): { rows: number; cols: number } {
	if (difficulty <= 2) {
		return { rows: 3, cols: 3 }
	}
	if (difficulty === 3) {
		return { rows: 4, cols: 4 }
	}
	if (difficulty === 4) {
		return { rows: 5, cols: 5 }
	}
	return { rows: 5, cols: 5 } // keep readable on phone — no microscopic 6×6 text
}

function generate(input: GeneratePuzzleInput): TapTargetPuzzle {
	const rng = createGeneratorRng(IDENTITY, input.seed, input.difficulty)
	const { rows, cols } = gridSize(input.difficulty)
	const useDigits = input.difficulty >= 3 && rng.next() < 0.45
	const pair = useDigits ? rng.pick(DIGIT_PAIRS) : rng.pick(SYMBOL_PAIRS)
	const total = rows * cols
	const oddIndex = rng.nextInt(0, total - 1)
	const cells = Array.from({ length: total }, (_, index) => ({
		id: `c${index}`,
		symbol: index === oddIndex ? pair.odd : pair.normal,
		variant: (index === oddIndex ? 'odd' : 'normal') as 'odd' | 'normal',
	}))

	return {
		id: buildPuzzleId(IDENTITY, input.seed, input.difficulty),
		type: IDENTITY.generatorId,
		category: 'attention',
		difficulty: input.difficulty,
		prompt: 'Найдите отличающийся символ и нажмите на него.',
		interactionType: 'tap_target',
		grid: { rows, cols, cells },
		answer: `c${oddIndex}`,
		hints: [
			{
				level: 1,
				text: 'Почти все элементы одинаковые — ищите один другой.',
			},
			{
				level: 2,
				text: 'Сравните контур, заливку или начертание знака.',
			},
		],
		explanation: `На сетке ${rows}×${cols} почти везде «${pair.normal}», один элемент — «${pair.odd}».`,
		seed: input.seed,
		metadata: {
			generatorId: IDENTITY.generatorId,
			generatorVersion: IDENTITY.version,
			tags: ['attention', useDigits ? 'digits' : 'symbols'],
			extra: {
				mechanic: useDigits ? 'odd_digit' : 'odd_symbol',
				normalSymbol: pair.normal,
				oddSymbol: pair.odd,
				oddIndex,
			},
		},
	}
}

export const attentionSymbolsGeneratorV2: PuzzleGenerator = {
	...IDENTITY,
	displayName: 'Внимание — символы v2',
	generate,
}
