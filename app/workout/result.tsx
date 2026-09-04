import { StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AppButton, SurfaceCard } from '@/src/components/ui'
import {
	abandonWorkout,
	formatDuration,
	getLiveWorkout,
} from '@/src/features/workout/sessionStore'
import { colors, spacing, typography } from '@/src/theme'

export default function WorkoutResultScreen() {
	const router = useRouter()
	const insets = useSafeAreaInsets()
	const live = getLiveWorkout()

	const total = live?.session.puzzles.length ?? 0
	const correct = live?.correctCount ?? 0
	const wrong = live?.wrongCount ?? 0
	const hints = live?.hintsUsed ?? 0
	const elapsed = live?.elapsedMs ?? 0

	const handleDone = () => {
		abandonWorkout()
		router.replace('/(tabs)')
	}

	const handleAgain = () => {
		abandonWorkout()
		router.replace('/workout')
	}

	return (
		<View
			style={[
				styles.screen,
				{ paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.md },
			]}
		>
			<Text style={styles.kicker}>Готово</Text>
			<Text style={styles.title}>Результат</Text>
			<Text style={styles.score}>
				{correct} / {total}
			</Text>

			<SurfaceCard style={styles.card}>
				<Row label="Правильных" value={String(correct)} />
				<Row label="Ошибок" value={String(wrong)} />
				<Row label="Использовано подсказок" value={String(hints)} />
				<Row label="Время" value={formatDuration(elapsed)} />
			</SurfaceCard>

			<View style={styles.footer}>
				<AppButton label="На главный экран" onPress={handleDone} />
				<AppButton
					label="Ещё раз"
					variant="secondary"
					onPress={handleAgain}
				/>
			</View>
		</View>
	)
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
	kicker: {
		...typography.label,
		color: colors.light.accent,
	},
	title: {
		...typography.display,
		color: colors.light.textPrimary,
	},
	score: {
		fontSize: 48,
		lineHeight: 56,
		fontWeight: '700',
		color: colors.light.primary,
	},
	card: {
		gap: spacing.sm,
	},
	row: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	rowLabel: {
		...typography.body,
		color: colors.light.textSecondary,
	},
	rowValue: {
		...typography.bodyStrong,
		color: colors.light.textPrimary,
	},
	footer: {
		marginTop: 'auto',
		gap: spacing.sm,
	},
})
