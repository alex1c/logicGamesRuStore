import { StyleSheet, TextInput, View } from 'react-native'
import type { TextInputPuzzle } from '../types'
import { colors, radius, spacing, touchTarget, typography } from '@/src/theme'

type Props = {
	puzzle: TextInputPuzzle
	disabled: boolean
	selectedValue: string | null
	onSelect: (value: string) => void
}

export function TextInputRenderer({
	disabled,
	selectedValue,
	onSelect,
}: Props) {
	return (
		<View>
			<TextInput
				accessibilityLabel="Поле текстового ответа"
				editable={!disabled}
				autoCapitalize="none"
				autoCorrect={false}
				value={selectedValue ?? ''}
				onChangeText={onSelect}
				placeholder="Введите ответ"
				placeholderTextColor={colors.light.textTertiary}
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
		fontSize: typography.body.fontSize,
		textAlign: 'center',
	},
	inputDisabled: {
		opacity: 0.7,
		backgroundColor: colors.light.surfaceMuted,
	},
})
