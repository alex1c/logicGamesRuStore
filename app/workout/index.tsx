import { StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AppButton, SurfaceCard } from '@/src/components/ui'
import {
	getLiveWorkout,
	startDemoWorkout,
} from '@/src/features/workout/sessionStore'
import { colors, spacing, typography } from '@/src/theme'

export default function WorkoutIntroScreen() {
	const router = useRouter()
	const insets = useSafeAreaInsets()

	const handleStart = () => {
		if (!getLiveWorkout()) {
			startDemoWorkout()
		}
		router.push('/workout/play')
	}

	return (
		<View
			style={[
				styles.screen,
				{ paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.md },
			]}
		>
			<Text style={styles.kicker}>Демо</Text>
			<Text style={styles.title}>Мини-тренировка</Text>
			<Text style={styles.subtitle}>5 задач</Text>

			<SurfaceCard style={styles.card}>
				<Text style={styles.cardBody}>
					Смешанный набор: последовательность, математика, внимание, лишнее
					число и curated-логика. Нужен, чтобы проверить Puzzle Engine.
				</Text>
			</SurfaceCard>

			<View style={styles.footer}>
				<AppButton label="Начать" onPress={handleStart} />
				<AppButton
					label="Назад"
					variant="ghost"
					onPress={() => router.back()}
				/>
			</View>
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
		color: colors.light.primary,
	},
	title: {
		...typography.display,
		color: colors.light.textPrimary,
	},
	subtitle: {
		...typography.subtitle,
		color: colors.light.textSecondary,
	},
	card: {
		marginTop: spacing.sm,
	},
	cardBody: {
		...typography.body,
		color: colors.light.textSecondary,
	},
	footer: {
		marginTop: 'auto',
		gap: spacing.sm,
	},
})
