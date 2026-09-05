/**
 * Matchstick equation domain: cells, sticks, moves, evaluation.
 */

import {
	DIGIT_SEGMENTS,
	OPERATOR_SEGMENTS,
	digitFromSegments,
	operatorFromSegments,
	type DigitSegment,
	type OperatorKind,
} from './segments'

export type MatchstickCellKind = 'digit' | 'operator'

export type MatchstickCell = {
	id: string
	kind: MatchstickCellKind
	/** For operators: plus | minus | equals role in the template. */
	role: 'left' | 'op' | 'right' | 'eq' | 'result'
}

export type MatchstickStick = {
	/** Stable id: `${cellId}:${segmentKey}` */
	id: string
	cellId: string
	segmentKey: string
	active: boolean
}

export type MatchstickMove = {
	fromId: string
	toId: string
}

export type MatchstickEquationState = {
	cells: MatchstickCell[]
	sticks: MatchstickStick[]
}

export function stickId(cellId: string, segmentKey: string): string {
	return `${cellId}:${segmentKey}`
}

export function buildDigitCell(
	cellId: string,
	digit: number,
	role: MatchstickCell['role'],
): { cell: MatchstickCell; sticks: MatchstickStick[] } {
	const segs = DIGIT_SEGMENTS[digit]
	const all: DigitSegment[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g']
	const active = new Set(segs)
	return {
		cell: { id: cellId, kind: 'digit', role },
		sticks: all.map((segmentKey) => ({
			id: stickId(cellId, segmentKey),
			cellId,
			segmentKey,
			active: active.has(segmentKey),
		})),
	}
}

export function buildOperatorCell(
	cellId: string,
	kind: OperatorKind,
	role: MatchstickCell['role'],
): { cell: MatchstickCell; sticks: MatchstickStick[] } {
	const keys =
		kind === 'plus'
			? ['h', 'v']
			: kind === 'minus'
				? ['h', 'v'] // v present but inactive for minus — allows plus↔minus moves
				: ['eq1', 'eq2']
	const activeSet = new Set(OPERATOR_SEGMENTS[kind])
	return {
		cell: { id: cellId, kind: 'operator', role },
		sticks: keys.map((segmentKey) => ({
			id: stickId(cellId, segmentKey),
			cellId,
			segmentKey,
			active: activeSet.has(segmentKey),
		})),
	}
}

/** Template: L op R = Res  (single digits). */
export function buildEquationState(input: {
	left: number
	op: 'plus' | 'minus'
	right: number
	result: number
}): MatchstickEquationState {
	const left = buildDigitCell('L', input.left, 'left')
	const op = buildOperatorCell('OP', input.op, 'op')
	const right = buildDigitCell('R', input.right, 'right')
	const eq = buildOperatorCell('EQ', 'equals', 'eq')
	const res = buildDigitCell('RES', input.result, 'result')
	return {
		cells: [left.cell, op.cell, right.cell, eq.cell, res.cell],
		sticks: [
			...left.sticks,
			...op.sticks,
			...right.sticks,
			...eq.sticks,
			...res.sticks,
		],
	}
}

export function cloneState(
	state: MatchstickEquationState,
): MatchstickEquationState {
	return {
		cells: state.cells.map((c) => ({ ...c })),
		sticks: state.sticks.map((s) => ({ ...s })),
	}
}

export function applyMove(
	state: MatchstickEquationState,
	move: MatchstickMove,
): MatchstickEquationState | null {
	if (move.fromId === move.toId) {
		return null
	}
	const next = cloneState(state)
	const from = next.sticks.find((s) => s.id === move.fromId)
	const to = next.sticks.find((s) => s.id === move.toId)
	if (!from || !to) {
		return null
	}
	if (!from.active || to.active) {
		return null
	}
	from.active = false
	to.active = true
	return next
}

function cellActiveKeys(
	state: MatchstickEquationState,
	cellId: string,
): Set<string> {
	const set = new Set<string>()
	for (const stick of state.sticks) {
		if (stick.cellId === cellId && stick.active) {
			set.add(stick.segmentKey)
		}
	}
	return set
}

export type EvaluatedEquation = {
	left: number
	op: 'plus' | 'minus'
	right: number
	result: number
	value: boolean
}

/**
 * Interpret state as L ± R = Res. Returns null if glyphs are illegible.
 */
export function evaluateEquation(
	state: MatchstickEquationState,
): EvaluatedEquation | null {
	const left = digitFromSegments(cellActiveKeys(state, 'L'))
	const right = digitFromSegments(cellActiveKeys(state, 'R'))
	const result = digitFromSegments(cellActiveKeys(state, 'RES'))
	const opRaw = operatorFromSegments(cellActiveKeys(state, 'OP'))
	const eq = operatorFromSegments(cellActiveKeys(state, 'EQ'))
	if (
		left == null ||
		right == null ||
		result == null ||
		(opRaw !== 'plus' && opRaw !== 'minus') ||
		eq !== 'equals'
	) {
		return null
	}
	const expected = opRaw === 'plus' ? left + right : left - right
	return {
		left,
		op: opRaw,
		right,
		result,
		value: expected === result,
	}
}

/** All legal single-stick moves from current state. */
export function listLegalMoves(
	state: MatchstickEquationState,
): MatchstickMove[] {
	const moves: MatchstickMove[] = []
	const active = state.sticks.filter((s) => s.active)
	const inactive = state.sticks.filter((s) => !s.active)
	for (const from of active) {
		for (const to of inactive) {
			moves.push({ fromId: from.id, toId: to.id })
		}
	}
	return moves
}

/**
 * Independent oracle: count distinct moves that yield a true equation.
 */
export function countValidSolutions(state: MatchstickEquationState): {
	count: number
	moves: MatchstickMove[]
	results: string[]
} {
	const moves: MatchstickMove[] = []
	const results = new Set<string>()
	for (const move of listLegalMoves(state)) {
		const next = applyMove(state, move)
		if (!next) {
			continue
		}
		const evaled = evaluateEquation(next)
		if (evaled?.value) {
			moves.push(move)
			results.add(serializeActive(next))
		}
	}
	return { count: moves.length, moves, results: [...results] }
}

export function serializeActive(state: MatchstickEquationState): string {
	return state.sticks
		.filter((s) => s.active)
		.map((s) => s.id)
		.sort()
		.join('|')
}

export function formatEquation(evaled: EvaluatedEquation): string {
	const op = evaled.op === 'plus' ? '+' : '−'
	return `${evaled.left} ${op} ${evaled.right} = ${evaled.result}`
}

export function describeMove(
	state: MatchstickEquationState,
	move: MatchstickMove,
): string {
	const from = state.sticks.find((s) => s.id === move.fromId)
	const to = state.sticks.find((s) => s.id === move.toId)
	if (!from || !to) {
		return 'Переместите одну спичку.'
	}
	const fromLabel = sourceCellLabel(from.cellId)
	const toLabel = destinationCellLabel(to.cellId)
	return `Перенесите ${sourceSegmentLabel(from.segmentKey)} из ${fromLabel} на место ${destinationSegmentLabel(to.segmentKey)} ${toLabel}.`
}

function sourceCellLabel(cellId: string): string {
	switch (cellId) {
		case 'L':
			return 'левой цифры'
		case 'R':
			return 'правой цифры'
		case 'RES':
			return 'результата'
		case 'OP':
			return 'знака операции'
		case 'EQ':
			return 'знака равенства'
		default:
			return 'фигуры'
	}
}

function destinationCellLabel(cellId: string): string {
	switch (cellId) {
		case 'L':
			return 'в левой цифре'
		case 'R':
			return 'в правой цифре'
		case 'RES':
			return 'в результате'
		case 'OP':
			return 'в знаке операции'
		case 'EQ':
			return 'в знаке равенства'
		default:
			return 'в фигуре'
	}
}

function sourceSegmentLabel(segmentKey: string): string {
	switch (segmentKey) {
		case 'a': return 'верхнюю спичку'
		case 'b': return 'верхнюю правую спичку'
		case 'c': return 'нижнюю правую спичку'
		case 'd': return 'нижнюю спичку'
		case 'e': return 'нижнюю левую спичку'
		case 'f': return 'верхнюю левую спичку'
		case 'g': return 'среднюю спичку'
		case 'v': return 'вертикальную спичку'
		case 'h': return 'горизонтальную спичку'
		case 'eq1': return 'верхнюю спичку'
		case 'eq2': return 'нижнюю спичку'
		default: return 'спичку'
	}
}

function destinationSegmentLabel(segmentKey: string): string {
	switch (segmentKey) {
		case 'a': return 'верхней спички'
		case 'b': return 'верхней правой спички'
		case 'c': return 'нижней правой спички'
		case 'd': return 'нижней спички'
		case 'e': return 'нижней левой спички'
		case 'f': return 'верхней левой спички'
		case 'g': return 'средней спички'
		case 'v': return 'вертикальной спички'
		case 'h': return 'горизонтальной спички'
		case 'eq1': return 'верхней спички'
		case 'eq2': return 'нижней спички'
		default: return 'спички'
	}
}
