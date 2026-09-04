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
import {
	hapticCorrect,
	hapticSelect,
	hapticWrong,
} from '@/src/utils/haptics'
import { requestRewardedHint2 } from '@/src/monetization/rewarded/controller'

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
	sessionId: string
	onComplete: (result: PuzzleRunnerResult) => void
}

type Phase = 'answering' | 'feedback'

/**
 * Universal puzzle shell: prompt, interaction renderer, hints, explanation, next.
 * No permanent ads — Puzzle Runner stays clean.
 */
export function PuzzleRunner({
	puzzle,
	index,
	total,
	sessionId,
	onComplete,
}: Props) {
	const [selectedValue, setSelectedValue] = useState<string | null>(null)
	const [phase, setPhase] = useState<Phase>('answering')
	const [isCorrect, setIsCorrect] = useState(false)
	const [hintLevelShown, setHintLevelShown] = useState(0)
	const [revealedSolution, setRevealedSolution] = useState(false)
	const [hintsUsed, setHintsUsed] = useState(0)
	const [confirmReveal, setConfirmReveal] = useState(false)
	const [rewardBusy, setRewardBusy] = useState(false)
	const completionSent = useRef(false)
	const hintLevelRef = useRef(0)
	const rewardLock = useRef(false)

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
		if (result.isCorrect) {
			void hapticCorrect()
		} else {
			void hapticWrong()
		}
	}

	const revealNextHint = () => {
		if (hintLevelRef.current >= sortedHints.length) {
			return
		}
		hintLevelRef.current += 1
		setHintLevelShown(hintLevelRef.current)
		setHintsUsed((n) => n + 1)
		void hapticSelect()
	}

	/** Hint 1 is always free. */
	const handleFreeHint = () => {
		if (hintLevelRef.current !== 0) {
			return
		}
		revealNextHint()
	}

	/** Hint 2+ may use rewarded; unavailable → free fallback. */
	const handleRewardedHint = async () => {
		if (rewardLock.current || hintLevelRef.current !== 1) {
			return
		}
		if (sortedHints.length < 2) {
			return
		}
		rewardLock.current = true
		setRewardBusy(true)
		try {
			const result = await requestRewardedHint2({
				sessionId,
				puzzleId: puzzle.id,
				puzzleIndex: index - 1,
			})
			if (
				result.status === 'rewarded' ||
				result.status === 'fallback'
			) {
				revealNextHint()
			}
		} finally {
			setRewardBusy(false)
			// Keep lock for this puzzle so rapid taps cannot re-request.
		}
	}

	const handleReveal = () => {
		setRevealedSolution(true)
		setIsCorrect(false)
		setPhase('feedback')
		setConfirmReveal(false)
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
	const hasHint2 = sortedHints.length >= 2
	const showFreeHint = hintLevelShown === 0 && sortedHints.length > 0
	const showRewardedHint = hintLevelShown === 1 && hasHint2


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
					{index} из {total}
				</Text>
			</View>

			<View
				style={styles.progressTrack}
				accessibilityRole="progressbar"
				accessibilityValue={{ min: 0, max: total, now: index }}
			>
				<View
					style={[
						styles.progressFill,
						{ width: `${Math.min(100, (index / total) * 100)}%` },
					]}
				/>
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

					{phase === 'answering' && confirmReveal && (
						<View style={styles.confirmBox}>
							<Text style={styles.confirmTitle}>Показать решение?</Text>
							<Text style={styles.confirmBody}>
								После этого задача будет считаться нерешённой.
							</Text>
							<View style={styles.secondaryRow}>
								<Pressable
									accessibilityRole="button"
									accessibilityLabel="Отмена"
									onPress={() => setConfirmReveal(false)}
									style={styles.secondaryBtn}
								>
									<Text style={styles.secondaryBtnText}>Отмена</Text>
								</Pressable>
								<Pressable
									accessibilityRole="button"
									accessibilityLabel="Показать"
									onPress={handleReveal}
									style={[styles.secondaryBtn, styles.secondaryBtnWarn]}
								>
									<Text style={styles.secondaryBtnText}>Показать</Text>
								</Pressable>
							</View>
						</View>
					)}

					{phase === 'answering' && !confirmReveal && (
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
						{showFreeHint ? (
							<Pressable
								accessibilityRole="button"
								accessibilityLabel="Показать подсказку"
								onPress={handleFreeHint}
								style={({ pressed }) => [
									styles.secondaryBtn,
									pressed && styles.pressed,
								]}
							>
								<Text style={styles.secondaryBtnText}>Подсказка</Text>
							</Pressable>
						) : null}
						{showRewardedHint ? (
							<Pressable
								accessibilityRole="button"
								accessibilityLabel="Ещё подсказка"
								disabled={rewardBusy}
								onPress={() => {
									void handleRewardedHint()
								}}
								style={({ pressed }) => [
									styles.secondaryBtn,
									rewardBusy && styles.btnDisabled,
									pressed && styles.pressed,
								]}
							>
								<Text style={styles.secondaryBtnText}>
									{rewardBusy ? 'Загрузка…' : 'Ещё подсказка'}
								</Text>
							</Pressable>
						) : null}
						<Pressable
							accessibilityRole="button"
							accessibilityLabel="Показать решение"
							onPress={() => setConfirmReveal(true)}
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
									: 'Не совсем'}
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
	progressTrack: {
		height: 8,
		borderRadius: radius.pill,
		backgroundColor: colors.light.surfaceMuted,
		overflow: 'hidden',
	},
	progressFill: {
		height: '100%',
		borderRadius: radius.pill,
		backgroundColor: colors.light.primary,
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
	confirmBox: {
		backgroundColor: colors.light.warningMuted,
		borderRadius: radius.md,
		padding: spacing.md,
		gap: spacing.sm,
	},
	confirmTitle: {
		...typography.subtitle,
		color: colors.light.textPrimary,
	},
	confirmBody: {
		...typography.body,
		color: colors.light.textSecondary,
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
	secondaryBtnWarn: {
		borderColor: colors.light.warning,
		backgroundColor: colors.light.warningMuted,
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
