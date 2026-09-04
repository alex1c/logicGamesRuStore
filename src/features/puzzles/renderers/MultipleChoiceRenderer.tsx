import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { MultipleChoicePuzzle } from '../types'
import { colors, radius, spacing, touchTarget, typography } from '@/src/theme'

type Props = {
	puzzle: MultipleChoicePuzzle
	disabled: boolean
	selectedValue: string | null
	onSelect: (value: string) => void
}

export function MultipleChoiceRenderer({
	puzzle,
	disabled,
	selectedValue,
	onSelect,
}: Props) {
	return (
		<View style={styles.list} accessibilityRole="radiogroup">
			{puzzle.options.map((option) => {
				const selected = selectedValue === option.id
				return (
					<Pressable
						key={option.id}
						accessibilityRole="radio"
						accessibilityState={{ selected, disabled }}
						accessibilityLabel={option.label}
						disabled={disabled}
						onPress={() => onSelect(option.id)}
						style={({ pressed }) => [
							styles.option,
							selected && styles.optionSelected,
							pressed && !disabled && styles.optionPressed,
						]}
					>
						<View
							style={[styles.radio, selected && styles.radioSelected]}
						/>
						<Text style={styles.label}>{option.label}</Text>
					</Pressable>
				)
			})}
		</View>
	)
}

const styles = StyleSheet.create({
	list: {
		gap: spacing.sm,
	},
	option: {
		minHeight: touchTarget.min,
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.sm,
		paddingHorizontal: spacing.md,
		paddingVertical: spacing.sm,
		borderRadius: radius.md,
		borderWidth: 1.5,
		borderColor: colors.light.border,
		backgroundColor: colors.light.surface,
	},
	optionSelected: {
		borderColor: colors.light.primary,
		backgroundColor: colors.light.primaryMuted,
	},
	optionPressed: {
		opacity: 0.9,
	},
	radio: {
		width: 22,
		height: 22,
		borderRadius: 11,
		borderWidth: 2,
		borderColor: colors.light.textTertiary,
	},
	radioSelected: {
		borderColor: colors.light.primary,
		backgroundColor: colors.light.primary,
	},
	label: {
		...typography.body,
		color: colors.light.textPrimary,
		flex: 1,
	},
})
