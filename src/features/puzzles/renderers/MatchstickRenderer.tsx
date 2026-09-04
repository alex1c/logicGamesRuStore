import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import Svg, { Line } from 'react-native-svg'
import { useMemo, useState } from 'react'
import type { MatchstickPuzzle } from '../types'
import {
	DIGIT_SEGMENT_GEOMETRY,
	OPERATOR_GEOMETRY,
} from '../matchsticks/segments'
import { applyMove } from '../matchsticks/equation'
import { colors, radius, spacing, touchTarget, typography } from '@/src/theme'

type Props = {
	puzzle: MatchstickPuzzle
	disabled: boolean
	selectedValue: string | null
	onSelect: (value: string) => void
}

const CELL_ORDER = ['L', 'OP', 'R', 'EQ', 'RES'] as const

/**
 * Tap-to-move matchstick renderer:
 * 1) tap active stick (source)
 * 2) tap inactive stick slot (destination)
 * Selection serialized as fromId->toId for checkAnswer.
 */
export function MatchstickRenderer({
	puzzle,
	disabled,
	selectedValue,
	onSelect,
}: Props) {
	const { width } = useWindowDimensions()
	const [sourceId, setSourceId] = useState<string | null>(null)
	const boardWidth = Math.min(width - spacing.lg * 2, 360)
	const cellSize = boardWidth / 5.2

	const previewState = useMemo(() => {
		if (!selectedValue?.includes('->')) {
			return puzzle.state
		}
		const [fromId, toId] = selectedValue.split('->')
		return applyMove(puzzle.state, { fromId, toId }) ?? puzzle.state
	}, [puzzle.state, selectedValue])

	const handleStickPress = (stickId: string, active: boolean) => {
		if (disabled) {
			return
		}
		if (!sourceId) {
			if (!active) {
				return
			}
			setSourceId(stickId)
			onSelect('')
			return
		}
		if (stickId === sourceId) {
			setSourceId(null)
			onSelect('')
			return
		}
		if (active) {
			// Switch source to another active stick.
			setSourceId(stickId)
			onSelect('')
			return
		}
		const move = `${sourceId}->${stickId}`
		setSourceId(null)
		onSelect(move)
	}

	return (
		<View style={styles.wrap}>
			<Text style={styles.help}>
				{sourceId
					? 'Теперь нажмите место, куда перенести спичку'
					: 'Нажмите спичку, которую хотите переместить'}
			</Text>
			<View style={[styles.board, { width: boardWidth }]}>
				{CELL_ORDER.map((cellId) => {
					const sticks = previewState.sticks.filter((s) => s.cellId === cellId)
					return (
						<View
							key={cellId}
							style={{ width: cellSize, height: cellSize * 1.35 }}
							accessibilityLabel={`Ячейка ${cellId}`}
						>
							<Svg width={cellSize} height={cellSize * 1.35}>
								{sticks.map((stick) => {
									const geo =
										DIGIT_SEGMENT_GEOMETRY[
											stick.segmentKey as keyof typeof DIGIT_SEGMENT_GEOMETRY
										] ?? OPERATOR_GEOMETRY[stick.segmentKey]
									if (!geo) {
										return null
									}
									const selected = sourceId === stick.id
									const inMove =
										selectedValue?.startsWith(`${stick.id}->`) ||
										selectedValue?.endsWith(`->${stick.id}`)
									const stroke = !stick.active
										? colors.light.border
										: selected || inMove
											? colors.light.primary
											: colors.light.streak
									const opacity = stick.active ? 1 : 0.25
									return (
										<Line
											key={stick.id}
											x1={geo.x1 * cellSize}
											y1={geo.y1 * cellSize * 1.35}
											x2={geo.x2 * cellSize}
											y2={geo.y2 * cellSize * 1.35}
											stroke={stroke}
											strokeWidth={selected ? 7 : 5}
											strokeLinecap="round"
											opacity={opacity}
										/>
									)
								})}
							</Svg>
							{/* Invisible hit targets over segments */}
							{sticks.map((stick) => {
								const geo =
									DIGIT_SEGMENT_GEOMETRY[
										stick.segmentKey as keyof typeof DIGIT_SEGMENT_GEOMETRY
									] ?? OPERATOR_GEOMETRY[stick.segmentKey]
								if (!geo) {
									return null
								}
								const left = Math.min(geo.x1, geo.x2) * cellSize - 12
								const top = Math.min(geo.y1, geo.y2) * cellSize * 1.35 - 12
								const w = Math.abs(geo.x2 - geo.x1) * cellSize + 24
								const h = Math.abs(geo.y2 - geo.y1) * cellSize * 1.35 + 24
								return (
									<Pressable
										key={`hit-${stick.id}`}
										accessibilityRole="button"
										accessibilityLabel={
											stick.active
												? `Спичка ${stick.id}`
												: `Слот ${stick.id}`
										}
										accessibilityState={{
											selected: sourceId === stick.id,
											disabled,
										}}
										disabled={disabled}
										onPress={() => handleStickPress(stick.id, stick.active)}
										style={[
											styles.hit,
											{
												left,
												top,
												width: Math.max(w, touchTarget.min * 0.6),
												height: Math.max(h, touchTarget.min * 0.6),
											},
										]}
									/>
								)
							})}
						</View>
					)
				})}
			</View>
			{selectedValue ? (
				<Text style={styles.moveLabel}>Ход выбран — нажмите «Проверить»</Text>
			) : null}
			{sourceId ? (
				<Pressable
					accessibilityRole="button"
					accessibilityLabel="Сбросить выбор"
					onPress={() => {
						setSourceId(null)
						onSelect('')
					}}
					style={styles.reset}
				>
					<Text style={styles.resetText}>Сбросить выбор</Text>
				</Pressable>
			) : null}
		</View>
	)
}

const styles = StyleSheet.create({
	wrap: { gap: spacing.sm, alignItems: 'center' },
	help: {
		...typography.caption,
		color: colors.light.textSecondary,
		textAlign: 'center',
	},
	board: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		backgroundColor: colors.light.surface,
		borderRadius: radius.lg,
		paddingVertical: spacing.md,
		paddingHorizontal: spacing.xs,
		borderWidth: 1,
		borderColor: colors.light.border,
	},
	hit: {
		position: 'absolute',
	},
	moveLabel: {
		...typography.bodyStrong,
		color: colors.light.primary,
	},
	reset: {
		minHeight: touchTarget.min,
		paddingHorizontal: spacing.md,
		justifyContent: 'center',
	},
	resetText: {
		...typography.caption,
		color: colors.light.textSecondary,
	},
})
