import { ScrollView, StyleSheet, Text, Pressable, View } from 'react-native'
import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AppButton, SurfaceCard } from '@/src/components/ui'
import { PLAYABLE_CATEGORIES } from '@/src/features/workout/createDailyWorkout'
import {
	getLiveWorkout,
	getPracticeResumeInfo,
	restoreActiveWorkout,
	startPracticeSession,
} from '@/src/features/workout/sessionStore'
import { CATEGORY_LABELS, type PuzzleCategory } from '@/src/features/puzzles/types'
import { colors, elevation, radius, spacing, typography } from '@/src/theme'
import { hapticSelect } from '@/src/utils/haptics'
import { BannerSlot } from '@/src/monetization/banner/BannerSlot'

const DESCRIPTIONS: Record<PuzzleCategory, string> = {
	logic: 'Короткие задачи на рассуждение.',
	math: 'Числовые закономерности.',
	sequence: 'Найдите правило и продолжите ряд.',
	attention: 'Найдите отличающийся символ.',
	odd_one_out: 'Определите элемент, который не подходит.',
	words: 'Аналогии и словесные задачи.',
	matchsticks: 'Переместите одну спичку.',
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
	const [resume, setResume] = useState<{
		category: PuzzleCategory
		currentIndex: number
		total: number
	} | null>(null)

	useFocusEffect(
		useCallback(() => {
			let active = true
			void (async () => {
				await restoreActiveWorkout()
				const nextResume = getPracticeResumeInfo(getLiveWorkout())
				if (active) setResume(nextResume)
			})()
			return () => {
				active = false
			}
		}, []),
	)

	const handleCategory = async (category: PuzzleCategory) => {
		void hapticSelect()
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

			{resume ? (
				<SurfaceCard style={styles.resumeCard}>
					<Text style={styles.resumeTitle}>Продолжить тренировку</Text>
					<Text style={styles.resumeBody}>
						{CATEGORY_LABELS[resume.category]} · задача {resume.currentIndex + 1} из{' '}
						{resume.total}
					</Text>
					<AppButton
						label="Продолжить"
						onPress={() => router.push('/workout/play')}
					/>
				</SurfaceCard>
			) : null}

			{PLAYABLE_CATEGORIES.map((category, index) => (
				<View key={category}>
					{index === 4 ? <BannerSlot placement="play" /> : null}
					<Pressable
						accessibilityRole="button"
						accessibilityLabel={CATEGORY_LABELS[category]}
						onPress={() => {
							void handleCategory(category)
						}}
						style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
					>
						<SurfaceCard style={styles.card}>
							<View style={styles.cardRow}>
								<View style={styles.iconWrap}>
									<Text style={styles.icon}>{ICONS[category]}</Text>
								</View>
								<View style={styles.cardText}>
									<Text style={styles.cardTitle}>
										{CATEGORY_LABELS[category]}
									</Text>
									<Text style={styles.cardBody}>{DESCRIPTIONS[category]}</Text>
								</View>
							</View>
						</SurfaceCard>
					</Pressable>
				</View>
			))}
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
	resumeCard: { ...elevation.sm, gap: spacing.sm },
	resumeTitle: { ...typography.subtitle, color: colors.light.textPrimary },
	resumeBody: { ...typography.body, color: colors.light.textSecondary },
	card: { ...elevation.sm },
	cardRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
	iconWrap: {
		width: 48,
		height: 48,
		borderRadius: radius.md,
		backgroundColor: colors.light.primaryMuted,
		alignItems: 'center',
		justifyContent: 'center',
	},
	icon: { fontSize: 24 },
	cardText: { flex: 1, gap: 2 },
	cardTitle: { ...typography.subtitle, color: colors.light.textPrimary },
	cardBody: { ...typography.caption, color: colors.light.textSecondary },
})
