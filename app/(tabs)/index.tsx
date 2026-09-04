import { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AppButton, SurfaceCard } from '@/src/components/ui'
import { DAILY_WORKOUT_CONCEPT } from '@/src/features/workout/createDemoWorkout'
import { startDemoWorkout } from '@/src/features/workout/sessionStore'
import { getStreakDays } from '@/src/storage'
import {
	colors,
	elevation,
	radius,
	spacing,
	typography,
} from '@/src/theme'

export default function TodayScreen() {
	const router = useRouter()
	const insets = useSafeAreaInsets()
	const [streak, setStreak] = useState(0)

	useEffect(() => {
		void getStreakDays().then(setStreak)
	}, [])

	const handleStart = () => {
		startDemoWorkout()
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
			<Text style={styles.kicker}>Логические игры</Text>
			<Text style={styles.title}>Сегодняшняя тренировка</Text>
			<Text style={styles.subtitle}>
				Короткая смешанная сессия на внимание и рассуждение — без
				псевдонаучных обещаний про IQ.
			</Text>

			<SurfaceCard style={styles.mixCard}>
				{DAILY_WORKOUT_CONCEPT.mix.map((row) => (
					<View key={row.categoryLabel} style={styles.mixRow}>
						<Text style={styles.mixLabel}>{row.categoryLabel}</Text>
						<Text style={styles.mixCount}>{row.count}</Text>
					</View>
				))}
				<View style={styles.mixFooter}>
					<Text style={styles.mixMeta}>
						{DAILY_WORKOUT_CONCEPT.totalPuzzles} задач · ~
						{DAILY_WORKOUT_CONCEPT.estimatedMinutes} минут
					</Text>
				</View>
			</SurfaceCard>

			<AppButton
				label="Начать тренировку"
				onPress={handleStart}
				accessibilityLabel="Начать демо-тренировку"
			/>

			<Text style={styles.demoNote}>
				Сейчас откроется мини-тренировка из 5 задач для проверки движка.
			</Text>

			<View style={styles.streakRow}>
				<Text style={styles.streakEmoji}>🔥</Text>
				<Text style={styles.streakText}>Серия: {streak} дней</Text>
			</View>

			<SurfaceCard style={styles.progressStub}>
				<Text style={styles.stubTitle}>Прогресс</Text>
				<Text style={styles.stubBody}>
					История тренировок и навыки появятся позже. Пока здесь только
					заглушка — без выдуманной статистики.
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
	kicker: {
		...typography.label,
		color: colors.light.primary,
		textTransform: 'uppercase',
		letterSpacing: 0.6,
	},
	title: {
		...typography.display,
		color: colors.light.textPrimary,
	},
	subtitle: {
		...typography.body,
		color: colors.light.textSecondary,
		marginBottom: spacing.xs,
	},
	mixCard: {
		gap: spacing.sm,
	},
	mixRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: spacing.xxs,
	},
	mixLabel: {
		...typography.body,
		color: colors.light.textPrimary,
	},
	mixCount: {
		...typography.bodyStrong,
		color: colors.light.primary,
		minWidth: 24,
		textAlign: 'right',
	},
	mixFooter: {
		marginTop: spacing.sm,
		paddingTop: spacing.sm,
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: colors.light.border,
	},
	mixMeta: {
		...typography.caption,
		color: colors.light.textSecondary,
	},
	demoNote: {
		...typography.caption,
		color: colors.light.textTertiary,
		textAlign: 'center',
	},
	streakRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.xs,
		alignSelf: 'flex-start',
		backgroundColor: colors.light.warningMuted,
		paddingHorizontal: spacing.md,
		paddingVertical: spacing.sm,
		borderRadius: radius.pill,
	},
	streakEmoji: {
		fontSize: 18,
	},
	streakText: {
		...typography.bodyStrong,
		color: colors.light.streak,
	},
	progressStub: {
		...elevation.sm,
	},
	stubTitle: {
		...typography.subtitle,
		color: colors.light.textPrimary,
		marginBottom: spacing.xs,
	},
	stubBody: {
		...typography.body,
		color: colors.light.textSecondary,
	},
})
