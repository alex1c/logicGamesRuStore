/**
 * Matchstick generator — reverse approach:
 * valid equation → apply reverse move → puzzle with unique correcting solution.
 */

import type { Difficulty, MatchstickPuzzle } from '../types'
import {
	buildPuzzleId,
	createGeneratorRng,
	type GeneratePuzzleInput,
	type PuzzleGenerator,
} from '../engine/generator'
import {
	applyMove,
	buildEquationState,
	countValidSolutions,
	describeMove,
	evaluateEquation,
	formatEquation,
	listLegalMoves,
	type MatchstickEquationState,
	type MatchstickMove,
} from '../matchsticks/equation'

const IDENTITY = {
	generatorId: 'matchsticks.equation.v1',
	version: 1,
} as const

function validPairs(
	difficulty: Difficulty,
): { left: number; op: 'plus' | 'minus'; right: number; result: number }[] {
	const pairs: {
		left: number
		op: 'plus' | 'minus'
		right: number
		result: number
	}[] = []
	const maxDigit = difficulty <= 2 ? 7 : 9
	for (let left = 0; left <= maxDigit; left += 1) {
		for (let right = 0; right <= maxDigit; right += 1) {
			const sum = left + right
			if (sum <= 9) {
				pairs.push({ left, op: 'plus', right, result: sum })
			}
			const diff = left - right
			if (diff >= 0 && diff <= 9 && difficulty >= 2) {
				pairs.push({ left, op: 'minus', right, result: diff })
			}
		}
	}
	return pairs
}

function pickUniquePuzzle(
	correct: MatchstickEquationState,
	rng: { shuffle: <T>(items: readonly T[]) => T[] },
): {
	puzzleState: MatchstickEquationState
	solutionMove: MatchstickMove
	correctEval: NonNullable<ReturnType<typeof evaluateEquation>>
} | null {
	const correctEval = evaluateEquation(correct)
	if (!correctEval?.value) {
		return null
	}

	const reverseCandidates = rng.shuffle(listLegalMoves(correct))
	for (const reverse of reverseCandidates) {
		const broken = applyMove(correct, reverse)
		if (!broken) {
			continue
		}
		const brokenEval = evaluateEquation(broken)
		// Prefer illegible or false equations as puzzles.
		if (brokenEval?.value) {
			continue
		}

		const oracle = countValidSolutions(broken)
		if (oracle.count !== 1) {
			continue
		}
		const solutionMove = oracle.moves[0]
		// Solution should restore a true equation (not necessarily the original,
		// but uniqueness is required).
		const restored = applyMove(broken, solutionMove)
		if (!restored) {
			continue
		}
		const restoredEval = evaluateEquation(restored)
		if (!restoredEval?.value) {
			continue
		}
		return {
			puzzleState: broken,
			solutionMove,
			correctEval: restoredEval,
		}
	}
	return null
}

function generate(input: GeneratePuzzleInput): MatchstickPuzzle {
	const rng = createGeneratorRng(IDENTITY, input.seed, input.difficulty)
	const pairs = rng.shuffle(validPairs(input.difficulty))
	const maxAttempts = 40

	for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
		const pair = pairs[attempt % pairs.length]
		const correct = buildEquationState(pair)
		const picked = pickUniquePuzzle(correct, rng)
		if (!picked) {
			continue
		}

		const { puzzleState, solutionMove, correctEval } = picked
		const beforeEval = evaluateEquation(puzzleState)
		const hintFocus = solutionMove.fromId.startsWith('OP')
			? 'operation'
			: solutionMove.fromId.startsWith('L')
				? 'left'
				: solutionMove.fromId.startsWith('R')
					? 'right'
					: 'result'

		const explanation = `Переместите одну спичку: ${describeMove(puzzleState, solutionMove)} Получится верное равенство ${formatEquation(correctEval)}.`

		return {
			id: buildPuzzleId(IDENTITY, input.seed, input.difficulty),
			type: IDENTITY.generatorId,
			category: 'matchsticks',
			difficulty: input.difficulty,
			prompt:
				'Переместите ровно одну спичку так, чтобы равенство стало верным.',
			interactionType: 'matchstick_move',
			state: puzzleState,
			answer: `${solutionMove.fromId}->${solutionMove.toId}`,
			acceptedMoves: [
				`${solutionMove.fromId}->${solutionMove.toId}`,
			],
			hints: [
				{
					level: 1,
					text:
						hintFocus === 'operation'
							? 'Посмотрите внимательно на знак операции.'
							: 'Подумайте, какая цифра может измениться одной спичкой.',
				},
				{
					level: 2,
					text: describeMove(puzzleState, solutionMove),
				},
			],
			explanation,
			seed: input.seed,
			metadata: {
				generatorId: IDENTITY.generatorId,
				generatorVersion: IDENTITY.version,
				tags: ['matchsticks', 'equation', pair.op],
				extra: {
					mechanic: 'single_move_equation',
					solutionFrom: solutionMove.fromId,
					solutionTo: solutionMove.toId,
					targetEquation: formatEquation(correctEval),
					brokenReadable: beforeEval
						? formatEquation(beforeEval)
						: 'illegible',
				},
			},
		}
	}

	// Deterministic safe fallback known-unique puzzle:
	// 6+4=4 broken from 0+4=4 by moving L segments... use fixed 5+3=8 → broken.
	const fallbackCorrect = buildEquationState({
		left: 0,
		op: 'plus',
		right: 4,
		result: 4,
	})
	const fallback = pickUniquePuzzle(fallbackCorrect, rng)
	if (!fallback) {
		throw new Error(
			`matchsticks generator failed for seed=${input.seed} difficulty=${input.difficulty}`,
		)
	}
	const evaled = fallback.correctEval
	return {
		id: buildPuzzleId(IDENTITY, input.seed, input.difficulty),
		type: IDENTITY.generatorId,
		category: 'matchsticks',
		difficulty: input.difficulty,
		prompt:
			'Переместите ровно одну спичку так, чтобы равенство стало верным.',
		interactionType: 'matchstick_move',
		state: fallback.puzzleState,
		answer: `${fallback.solutionMove.fromId}->${fallback.solutionMove.toId}`,
		acceptedMoves: [
			`${fallback.solutionMove.fromId}->${fallback.solutionMove.toId}`,
		],
		hints: [
			{ level: 1, text: 'Посмотрите на знак операции или левую цифру.' },
			{
				level: 2,
				text: describeMove(fallback.puzzleState, fallback.solutionMove),
			},
		],
		explanation: `Переместите одну спичку. Верное равенство: ${formatEquation(evaled)}.`,
		seed: input.seed,
		metadata: {
			generatorId: IDENTITY.generatorId,
			generatorVersion: IDENTITY.version,
			tags: ['matchsticks', 'equation', 'fallback'],
			extra: {
				mechanic: 'single_move_equation',
				solutionFrom: fallback.solutionMove.fromId,
				solutionTo: fallback.solutionMove.toId,
				targetEquation: formatEquation(evaled),
			},
		},
	}
}

export const matchsticksEquationGenerator: PuzzleGenerator = {
	...IDENTITY,
	displayName: 'Спички — равенства',
	generate,
}

/** Re-export oracle helpers for tests. */
export { countValidSolutions, applyMove, evaluateEquation }
