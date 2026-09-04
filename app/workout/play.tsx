import { useCallback, useMemo, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useFocusEffect, useRouter } from 'expo-router'
import { PuzzleRunner } from '@/src/features/puzzles/engine/PuzzleRunner'
import {
	getCurrentPuzzle,
	getLiveWorkout,
	recordPuzzleResult,
	restoreActiveWorkout,
} from '@/src/features/workout/sessionStore'
import { colors, spacing, typography } from '@/src/theme'

export default function WorkoutPlayScreen() {
	const router = useRouter()
	const [tick, setTick] = useState(0)
	const [ready, setReady] = useState(false)

	useFocusEffect(
		useCallback(() => {
			let active = true
			void (async () => {
				if (!getLiveWorkout()) {
					await restoreActiveWorkout()
				}
				if (active) {
					setReady(true)
					setTick((n) => n + 1)
				}
			})()
			return () => {
				active = false
			}
		}, []),
	)

	const live = getLiveWorkout()
	const puzzle = getCurrentPuzzle()
	const total = live?.session.puzzles.length ?? 0
	const index = (live?.currentIndex ?? 0) + 1
	const runnerKey = useMemo(
		() => `${puzzle?.id ?? 'none'}-${tick}`,
		[puzzle?.id, tick],
	)

	if (!ready) {
		return (
			<View style={styles.center}>
				<Text style={styles.message}>Загрузка…</Text>
			</View>
		)
	}

	if (!live) {
		return (
			<View style={styles.center}>
				<Text style={styles.message}>Тренировка не найдена</Text>
			</View>
		)
	}

	if (live.finished || !puzzle) {
		router.replace('/workout/result')
		return (
			<View style={styles.center}>
				<Text style={styles.message}>Завершаем…</Text>
			</View>
		)
	}

	return (
		<View style={styles.screen}>
			<PuzzleRunner
				key={runnerKey}
				puzzle={puzzle}
				index={index}
				total={total}
				sessionId={live.session.id}
				onComplete={(result) => {
					const next = recordPuzzleResult({
						isCorrect: result.isCorrect,
						hintsUsed: result.hintsUsed,
						revealedSolution: result.revealedSolution,
					})
					if (next?.finished) {
						router.replace('/workout/result')
					} else {
						setTick((n) => n + 1)
					}
				}}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	screen: { flex: 1, backgroundColor: colors.light.background },
	center: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.light.background,
		padding: spacing.lg,
	},
	message: { ...typography.body, color: colors.light.textSecondary },
})
