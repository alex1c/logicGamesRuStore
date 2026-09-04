import { useEffect, useRef, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AppButton, SurfaceCard } from '@/src/components/ui'
import {
	abandonWorkout,
	formatDuration,
	getLiveWorkout,
	waitForSessionPersistence,
} from '@/src/features/workout/sessionStore'
import {
	getAnyDailyCompletion,
	getStreakState,
	type DailyCompletionPersisted,
} from '@/src/storage'
import { CATEGORY_LABELS } from '@/src/features/puzzles/types'
import { consumePendingAchievements } from '@/src/features/progress/achievementPending'
import {
	getAchievementDef,
	type UnlockedAchievement,
} from '@/src/features/progress/achievements'
import { colors, spacing, typography } from '@/src/theme'
import { hapticAchievement } from '@/src/utils/haptics'
import { maybeShowInterstitial } from '@/src/monetization/interstitial/controller'

function toneMessage(correct: number, total: number): string {
	if (total === 0) {
		return 'Тренировка завершена'
	}
	const ratio = correct / total
	if (ratio >= 0.8) {
		return 'Отличная тренировка'
	}
	if (ratio >= 0.5) {
		return 'Хорошая работа'
	}
	return 'Тренировка завершена'
}

export default function WorkoutResultScreen() {
	const router = useRouter()
	const insets = useSafeAreaInsets()
	const live = getLiveWorkout()
	const [completion, setCompletion] = useState<DailyCompletionPersisted | null>(
		null,
	)
	const [streak, setStreak] = useState(0)
	const [unlocked, setUnlocked] = useState<UnlockedAchievement[]>([])

	const [exitBusy, setExitBusy] = useState(false)
	const exitLock = useRef(false)

	useEffect(() => {
		let active = true
		void (async () => {
			await waitForSessionPersistence()
			const [savedCompletion, savedStreak] = await Promise.all([
				getAnyDailyCompletion(),
				getStreakState(),
			])
			if (!active) return
			setCompletion(savedCompletion)
			setStreak(savedStreak.current)
			const pending = consumePendingAchievements()
			setUnlocked(pending)
			if (pending.length > 0) void hapticAchievement()
		})()
		return () => { active = false }
	}, [])

	const isDaily = live?.sessionType === 'daily' || (!live && completion != null)
	const total =
		live?.session.puzzles.length ??
		(completion
			? completion.correctCount + completion.wrongCount
			: 0)
	const correct = live?.correctCount ?? completion?.correctCount ?? 0
	const hints = live?.hintsUsed ?? completion?.hintsUsed ?? 0
	const elapsed = live?.elapsedMs ?? completion?.elapsedMs ?? 0
	const accuracy = total === 0 ? 0 : Math.round((correct / total) * 100)
	const breakdown =
		live != null
			? summarizeLive(live)
			: (completion?.categoryBreakdown ?? [])

	const leaveAfterAds = async (target: '/(tabs)' | '/(tabs)/play') => {
		if (exitLock.current) {
			return
		}
		exitLock.current = true
		setExitBusy(true)
		try {
			await maybeShowInterstitial()
		} catch {
			// Ads must never block exit.
		}
		abandonWorkout()
		router.replace(target)
	}

	return (
		<View
			style={[
				styles.screen,
				{ paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.md },
			]}
		>
			<Text style={styles.kicker}>{toneMessage(correct, total)}</Text>
			<Text style={styles.title}>
				{isDaily ? 'Тренировка завершена' : 'Практика завершена'}
			</Text>
			<Text style={styles.score}>
				{correct} / {total}
			</Text>

			<SurfaceCard style={styles.card}>
				<Row label="Точность" value={`${accuracy}%`} />
				<Row label="⏱ Время" value={formatDuration(elapsed)} />
				<Row label="💡 Подсказок" value={String(hints)} />
				{isDaily && <Row label="🔥 Серия" value={`${streak} дней`} />}
				{breakdown.map((row) => (
					<Row
						key={row.category}
						label={
							CATEGORY_LABELS[row.category as keyof typeof CATEGORY_LABELS] ??
							row.category
						}
						value={`${row.correct}/${row.total}`}
					/>
				))}
			</SurfaceCard>

			{unlocked.length > 0 && (
				<SurfaceCard style={styles.achieveCard}>
					<Text style={styles.achieveTitle}>Достижения открыты</Text>
					{unlocked.map((item) => {
						const def = getAchievementDef(item.id)
						return (
							<Text key={item.id} style={styles.achieveItem}>
								🏆 {def?.title ?? item.id}
							</Text>
						)
					})}
				</SurfaceCard>
			)}

			<View style={styles.footer}>
				<AppButton
					label="Готово"
					onPress={() => {
						void leaveAfterAds('/(tabs)')
					}}
					disabled={exitBusy}
				/>
				<AppButton
					label="Ещё потренироваться"
					variant="secondary"
					onPress={() => {
						void leaveAfterAds('/(tabs)/play')
					}}
					disabled={exitBusy}
				/>
			</View>
		</View>
	)
}

function summarizeLive(live: NonNullable<ReturnType<typeof getLiveWorkout>>) {
	const map = new Map<
		string,
		{ category: string; correct: number; total: number }
	>()
	live.session.puzzles.forEach((puzzle, index) => {
		const row = map.get(puzzle.category) ?? {
			category: puzzle.category,
			correct: 0,
			total: 0,
		}
		row.total += 1
		if (live.results[index] === 'correct') {
			row.correct += 1
		}
		map.set(puzzle.category, row)
	})
	return [...map.values()]
}

function Row({ label, value }: { label: string; value: string }) {
	return (
		<View style={styles.row}>
			<Text style={styles.rowLabel}>{label}</Text>
			<Text style={styles.rowValue}>{value}</Text>
		</View>
	)
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: colors.light.background,
		padding: spacing.lg,
		gap: spacing.md,
	},
	kicker: { ...typography.label, color: colors.light.accent },
	title: { ...typography.subtitle, color: colors.light.textSecondary },
	score: {
		fontSize: 48,
		lineHeight: 56,
		fontWeight: '700',
		color: colors.light.primary,
	},
	card: { gap: spacing.sm },
	row: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	rowLabel: {
		...typography.body,
		color: colors.light.textSecondary,
		flexShrink: 1,
	},
	rowValue: { ...typography.bodyStrong, color: colors.light.textPrimary },
	achieveCard: { gap: spacing.xs, backgroundColor: colors.light.warningMuted },
	achieveTitle: { ...typography.subtitle, color: colors.light.textPrimary },
	achieveItem: { ...typography.body, color: colors.light.textPrimary },
	footer: { marginTop: 'auto', gap: spacing.sm },
})
