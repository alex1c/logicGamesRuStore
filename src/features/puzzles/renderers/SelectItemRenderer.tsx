import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { SelectItemPuzzle } from '../types'
import { colors, radius, spacing, touchTarget, typography } from '@/src/theme'

type Props = {
	puzzle: SelectItemPuzzle
	disabled: boolean
	selectedValue: string | null
	onSelect: (value: string) => void
}

export function SelectItemRenderer({
	puzzle,
	disabled,
	selectedValue,
	onSelect,
}: Props) {
	return (
		<View style={styles.row}>
			{puzzle.items.map((item) => {
				const selected = selectedValue === item.id
				return (
					<Pressable
						key={item.id}
						accessibilityRole="button"
						accessibilityState={{ selected, disabled }}
						accessibilityLabel={`Вариант ${item.label}`}
						disabled={disabled}
						onPress={() => onSelect(item.id)}
						style={({ pressed }) => [
							styles.chip,
							selected && styles.chipSelected,
							pressed && !disabled && styles.pressed,
						]}
					>
						<Text style={[styles.label, selected && styles.labelSelected]}>
							{item.label}
						</Text>
					</Pressable>
				)
			})}
		</View>
	)
}

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: spacing.sm,
		justifyContent: 'center',
	},
	chip: {
		minWidth: 72,
		minHeight: touchTarget.min + 8,
		paddingHorizontal: spacing.md,
		borderRadius: radius.lg,
		borderWidth: 1.5,
		borderColor: colors.light.border,
		backgroundColor: colors.light.surface,
		alignItems: 'center',
		justifyContent: 'center',
	},
	chipSelected: {
		borderColor: colors.light.primary,
		backgroundColor: colors.light.primaryMuted,
	},
	pressed: {
		opacity: 0.88,
	},
	label: {
		...typography.subtitle,
		color: colors.light.textPrimary,
	},
	labelSelected: {
		color: colors.light.primary,
	},
})
