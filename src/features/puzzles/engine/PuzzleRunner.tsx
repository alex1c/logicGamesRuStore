import { useMemo, useRef, useState } from 'react'
import {
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from 'react-native'
import type { Puzzle } from '../types'
import { CATEGORY_LABELS } from '../types'
import { checkAnswer } from '../validation/checkAnswer'
import { PuzzleInteractionRenderer } from '../renderers/PuzzleInteractionRenderer'
import {
	colors,
	elevation,
	radius,
	spacing,
	touchTarget,
	typography,
} from '@/src/theme'

export type PuzzleRunnerResult = {
	isCorrect: boolean
	hintsUsed: number
	revealedSolution: boolean
}

type Props = {
	puzzle: Puzzle
	/** 1-based index for progress display. */
	index: number
	total: number
	onComplete: (result: PuzzleRunnerResult) => void
}

type Phase = 'answering' | 'feedback'

/**
 * Universal puzzle shell: prompt, interaction renderer, hints, explanation, next.
 */
export function PuzzleRunner({ puzzle, index, total, onComplete }: Props) {
	const [selectedValue, setSelectedValue] = useState<string | null>(null)
	const [phase, setPhase] = useState<Phase>('answering')
	const [isCorrect, setIsCorrect] = useState(false)
	const [hintLevelShown, setHintLevelShown] = useState(0)
	const [revealedSolution, setRevealedSolution] = useState(false)
	const [hintsUsed, setHintsUsed] = useState(0)
	const completionSent = useRef(false)
	const hintLevelRef = useRef(0)

	const canSubmit = useMemo(() => {
		if (selectedValue == null) {
			return false
		}
		return selectedValue.trim().length > 0
	}, [selectedValue])

	const sortedHints = useMemo(
		() => [...puzzle.hints].sort((a, b) => a.level - b.level),
		[puzzle.hints],
	)

	const handleCheck = () => {
		if (!canSubmit || selectedValue == null) {
			return
		}
		const result = checkAnswer(puzzle, selectedValue)
		setIsCorrect(result.isCorrect)
		setPhase('feedback')
	}

	const handleHint = () => {
		if (hintLevelRef.current >= sortedHints.length) {
			return
		}
		hintLevelRef.current += 1
		setHintLevelShown(hintLevelRef.current)
		setHintsUsed((n) => n + 1)
	}

	const handleReveal = () => {
		setRevealedSolution(true)
		setIsCorrect(false)
		setPhase('feedback')
	}

	const handleNext = () => {
		if (completionSent.current) {
			return
		}
		completionSent.current = true
		onComplete({
			isCorrect: isCorrect && !revealedSolution,
			hintsUsed,
			revealedSolution,
		})
	}

	const locked = phase === 'feedback'
	const showExplanation = phase === 'feedback'

	return (
		<ScrollView
			contentContainerStyle={styles.container}
			keyboardShouldPersistTaps="handled"
		>
			<View style={styles.metaRow}>
				<Text style={styles.category}>
					{CATEGORY_LABELS[puzzle.category]}
				</Text>
				<Text style={styles.progress}>
					{index} / {total}
				</Text>
			</View>

			<View style={styles.card}>
				<Text style={styles.prompt}>{puzzle.prompt}</Text>
			</View>

			<PuzzleInteractionRenderer
				puzzle={puzzle}
				disabled={locked}
				selectedValue={selectedValue}
				onSelect={setSelectedValue}
			/>

			{hintLevelShown > 0 && (
				<View style={styles.hintBox}>
					<Text style={styles.hintTitle}>Подсказка</Text>
					{sortedHints.slice(0, hintLevelShown).map((hint) => (
						<Text key={hint.level} style={styles.hintText}>
							{hint.text}
						</Text>
					))}
				</View>
			)}

			{phase === 'answering' && (
				<View style={styles.actions}>
					<Pressable
						accessibilityRole="button"
						accessibilityLabel="Проверить ответ"
						disabled={!canSubmit}
						onPress={handleCheck}
						style={({ pressed }) => [
							styles.primaryBtn,
							!canSubmit && styles.btnDisabled,
							pressed && canSubmit && styles.pressed,
						]}
					>
						<Text style={styles.primaryBtnText}>Проверить</Text>
					</Pressable>

					<View style={styles.secondaryRow}>
						<Pressable
							accessibilityRole="button"
							accessibilityLabel="Показать подсказку"
							disabled={hintLevelShown >= sortedHints.length}
							onPress={handleHint}
							style={({ pressed }) => [
								styles.secondaryBtn,
								hintLevelShown >= sortedHints.length && styles.btnDisabled,
								pressed && styles.pressed,
							]}
						>
							<Text style={styles.secondaryBtnText}>Подсказка</Text>
						</Pressable>
						<Pressable
							accessibilityRole="button"
							accessibilityLabel="Показать решение"
							onPress={handleReveal}
							style={({ pressed }) => [
								styles.secondaryBtn,
								pressed && styles.pressed,
							]}
						>
							<Text style={styles.secondaryBtnText}>Показать решение</Text>
						</Pressable>
					</View>
				</View>
			)}

			{phase === 'feedback' && (
				<View style={styles.feedbackBlock}>
					<View
						style={[
							styles.statusBanner,
							isCorrect && !revealedSolution
								? styles.statusOk
								: styles.statusBad,
						]}
						accessibilityRole="text"
					>
						<Text style={styles.statusIcon}>
							{isCorrect && !revealedSolution ? '✓' : '✗'}
						</Text>
						<Text style={styles.statusText}>
							{revealedSolution
								? 'Решение открыто'
								: isCorrect
									? 'Верно'
									: 'Неверно'}
						</Text>
					</View>

					{showExplanation && (
						<View style={styles.explainBox}>
							<Text style={styles.explainTitle}>Почему так?</Text>
							<Text style={styles.explainText}>{puzzle.explanation}</Text>
						</View>
					)}

					<Pressable
						accessibilityRole="button"
						accessibilityLabel="Дальше"
						onPress={handleNext}
						style={({ pressed }) => [
							styles.primaryBtn,
							pressed && styles.pressed,
						]}
					>
						<Text style={styles.primaryBtnText}>
							{index >= total ? 'К результату' : 'Дальше'}
						</Text>
					</Pressable>
				</View>
			)}
		</ScrollView>
	)
}

const styles = StyleSheet.create({
	container: {
		padding: spacing.lg,
		paddingBottom: spacing.xxl,
		gap: spacing.md,
	},
	metaRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	category: {
		...typography.label,
		color: colors.light.primary,
		backgroundColor: colors.light.primaryMuted,
		paddingHorizontal: spacing.sm,
		paddingVertical: spacing.xxs,
		borderRadius: radius.pill,
		overflow: 'hidden',
	},
	progress: {
		...typography.caption,
		color: colors.light.textSecondary,
	},
	card: {
		backgroundColor: colors.light.surface,
		borderRadius: radius.lg,
		padding: spacing.lg,
		...elevation.sm,
	},
	prompt: {
		...typography.puzzlePrompt,
		color: colors.light.textPrimary,
	},
	hintBox: {
		backgroundColor: colors.light.warningMuted,
		borderRadius: radius.md,
		padding: spacing.md,
		gap: spacing.xs,
	},
	hintTitle: {
		...typography.label,
		color: colors.light.warning,
	},
	hintText: {
		...typography.body,
		color: colors.light.textPrimary,
	},
	actions: {
		gap: spacing.sm,
		marginTop: spacing.sm,
	},
	secondaryRow: {
		flexDirection: 'row',
		gap: spacing.sm,
	},
	primaryBtn: {
		minHeight: touchTarget.min + 4,
		borderRadius: radius.md,
		backgroundColor: colors.light.primary,
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: spacing.lg,
	},
	primaryBtnText: {
		...typography.bodyStrong,
		color: '#FFFFFF',
	},
	secondaryBtn: {
		flex: 1,
		minHeight: touchTarget.min,
		borderRadius: radius.md,
		borderWidth: 1.5,
		borderColor: colors.light.border,
		backgroundColor: colors.light.surface,
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: spacing.sm,
	},
	secondaryBtnText: {
		...typography.caption,
		color: colors.light.textPrimary,
	},
	btnDisabled: {
		opacity: 0.45,
	},
	pressed: {
		opacity: 0.88,
	},
	feedbackBlock: {
		gap: spacing.md,
	},
	statusBanner: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.sm,
		padding: spacing.md,
		borderRadius: radius.md,
	},
	statusOk: {
		backgroundColor: colors.light.successMuted,
	},
	statusBad: {
		backgroundColor: colors.light.dangerMuted,
	},
	statusIcon: {
		fontSize: 22,
		fontWeight: '700',
		color: colors.light.textPrimary,
	},
	statusText: {
		...typography.subtitle,
		color: colors.light.textPrimary,
	},
	explainBox: {
		backgroundColor: colors.light.surface,
		borderRadius: radius.md,
		padding: spacing.md,
		gap: spacing.xs,
		borderWidth: 1,
		borderColor: colors.light.border,
	},
	explainTitle: {
		...typography.subtitle,
		color: colors.light.textPrimary,
	},
	explainText: {
		...typography.body,
		color: colors.light.textSecondary,
	},
})
