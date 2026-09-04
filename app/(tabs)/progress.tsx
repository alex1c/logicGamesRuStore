import { ScrollView, StyleSheet, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { SurfaceCard } from '@/src/components/ui'
import { colors, spacing, typography } from '@/src/theme'

export default function ProgressScreen() {
	const insets = useSafeAreaInsets()

	return (
		<ScrollView
			style={styles.screen}
			contentContainerStyle={[
				styles.content,
				{ paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.xl },
			]}
		>
			<Text style={styles.title}>Прогресс</Text>
			<Text style={styles.subtitle}>
				Здесь появятся серия дней, история тренировок и навыки по категориям.
			</Text>
			<SurfaceCard>
				<Text style={styles.cardTitle}>Пока пусто</Text>
				<Text style={styles.cardBody}>
					Мы не показываем выдуманную статистику. После первых настоящих
					тренировок здесь будет честный прогресс.
				</Text>
			</SurfaceCard>
		</ScrollView>
	)
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: colors.light.background,
	},
	content: {
		padding: spacing.lg,
		gap: spacing.md,
	},
	title: {
		...typography.display,
		color: colors.light.textPrimary,
	},
	subtitle: {
		...typography.body,
		color: colors.light.textSecondary,
	},
	cardTitle: {
		...typography.subtitle,
		color: colors.light.textPrimary,
		marginBottom: spacing.xs,
	},
	cardBody: {
		...typography.body,
		color: colors.light.textSecondary,
	},
})
