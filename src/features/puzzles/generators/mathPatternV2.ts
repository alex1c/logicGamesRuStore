import type { NumericInputPuzzle } from '../types'
import {
	buildPuzzleId,
	createGeneratorRng,
	type GeneratePuzzleInput,
	type PuzzleGenerator,
} from '../engine/generator'

const IDENTITY = {
	generatorId: 'math.pattern.grid.v2',
	version: 2,
} as const

type MathKind = 'row_sum' | 'row_product_add' | 'corner_sum' | 'balance'

/**
 * Several strictly-defined numeric templates — no ambiguous viral "find the pattern" riddles.
 */
function generate(input: GeneratePuzzleInput): NumericInputPuzzle {
	const rng = createGeneratorRng(IDENTITY, input.seed, input.difficulty)
	const kinds: MathKind[] =
		input.difficulty <= 2
			? ['row_sum']
			: input.difficulty === 3
				? ['row_sum', 'row_product_add']
				: ['row_sum', 'row_product_add', 'corner_sum', 'balance']
	const kind = rng.pick(kinds)

	if (kind === 'row_sum') {
		const max = input.difficulty <= 2 ? 6 : input.difficulty <= 4 ? 9 : 12
		const rows: [number, number, number][] = []
		for (let r = 0; r < 3; r += 1) {
			const a = rng.nextInt(1, max)
			const b = rng.nextInt(1, max)
			rows.push([a, b, a + b])
		}
		// Avoid duplicate identical rows
		if (rows[0].join() === rows[1].join()) {
			rows[1][0] = Math.min(max, rows[1][0] + 1)
			rows[1][2] = rows[1][0] + rows[1][1]
		}
		const answer = rows[2][2]
		const display = [
			`${rows[0][0]}   ${rows[0][1]}   ${rows[0][2]}`,
			`${rows[1][0]}   ${rows[1][1]}   ${rows[1][2]}`,
			`${rows[2][0]}   ${rows[2][1]}   ?`,
		].join('\n')
		return finish(input, {
			prompt: `Найдите закономерность и вставьте число:\n\n${display}`,
			answer,
			hint1: 'В каждой строке третье число связано с двумя первыми одной операцией.',
			hint2: 'Сложите первые два числа строки.',
			explanation: `В каждой строке третье число — сумма двух первых. ${rows[2][0]} + ${rows[2][1]} = ${answer}.`,
			mechanic: 'row_sum',
			extra: { a: rows[2][0], b: rows[2][1] },
		})
	}

	if (kind === 'row_product_add') {
		const a = rng.nextInt(2, 5)
		const b = rng.nextInt(2, 5)
		const c = rng.nextInt(1, 4)
		const rows: [number, number, number][] = []
		for (let r = 0; r < 3; r += 1) {
			const x = rng.nextInt(2, 5)
			const y = rng.nextInt(1, 4)
			// rule: third = first * k + second (k fixed)
			void a
			void b
			void c
			rows.push([x, y, x * 2 + y])
		}
		const answer = rows[2][2]
		const display = [
			`${rows[0][0]}   ${rows[0][1]}   ${rows[0][2]}`,
			`${rows[1][0]}   ${rows[1][1]}   ${rows[1][2]}`,
			`${rows[2][0]}   ${rows[2][1]}   ?`,
		].join('\n')
		return finish(input, {
			prompt: `Найдите правило для каждой строки:\n\n${display}`,
			answer,
			hint1: 'Третье число получается из первых двух одной формулой.',
			hint2: 'Удвойте первое число и прибавьте второе.',
			explanation: `Правило строки: третье = первое × 2 + второе. ${rows[2][0]} × 2 + ${rows[2][1]} = ${answer}.`,
			mechanic: 'row_product_add',
			extra: { a: rows[2][0], b: rows[2][1] },
		})
	}

	if (kind === 'corner_sum') {
		// Three given corners of a square; missing corner = sum of adjacent? 
		// Simpler: center missing where center = average? Keep unambiguous:
		// Four numbers around: top-left, top-right, bottom-left, ?: each pair of opposites sums to same S.
		const s = rng.nextInt(10, 20)
		const a = rng.nextInt(2, s - 3)
		const b = s - a
		const c = rng.nextInt(2, s - 3)
		const d = s - c
		const answer = d
		const display = `${a}   ${b}\n${c}   ?`
		return finish(input, {
			prompt: `Сумма чисел по диагонали одинакова. Чему равно «?»\n\n${display}`,
			answer,
			hint1: 'Сложите числа одной диагонали.',
			hint2: `${a} + ? = ${b} + ${c}`,
			explanation: `Диагонали дают одну сумму: ${a} + ${answer} = ${b} + ${c} = ${s}. Значит ? = ${answer}.`,
			mechanic: 'corner_sum',
			extra: { a, b, c },
		})
	}

	// balance: left side a + b = right side ? + c
	for (let attempt = 0; attempt < 8; attempt += 1) {
		const leftA = rng.nextInt(3, 12)
		const leftB = rng.nextInt(3, 12)
		const rightC = rng.nextInt(2, 10)
		const answer = leftA + leftB - rightC
		if (answer >= 1) {
			return finish(input, {
				prompt: `Уравнение верно. Найдите пропущенное число:\n\n${leftA} + ${leftB} = ? + ${rightC}`,
				answer,
				hint1: 'Сначала найдите сумму слева.',
				hint2: `Слева ${leftA + leftB}. Справа должно быть то же.`,
				explanation: `${leftA} + ${leftB} = ${leftA + leftB}, значит ? + ${rightC} = ${leftA + leftB}, ? = ${answer}.`,
				mechanic: 'balance',
				extra: { a: leftA, b: leftB, c: rightC },
			})
		}
	}
	return generate({ ...input, seed: input.seed + 17 })
}

function finish(
	input: GeneratePuzzleInput,
	built: {
		prompt: string
		answer: number
		hint1: string
		hint2: string
		explanation: string
		mechanic: string
		extra: Record<string, number>
	},
): NumericInputPuzzle {
	return {
		id: buildPuzzleId(IDENTITY, input.seed, input.difficulty),
		type: IDENTITY.generatorId,
		category: 'math',
		difficulty: input.difficulty,
		prompt: built.prompt,
		interactionType: 'numeric_input',
		answer: built.answer,
		integerOnly: true,
		inputBounds: { min: 0, max: 80 },
		hints: [
			{ level: 1, text: built.hint1 },
			{ level: 2, text: built.hint2 },
		],
		explanation: built.explanation,
		seed: input.seed,
		metadata: {
			generatorId: IDENTITY.generatorId,
			generatorVersion: IDENTITY.version,
			tags: ['math', built.mechanic],
			extra: { mechanic: built.mechanic, ...built.extra },
		},
	}
}

export const mathPatternGeneratorV2: PuzzleGenerator = {
	...IDENTITY,
	displayName: 'Математические закономерности v2',
	generate,
}
