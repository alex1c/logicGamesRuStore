import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import type { TapTargetPuzzle } from '../types'
import { colors, radius, spacing, typography } from '@/src/theme'

type Props = {
	puzzle: TapTargetPuzzle
	disabled: boolean
	selectedValue: string | null
	onSelect: (value: string) => void
}

export function TapTargetRenderer({
	puzzle,
	disabled,
	selectedValue,
	onSelect,
}: Props) {
	const { width } = useWindowDimensions()
	const { rows, cols, cells } = puzzle.grid
	const horizontalPad = spacing.lg * 2
	const gap = spacing.xs
	const cellSize = Math.min(
		56,
		Math.floor((width - horizontalPad - gap * (cols - 1)) / cols),
	)

	return (
		<View
			style={[styles.grid, { width: cols * cellSize + gap * (cols - 1) }]}
			accessibilityRole="summary"
			accessibilityLabel={`Сетка ${rows} на ${cols}`}
		>
			{cells.map((cell) => {
				const selected = selectedValue === cell.id
				return (
					<Pressable
						key={cell.id}
						accessibilityRole="button"
						accessibilityLabel={`Символ ${cell.symbol}`}
						accessibilityState={{ selected, disabled }}
						disabled={disabled}
						onPress={() => onSelect(cell.id)}
						style={({ pressed }) => [
							styles.cell,
							{
								width: cellSize,
								height: cellSize,
								marginRight: gap,
								marginBottom: gap,
							},
							selected && styles.cellSelected,
							pressed && !disabled && styles.pressed,
						]}
					>
						<Text style={[styles.symbol, { fontSize: cellSize * 0.45 }]}>
							{cell.symbol}
						</Text>
					</Pressable>
				)
			})}
		</View>
	)
}

const styles = StyleSheet.create({
	grid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		alignSelf: 'center',
	},
	cell: {
		borderRadius: radius.sm,
		borderWidth: 1,
		borderColor: colors.light.border,
		backgroundColor: colors.light.surface,
		alignItems: 'center',
		justifyContent: 'center',
	},
	cellSelected: {
		borderColor: colors.light.primary,
		backgroundColor: colors.light.primaryMuted,
		borderWidth: 2,
	},
	pressed: {
		opacity: 0.85,
	},
	symbol: {
		color: colors.light.textPrimary,
		fontWeight: typography.subtitle.fontWeight,
	},
})
