import { useCallback, useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useFocusEffect, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AppButton, SurfaceCard } from '@/src/components/ui'
import { PLAYABLE_CATEGORIES } from '@/src/features/workout/createDailyWorkout'
import {
	getCategorySkill,
	skillToDisplayScore,
	SKILL_DEFAULT,
} from '@/src/features/progress/skillModel'
import {
	getProgressAggregates,
	getSessionHistory,
	getSkills,
	getStreakState,
	type SessionHistoryItem,
} from '@/src/storage'
import { CATEGORY_LABELS } from '@/src/features/puzzles/types'
import { formatClock } from '@/src/utils/localDate'
import { colors, radius, spacing, typography } from '@/src/theme'

export default function ProgressScreen() {
	const router = useRouter()
	const insets = useSafeAreaInsets()
	const [skills, setSkills] = useState<Record<string, number>>({})
	const [streak, setStreak] = useState({ current: 0, best: 0 })
	const [aggregates, setAggregates] = useState({
		workoutsCompleted: 0,
		practiceCompleted: 0,
		puzzlesSolved: 0,
		puzzlesCorrect: 0,
	})
	const [history, setHistory] = useState<SessionHistoryItem[]>([])

	useFocusEffect(
		useCallback(() => {
			void (async () => {
				setSkills(await getSkills())
				setStreak(await getStreakState())
				setAggregates(await getProgressAggregates())
				setHistory(await getSessionHistory())
			})()
		}, []),
	)

	const hasActivity =
		aggregates.workoutsCompleted + aggregates.practiceCompleted > 0
	const accuracy =
		aggregates.puzzlesSolved === 0
			? 0
			: Math.round(
					(aggregates.puzzlesCorrect / aggregates.puzzlesSolved) * 100,
				)

	return (
		<ScrollView
			style={styles.screen}
			contentContainerStyle={[
				styles.content,
				{ paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.xl },
			]}
		>
			<Text style={styles.title}>Прогресс</Text>

			{!hasActivity ? (
				<SurfaceCard>
					<Text style={styles.emptyTitle}>Начните первую тренировку</Text>
					<Text style={styles.emptyBody}>
						После нескольких задач здесь появится ваш прогресс.
					</Text>
					<View style={styles.spacer} />
					<AppButton
						label="К сегодняшней тренировке"
						onPress={() => router.push('/(tabs)')}
					/>
				</SurfaceCard>
			) : null}

			<Text style={styles.section}>Ваши навыки</Text>
			<Text style={styles.sectionHint}>
				Шкала 0–100 отражает практику в категориях. Это не IQ и не оценка
				интеллекта.
			</Text>

			{PLAYABLE_CATEGORIES.map((category) => {
				const skill = getCategorySkill(skills, category)
				const score = hasActivity
					? skillToDisplayScore(skill)
					: skillToDisplayScore(SKILL_DEFAULT)
				return (
					<View key={category} style={styles.skillRow}>
						<View style={styles.skillHeader}>
							<Text style={styles.skillLabel}>
								{CATEGORY_LABELS[category]}
							</Text>
							<Text style={styles.skillScore}>
								{hasActivity ? score : '—'}
							</Text>
						</View>
						<View style={styles.barTrack}>
							<View
								style={[
									styles.barFill,
									{
										width: `${hasActivity ? score : 20}%`,
										opacity: hasActivity ? 1 : 0.35,
									},
								]}
							/>
						</View>
					</View>
				)
			})}

			{hasActivity && (
				<>
					<Text style={styles.section}>Активность</Text>
					<SurfaceCard style={styles.statsCard}>
						<Stat label="Тренировок" value={String(aggregates.workoutsCompleted)} />
						<Stat label="Практика" value={String(aggregates.practiceCompleted)} />
						<Stat label="Решено задач" value={String(aggregates.puzzlesSolved)} />
						<Stat label="Правильных" value={String(aggregates.puzzlesCorrect)} />
						<Stat label="Точность" value={`${accuracy}%`} />
						<Stat label="Серия" value={`${streak.current} дн.`} />
						<Stat label="Лучшая серия" value={`${streak.best} дн.`} />
					</SurfaceCard>

					<Text style={styles.section}>Последние тренировки</Text>
					{history.slice(0, 8).map((item) => (
						<SurfaceCard key={`${item.sessionId}-${item.completedAt}`} style={styles.historyCard}>
							<Text style={styles.historyTitle}>{item.title}</Text>
							<Text style={styles.historyMeta}>
								{item.correctCount}/{item.total} · ⏱ {formatClock(item.elapsedMs)} ·{' '}
								{item.sessionType === 'daily' ? 'Сегодня' : 'Практика'}
							</Text>
						</SurfaceCard>
					))}
				</>
			)}
		</ScrollView>
	)
}

function Stat({ label, value }: { label: string; value: string }) {
	return (
		<View style={styles.statRow}>
			<Text style={styles.statLabel}>{label}</Text>
			<Text style={styles.statValue}>{value}</Text>
		</View>
	)
}

const styles = StyleSheet.create({
	screen: { flex: 1, backgroundColor: colors.light.background },
	content: { padding: spacing.lg, gap: spacing.sm },
	title: { ...typography.display, color: colors.light.textPrimary, marginBottom: spacing.sm },
	section: {
		...typography.subtitle,
		color: colors.light.textPrimary,
		marginTop: spacing.md,
	},
	sectionHint: {
		...typography.caption,
		color: colors.light.textTertiary,
		marginBottom: spacing.xs,
	},
	emptyTitle: { ...typography.subtitle, color: colors.light.textPrimary },
	emptyBody: { ...typography.body, color: colors.light.textSecondary, marginTop: spacing.xs },
	spacer: { height: spacing.md },
	skillRow: { gap: spacing.xs, marginBottom: spacing.sm },
	skillHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	skillLabel: { ...typography.body, color: colors.light.textPrimary },
	skillScore: { ...typography.bodyStrong, color: colors.light.primary },
	barTrack: {
		height: 10,
		borderRadius: radius.pill,
		backgroundColor: colors.light.surfaceMuted,
		overflow: 'hidden',
	},
	barFill: {
		height: '100%',
		backgroundColor: colors.light.primary,
		borderRadius: radius.pill,
	},
	statsCard: { gap: spacing.sm },
	statRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	statLabel: { ...typography.body, color: colors.light.textSecondary },
	statValue: { ...typography.bodyStrong, color: colors.light.textPrimary },
	historyCard: { gap: 4 },
	historyTitle: { ...typography.bodyStrong, color: colors.light.textPrimary },
	historyMeta: { ...typography.caption, color: colors.light.textSecondary },
})
