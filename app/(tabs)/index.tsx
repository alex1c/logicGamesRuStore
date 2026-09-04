import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useCallback, useState } from 'react'
import { useFocusEffect, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AppButton, SurfaceCard } from '@/src/components/ui'
import {
	createDailyWorkout,
	DAILY_ESTIMATED_MINUTES,
	DAILY_SIZE,
} from '@/src/features/workout/createDailyWorkout'
import {
	getLiveWorkout,
	restoreActiveWorkout,
	startDailyWorkoutSession,
} from '@/src/features/workout/sessionStore'
import {
	getDailyCompletion,
	getOrCreateProfile,
	getProgressAggregates,
	getSkills,
	getStreakState,
	type DailyCompletionPersisted,
} from '@/src/storage'
import { formatClock, toLocalDateString } from '@/src/utils/localDate'
import {
	colors,
	elevation,
	radius,
	spacing,
	typography,
} from '@/src/theme'
import { CATEGORY_LABELS } from '@/src/features/puzzles/types'

const CATEGORY_ICON: Record<string, string> = {
	logic: '🧩',
	math: '🔢',
	sequence: '📶',
	attention: '👁',
	odd_one_out: '🔎',
	words: '🔤',
	matchsticks: '｜',
}

type TodayState = {
	streak: number
	mix: { category: string; label: string; count: number }[]
	completion: DailyCompletionPersisted | null
	canResume: boolean
	puzzlesSolved: number
	loading: boolean
}

export default function TodayScreen() {
	const router = useRouter()
	const insets = useSafeAreaInsets()
	const [state, setState] = useState<TodayState>({
		streak: 0,
		mix: [],
		completion: null,
		canResume: false,
		puzzlesSolved: 0,
		loading: true,
	})

	useFocusEffect(
		useCallback(() => {
			let active = true
			void (async () => {
				const today = toLocalDateString()
				const profile = await getOrCreateProfile()
				const skills = await getSkills()
				const preview = createDailyWorkout({
					workoutDate: today,
					profileSeed: profile.profileSeed,
					skills,
				})
				const completion = await getDailyCompletion(today)
				await restoreActiveWorkout()
				const live = getLiveWorkout()
				const canResume = Boolean(
					live &&
						!live.finished &&
						live.sessionType === 'daily' &&
						live.workoutDate === today,
				)
				const aggregates = await getProgressAggregates()
				const streak = (await getStreakState()).current
				if (!active) {
					return
				}
				setState({
					streak,
					mix: preview.mix,
					completion,
					canResume: canResume && !completion,
					puzzlesSolved: aggregates.puzzlesCorrect,
					loading: false,
				})
			})()
			return () => {
				active = false
			}
		}, []),
	)

	const handleStart = async () => {
		if (state.canResume) {
			router.push('/workout/play')
			return
		}
		await startDailyWorkoutSession()
		router.push('/workout/play')
	}

	const done = state.completion != null

	return (
		<ScrollView
			style={styles.screen}
			contentContainerStyle={[
				styles.content,
				{ paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.xl },
			]}
		>
			<Text style={styles.kicker}>Логические игры</Text>
			<Text style={styles.title}>
				{done ? 'Сегодня выполнено' : 'Сегодня'}
			</Text>
			<Text style={styles.subtitle}>
				{done
					? 'Дневная тренировка уже позади. Можно ещё немного попрактиковаться.'
					: 'Короткая смешанная сессия — 10 задач без спешки.'}
			</Text>

			{!done && (
				<SurfaceCard style={styles.heroCard}>
					<Text style={styles.heroTitle}>Daily Workout</Text>
					{state.mix.map((row) => (
						<View key={row.category} style={styles.mixRow}>
							<Text style={styles.mixLabel}>
								{CATEGORY_ICON[row.category] ?? '•'} {row.label}
							</Text>
							<Text style={styles.mixCount}>{row.count}</Text>
						</View>
					))}
					<View style={styles.mixFooter}>
						<Text style={styles.mixMeta}>
							{DAILY_SIZE} задач · ~{DAILY_ESTIMATED_MINUTES} минут
						</Text>
					</View>
				</SurfaceCard>
			)}

			{done && state.completion && (
				<SurfaceCard style={styles.heroCard}>
					<Text style={styles.scoreLine}>
						{state.completion.correctCount} /{' '}
						{state.completion.correctCount + state.completion.wrongCount}
					</Text>
					<Text style={styles.mixMeta}>
						⏱ {formatClock(state.completion.elapsedMs)} · 💡{' '}
						{state.completion.hintsUsed} подсказок
					</Text>
					{state.completion.categoryBreakdown.map((row) => (
						<View key={row.category} style={styles.mixRow}>
							<Text style={styles.mixLabel}>
								{CATEGORY_ICON[row.category] ?? '•'}{' '}
								{CATEGORY_LABELS[row.category]}
							</Text>
							<Text style={styles.mixCount}>
								{row.correct}/{row.total}
							</Text>
						</View>
					))}
				</SurfaceCard>
			)}

			<View style={styles.streakRow}>
				<Text style={styles.streakEmoji}>🔥</Text>
				<Text style={styles.streakText}>Серия: {state.streak} дней</Text>
			</View>

			{state.puzzlesSolved > 0 && (
				<Text style={styles.snapshot}>
					Всего верных ответов: {state.puzzlesSolved}
				</Text>
			)}

			{!done && (
				<AppButton
					label={
						state.canResume ? 'Продолжить тренировку' : 'Начать тренировку'
					}
					onPress={() => {
						void handleStart()
					}}
					disabled={state.loading}
				/>
			)}

			{done && (
				<>
					<AppButton
						label="Посмотреть результат"
						onPress={() => router.push('/workout/result')}
					/>
					<AppButton
						label="Потренироваться ещё"
						variant="secondary"
						onPress={() => router.push('/(tabs)/play')}
					/>
				</>
			)}

			{!done && (
				<AppButton
					label="Игровые режимы"
					variant="secondary"
					onPress={() => router.push('/(tabs)/play')}
				/>
			)}
		</ScrollView>
	)
}

const styles = StyleSheet.create({
	screen: { flex: 1, backgroundColor: colors.light.background },
	content: { padding: spacing.lg, gap: spacing.md },
	kicker: {
		...typography.label,
		color: colors.light.primary,
		textTransform: 'uppercase',
		letterSpacing: 0.6,
	},
	title: { ...typography.display, color: colors.light.textPrimary },
	subtitle: { ...typography.body, color: colors.light.textSecondary },
	heroCard: { gap: spacing.sm, ...elevation.sm },
	heroTitle: { ...typography.subtitle, color: colors.light.textPrimary },
	mixRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: spacing.xxs,
	},
	mixLabel: {
		...typography.body,
		color: colors.light.textPrimary,
		flexShrink: 1,
		paddingRight: spacing.sm,
	},
	mixCount: {
		...typography.bodyStrong,
		color: colors.light.primary,
		minWidth: 28,
		textAlign: 'right',
	},
	mixFooter: {
		marginTop: spacing.sm,
		paddingTop: spacing.sm,
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: colors.light.border,
	},
	mixMeta: { ...typography.caption, color: colors.light.textSecondary },
	scoreLine: {
		fontSize: 40,
		lineHeight: 48,
		fontWeight: '700',
		color: colors.light.primary,
		marginBottom: spacing.xs,
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
	streakEmoji: { fontSize: 18 },
	streakText: { ...typography.bodyStrong, color: colors.light.streak },
	snapshot: { ...typography.caption, color: colors.light.textTertiary },
})
