import { StyleSheet, TextInput, View } from 'react-native'
import type { NumericInputPuzzle } from '../types'
import { colors, radius, spacing, touchTarget, typography } from '@/src/theme'
import { isStoreScreenshotMode } from '@/src/constants/screenshotMode'

type Props = {
	puzzle: NumericInputPuzzle
	disabled: boolean
	selectedValue: string | null
	onSelect: (value: string) => void
}

export function NumericInputRenderer({
	puzzle,
	disabled,
	selectedValue,
	onSelect,
}: Props) {
	return (
		<View>
			<TextInput
				accessibilityLabel="Поле ввода числа"
				editable={!disabled}
				keyboardType={puzzle.integerOnly ? 'number-pad' : 'decimal-pad'}
				value={selectedValue ?? ''}
				onChangeText={onSelect}
				placeholder="Введите число"
				placeholderTextColor={colors.light.textTertiary}
				// Keep storefront frames keyboard-free in screenshot capture builds.
				showSoftInputOnFocus={!isStoreScreenshotMode}
				style={[styles.input, disabled && styles.inputDisabled]}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	input: {
		minHeight: touchTarget.min + 8,
		borderWidth: 1.5,
		borderColor: colors.light.border,
		borderRadius: radius.md,
		paddingHorizontal: spacing.md,
		backgroundColor: colors.light.surface,
		color: colors.light.textPrimary,
		fontSize: typography.puzzlePrompt.fontSize,
		fontWeight: '600',
		textAlign: 'center',
	},
	inputDisabled: {
		opacity: 0.7,
		backgroundColor: colors.light.surfaceMuted,
	},
})
