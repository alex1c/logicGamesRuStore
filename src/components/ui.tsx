import type { ReactNode } from 'react'
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native'
import {
	colors,
	elevation,
	radius,
	spacing,
	touchTarget,
	typography,
} from '@/src/theme'

type ButtonProps = {
	label: string
	onPress: () => void
	variant?: 'primary' | 'secondary' | 'ghost'
	disabled?: boolean
	accessibilityLabel?: string
	style?: ViewStyle
}

export function AppButton({
	label,
	onPress,
	variant = 'primary',
	disabled = false,
	accessibilityLabel,
	style,
}: ButtonProps) {
	const isPrimary = variant === 'primary'
	const isSecondary = variant === 'secondary'

	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel={accessibilityLabel ?? label}
			disabled={disabled}
			onPress={onPress}
			style={({ pressed }) => [
				styles.base,
				isPrimary && styles.primary,
				isSecondary && styles.secondary,
				variant === 'ghost' && styles.ghost,
				disabled && styles.disabled,
				pressed && !disabled && styles.pressed,
				style,
			]}
		>
			<Text
				style={[
					styles.label,
					isPrimary && styles.labelPrimary,
					(isSecondary || variant === 'ghost') && styles.labelSecondary,
				]}
			>
				{label}
			</Text>
		</Pressable>
	)
}

type CardProps = {
	children: ReactNode
	style?: ViewStyle
}

export function SurfaceCard({ children, style }: CardProps) {
	return <View style={[styles.card, style]}>{children}</View>
}

const styles = StyleSheet.create({
	base: {
		minHeight: touchTarget.min + 4,
		borderRadius: radius.md,
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: spacing.lg,
	},
	primary: {
		backgroundColor: colors.light.primary,
	},
	secondary: {
		backgroundColor: colors.light.surface,
		borderWidth: 1.5,
		borderColor: colors.light.border,
	},
	ghost: {
		backgroundColor: 'transparent',
	},
	disabled: {
		opacity: 0.45,
	},
	pressed: {
		opacity: 0.9,
	},
	label: {
		...typography.bodyStrong,
	},
	labelPrimary: {
		color: '#FFFFFF',
	},
	labelSecondary: {
		color: colors.light.textPrimary,
	},
	card: {
		backgroundColor: colors.light.surface,
		borderRadius: radius.lg,
		padding: spacing.lg,
		...elevation.sm,
	},
})
