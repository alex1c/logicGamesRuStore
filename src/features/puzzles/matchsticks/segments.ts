/**
 * Seven-segment glyph catalog for matchstick equations.
 * Segment letters: a(top) b(TR) c(BR) d(bottom) e(BL) f(TL) g(middle)
 */

export type DigitSegment = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g'

export const DIGIT_SEGMENTS: Record<number, readonly DigitSegment[]> = {
	0: ['a', 'b', 'c', 'd', 'e', 'f'],
	1: ['b', 'c'],
	2: ['a', 'b', 'd', 'e', 'g'],
	3: ['a', 'b', 'c', 'd', 'g'],
	4: ['b', 'c', 'f', 'g'],
	5: ['a', 'c', 'd', 'f', 'g'],
	6: ['a', 'c', 'd', 'e', 'f', 'g'],
	7: ['a', 'b', 'c'],
	8: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
	9: ['a', 'b', 'c', 'd', 'f', 'g'],
}

/** Plus uses horizontal + vertical sticks in the operator cell. */
export type OperatorKind = 'plus' | 'minus' | 'equals'

export const OPERATOR_SEGMENTS: Record<OperatorKind, readonly string[]> = {
	plus: ['h', 'v'],
	minus: ['h'],
	equals: ['eq1', 'eq2'],
}

export function digitFromSegments(
	active: ReadonlySet<string>,
): number | null {
	for (let d = 0; d <= 9; d += 1) {
		const segs = DIGIT_SEGMENTS[d]
		if (segs.length !== active.size) {
			continue
		}
		if (segs.every((s) => active.has(s))) {
			return d
		}
	}
	return null
}

export function operatorFromSegments(
	active: ReadonlySet<string>,
): OperatorKind | null {
	if (active.size === 2 && active.has('h') && active.has('v')) {
		return 'plus'
	}
	if (active.size === 1 && active.has('h')) {
		return 'minus'
	}
	if (active.size === 2 && active.has('eq1') && active.has('eq2')) {
		return 'equals'
	}
	return null
}

/** Local geometry for a digit cell (unit box 0..1). */
export const DIGIT_SEGMENT_GEOMETRY: Record<
	DigitSegment,
	{ x1: number; y1: number; x2: number; y2: number }
> = {
	a: { x1: 0.18, y1: 0.08, x2: 0.82, y2: 0.08 },
	b: { x1: 0.86, y1: 0.12, x2: 0.86, y2: 0.46 },
	c: { x1: 0.86, y1: 0.54, x2: 0.86, y2: 0.88 },
	d: { x1: 0.18, y1: 0.92, x2: 0.82, y2: 0.92 },
	e: { x1: 0.14, y1: 0.54, x2: 0.14, y2: 0.88 },
	f: { x1: 0.14, y1: 0.12, x2: 0.14, y2: 0.46 },
	g: { x1: 0.18, y1: 0.5, x2: 0.82, y2: 0.5 },
}

export const OPERATOR_GEOMETRY: Record<
	string,
	{ x1: number; y1: number; x2: number; y2: number }
> = {
	h: { x1: 0.2, y1: 0.5, x2: 0.8, y2: 0.5 },
	v: { x1: 0.5, y1: 0.2, x2: 0.5, y2: 0.8 },
	eq1: { x1: 0.2, y1: 0.38, x2: 0.8, y2: 0.38 },
	eq2: { x1: 0.2, y1: 0.62, x2: 0.8, y2: 0.62 },
}
