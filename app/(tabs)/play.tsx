import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AppButton, SurfaceCard } from '@/src/components/ui'
import { ALL_CATEGORIES, CATEGORY_LABELS } from '@/src/features/puzzles/types'
import { startDemoWorkout } from '@/src/features/workout/sessionStore'
import { colors, spacing, typography } from '@/src/theme'

export default function PlayScreen() {
	const router = useRouter()
	const insets = useSafeAreaInsets()

	const handleDemo = () => {
		startDemoWorkout()
		router.push('/workout')
	}

	return (
		<ScrollView
			style={styles.screen}
			contentContainerStyle={[
				styles.content,
				{ paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.xl },
			]}
		>
			<Text style={styles.title}>Играть</Text>
			<Text style={styles.subtitle}>
				Категории появятся в следующих фазах. Сейчас доступна демо-тренировка
				для проверки Puzzle Engine.
			</Text>

			<SurfaceCard>
				<Text style={styles.cardTitle}>Мини-тренировка</Text>
				<Text style={styles.cardBody}>5 задач · смешанные типы</Text>
				<View style={styles.spacer} />
				<AppButton label="Начать" onPress={handleDemo} />
			</SurfaceCard>

			<Text style={styles.section}>Категории (скоро)</Text>
			{ALL_CATEGORIES.map((category) => (
				<View key={category} style={styles.categoryRow}>
					<Text style={styles.categoryLabel}>
						{CATEGORY_LABELS[category]}
					</Text>
					<Text style={styles.categorySoon}>Скоро</Text>
				</View>
			))}
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
	},
	cardBody: {
		...typography.body,
		color: colors.light.textSecondary,
		marginTop: spacing.xxs,
	},
	spacer: {
		height: spacing.md,
	},
	section: {
		...typography.label,
		color: colors.light.textTertiary,
		marginTop: spacing.sm,
	},
	categoryRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		backgroundColor: colors.light.surface,
		paddingHorizontal: spacing.md,
		paddingVertical: spacing.md,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: colors.light.border,
	},
	categoryLabel: {
		...typography.body,
		color: colors.light.textPrimary,
	},
	categorySoon: {
		...typography.caption,
		color: colors.light.textTertiary,
	},
})
