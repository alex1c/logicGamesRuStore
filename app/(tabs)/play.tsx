import { ScrollView, StyleSheet, Text, Pressable, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { SurfaceCard } from '@/src/components/ui'
import {
	PLAYABLE_CATEGORIES,
} from '@/src/features/workout/createDailyWorkout'
import { startPracticeSession } from '@/src/features/workout/sessionStore'
import { CATEGORY_LABELS, type PuzzleCategory } from '@/src/features/puzzles/types'
import { colors, elevation, radius, spacing, typography } from '@/src/theme'

const DESCRIPTIONS: Record<PuzzleCategory, string> = {
	logic: 'Короткие задачи на рассуждение.',
	math: 'Числовые закономерности.',
	sequence: 'Найдите правило и продолжите ряд.',
	attention: 'Найдите отличающийся символ.',
	odd_one_out: 'Определите элемент, который не подходит.',
	words: 'Аналогии и словесные задачи.',
	matchsticks: 'Скоро',
}

const ICONS: Record<PuzzleCategory, string> = {
	logic: '🧩',
	math: '🔢',
	sequence: '📶',
	attention: '👁',
	odd_one_out: '🔎',
	words: '🔤',
	matchsticks: '｜',
}

export default function PlayScreen() {
	const router = useRouter()
	const insets = useSafeAreaInsets()

	const handleCategory = async (category: PuzzleCategory) => {
		await startPracticeSession(category)
		router.push('/workout/play')
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
				Выберите категорию — 10 задач без лимита времени. Практика не влияет
				на дневную серию.
			</Text>

			{PLAYABLE_CATEGORIES.map((category) => (
				<Pressable
					key={category}
					accessibilityRole="button"
					accessibilityLabel={CATEGORY_LABELS[category]}
					onPress={() => {
						void handleCategory(category)
					}}
					style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
				>
					<SurfaceCard style={styles.card}>
						<View style={styles.cardRow}>
							<Text style={styles.icon}>{ICONS[category]}</Text>
							<View style={styles.cardText}>
								<Text style={styles.cardTitle}>
									{CATEGORY_LABELS[category]}
								</Text>
								<Text style={styles.cardBody}>{DESCRIPTIONS[category]}</Text>
							</View>
						</View>
					</SurfaceCard>
				</Pressable>
			))}

			<SurfaceCard style={[styles.card, styles.soonCard]}>
				<View style={styles.cardRow}>
					<Text style={styles.icon}>｜</Text>
					<View style={styles.cardText}>
						<Text style={styles.cardTitle}>Спички</Text>
						<Text style={styles.cardBody}>Скоро</Text>
					</View>
					<Text style={styles.soonBadge}>Скоро</Text>
				</View>
			</SurfaceCard>
		</ScrollView>
	)
}

const styles = StyleSheet.create({
	screen: { flex: 1, backgroundColor: colors.light.background },
	content: { padding: spacing.lg, gap: spacing.sm },
	title: { ...typography.display, color: colors.light.textPrimary },
	subtitle: {
		...typography.body,
		color: colors.light.textSecondary,
		marginBottom: spacing.sm,
	},
	card: { ...elevation.sm },
	soonCard: { opacity: 0.72 },
	cardRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
	icon: { fontSize: 28, width: 36, textAlign: 'center' },
	cardText: { flex: 1, gap: 2 },
	cardTitle: { ...typography.subtitle, color: colors.light.textPrimary },
	cardBody: { ...typography.caption, color: colors.light.textSecondary },
	soonBadge: {
		...typography.label,
		color: colors.light.textTertiary,
		backgroundColor: colors.light.surfaceMuted,
		paddingHorizontal: spacing.sm,
		paddingVertical: spacing.xxs,
		borderRadius: radius.pill,
		overflow: 'hidden',
	},
})
