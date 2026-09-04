/**
 * Local calendar-day helpers for Daily Workout identity.
 * Always use device-local YYYY-MM-DD — never UTC date alone.
 */

export type LocalDateString = string // YYYY-MM-DD

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

/** Format a Date as local calendar YYYY-MM-DD. */
export function toLocalDateString(date: Date = new Date()): LocalDateString {
	const y = date.getFullYear()
	const m = String(date.getMonth() + 1).padStart(2, '0')
	const d = String(date.getDate()).padStart(2, '0')
	return `${y}-${m}-${d}`
}

export function isValidLocalDateString(value: string): value is LocalDateString {
	if (!DATE_RE.test(value)) {
		return false
	}
	const [ys, ms, ds] = value.split('-')
	const y = Number(ys)
	const m = Number(ms)
	const d = Number(ds)
	const probe = new Date(y, m - 1, d)
	return (
		probe.getFullYear() === y &&
		probe.getMonth() === m - 1 &&
		probe.getDate() === d
	)
}

/** Parse YYYY-MM-DD into a local Date at noon (avoids DST edge flips). */
export function parseLocalDateString(value: LocalDateString): Date {
	const [ys, ms, ds] = value.split('-')
	return new Date(Number(ys), Number(ms) - 1, Number(ds), 12, 0, 0, 0)
}

/** Previous local calendar day. */
export function previousLocalDate(value: LocalDateString): LocalDateString {
	const date = parseLocalDateString(value)
	date.setDate(date.getDate() - 1)
	return toLocalDateString(date)
}

/** Next local calendar day. */
export function nextLocalDate(value: LocalDateString): LocalDateString {
	const date = parseLocalDateString(value)
	date.setDate(date.getDate() + 1)
	return toLocalDateString(date)
}

/** Difference in whole local calendar days (a - b). */
export function localDateDiffDays(
	a: LocalDateString,
	b: LocalDateString,
): number {
	const da = parseLocalDateString(a)
	const db = parseLocalDateString(b)
	const ms = da.getTime() - db.getTime()
	return Math.round(ms / (24 * 60 * 60 * 1000))
}

export function formatClock(ms: number): string {
	const totalSec = Math.max(0, Math.round(ms / 1000))
	const minutes = Math.floor(totalSec / 60)
	const seconds = totalSec % 60
	return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
