import { Link, Stack } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'
import { colors, spacing, typography } from '@/src/theme'

export default function NotFoundScreen() {
	return (
		<>
			<Stack.Screen options={{ title: 'Не найдено' }} />
			<View style={styles.container}>
				<Text style={styles.title}>Экран не найден</Text>
				<Link href="/" style={styles.link}>
					<Text style={styles.linkText}>На главную</Text>
				</Link>
			</View>
		</>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		padding: spacing.lg,
		backgroundColor: colors.light.background,
	},
	title: {
		...typography.title,
		color: colors.light.textPrimary,
	},
	link: {
		marginTop: spacing.md,
		paddingVertical: spacing.sm,
	},
	linkText: {
		...typography.bodyStrong,
		color: colors.light.primary,
	},
})
