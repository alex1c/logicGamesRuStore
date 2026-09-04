import type { NumericInputPuzzle } from '../types'
import {
	buildPuzzleId,
	createGeneratorRng,
	type GeneratePuzzleInput,
	type PuzzleGenerator,
} from '../engine/generator'

const IDENTITY = {
	generatorId: 'math.pattern.grid.v1',
	version: 1,
} as const

/**
 * 3×3 grid pattern: each row follows a+b=c (third cell is sum of first two).
 * This rule is unambiguous and easy to explain.
 *
 * Example:
 * 3  5  8
 * 4  7  11
 * 6  9  ?
 */
function generateMathPatternPuzzle(
	input: GeneratePuzzleInput,
): NumericInputPuzzle {
	const rng = createGeneratorRng(IDENTITY, input.seed, input.difficulty)

	const maxOperand =
		input.difficulty <= 2 ? 6 : input.difficulty <= 4 ? 9 : 12

	const rows: [number, number, number][] = []
	for (let r = 0; r < 3; r += 1) {
		const a = rng.nextInt(1, maxOperand)
		const b = rng.nextInt(1, maxOperand)
		rows.push([a, b, a + b])
	}

	const answer = rows[2][2]
	const displayRows = [
		`${rows[0][0]}   ${rows[0][1]}   ${rows[0][2]}`,
		`${rows[1][0]}   ${rows[1][1]}   ${rows[1][2]}`,
		`${rows[2][0]}   ${rows[2][1]}   ?`,
	].join('\n')

	const id = buildPuzzleId(IDENTITY, input.seed, input.difficulty)

	return {
		id,
		type: IDENTITY.generatorId,
		category: 'math',
		difficulty: input.difficulty,
		prompt: `Найдите закономерность и вставьте пропущенное число:\n\n${displayRows}`,
		interactionType: 'numeric_input',
		answer,
		integerOnly: true,
		inputBounds: { min: 0, max: 40 },
		hints: [
			{
				level: 1,
				text: 'В каждой строке третье число связано с двумя первыми одной и той же операцией.',
			},
			{
				level: 2,
				text: 'Сложите первые два числа строки — получите третье.',
			},
		],
		explanation: `В каждой строке третье число равно сумме двух первых. В нижней строке: ${rows[2][0]} + ${rows[2][1]} = ${answer}.`,
		seed: input.seed,
		metadata: {
			generatorId: IDENTITY.generatorId,
			generatorVersion: IDENTITY.version,
			tags: ['math', 'row_sum'],
			extra: {
				mechanic: 'row_sum',
				a: rows[2][0],
				b: rows[2][1],
			},
		},
	}
}

export const mathPatternGenerator: PuzzleGenerator = {
	...IDENTITY,
	displayName: 'Математическая закономерность (сетка)',
	generate: generateMathPatternPuzzle,
}
