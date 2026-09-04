import type { Difficulty, TapTargetPuzzle } from '../types'
import {
	buildPuzzleId,
	createGeneratorRng,
	type GeneratePuzzleInput,
	type PuzzleGenerator,
} from '../engine/generator'

const IDENTITY = {
	generatorId: 'attention.symbols.v1',
	version: 1,
} as const

/** Visually distinct base symbols for attention grids. */
const SYMBOL_PAIRS: { normal: string; odd: string }[] = [
	{ normal: '●', odd: '○' },
	{ normal: '■', odd: '□' },
	{ normal: '▲', odd: '△' },
	{ normal: '◆', odd: '◇' },
	{ normal: '+', odd: '×' },
	{ normal: '★', odd: '☆' },
]

function gridSizeForDifficulty(difficulty: Difficulty): {
	rows: number
	cols: number
} {
	if (difficulty <= 2) {
		return { rows: 3, cols: 3 }
	}
	if (difficulty === 3) {
		return { rows: 4, cols: 4 }
	}
	if (difficulty === 4) {
		return { rows: 5, cols: 5 }
	}
	return { rows: 5, cols: 6 }
}

function generateAttentionSymbolsPuzzle(
	input: GeneratePuzzleInput,
): TapTargetPuzzle {
	const rng = createGeneratorRng(IDENTITY, input.seed, input.difficulty)
	const { rows, cols } = gridSizeForDifficulty(input.difficulty)
	const pair = rng.pick(SYMBOL_PAIRS)
	const total = rows * cols
	const oddIndex = rng.nextInt(0, total - 1)

	const cells = Array.from({ length: total }, (_, index) => {
		const isOdd = index === oddIndex
		return {
			id: `c${index}`,
			symbol: isOdd ? pair.odd : pair.normal,
			variant: (isOdd ? 'odd' : 'normal') as 'odd' | 'normal',
		}
	})

	const id = buildPuzzleId(IDENTITY, input.seed, input.difficulty)

	return {
		id,
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
				text: 'Почти все символы одинаковые — ищите один, который чуть другой.',
			},
			{
				level: 2,
				text: 'Сравните заливку или контур: один символ «пустой», остальные «заполненные» (или наоборот).',
			},
		],
		explanation: `На сетке ${rows}×${cols} все ячейки содержат «${pair.normal}», кроме одной с «${pair.odd}». Нужно было нажать на отличающийся символ.`,
		seed: input.seed,
		metadata: {
			generatorId: IDENTITY.generatorId,
			generatorVersion: IDENTITY.version,
			tags: ['attention', 'grid'],
			extra: {
				mechanic: 'single_odd_symbol',
				normalSymbol: pair.normal,
				oddSymbol: pair.odd,
				oddIndex,
			},
		},
	}
}

export const attentionSymbolsGenerator: PuzzleGenerator = {
	...IDENTITY,
	displayName: 'Внимание — символы',
	generate: generateAttentionSymbolsPuzzle,
}
