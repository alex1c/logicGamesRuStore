/**
 * Dev-only RuStore screenshot lab.
 * Only active when EXPO_PUBLIC_STORE_SCREENSHOTS=1 in a debug build.
 */

import { useCallback, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Redirect, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { isStoreScreenshotMode } from '@/src/constants/screenshotMode'
import {
	clearLiveForScreenshotResult,
	clearScreenshotFixture,
	openScreenshotPractice,
	seedScreenshotProgressFixture,
} from '@/src/dev/screenshotFixture'
import { colors, spacing, typography } from '@/src/theme'

type LabAction = {
	id: string
	label: string
	run: () => Promise<void>
}

export default function ScreenshotLabScreen () {
	const router = useRouter()
	const insets = useSafeAreaInsets()
	const [status, setStatus] = useState('idle')

	const run = useCallback(async (action: LabAction) => {
		setStatus(`running:${action.id}`)
		try {
			await action.run()
			setStatus(`ok:${action.id}`)
		} catch (error) {
			setStatus(
				`err:${action.id}:${error instanceof Error ? error.message : 'fail'}`,
			)
		}
	}, [])

	if (!isStoreScreenshotMode) {
		return <Redirect href="/" />
	}

	const actions: LabAction[] = [
		{
			id: 'seed',
			label: '1. Seed progress (no today completion)',
			run: async () => {
				await seedScreenshotProgressFixture({
					includeTodayCompletion: false,
				})
			},
		},
		{
			id: 'today',
			label: '2. Open Today (start CTA)',
			run: async () => {
				await seedScreenshotProgressFixture({
					includeTodayCompletion: false,
				})
				router.replace('/')
			},
		},
		{
			id: 'logic',
			label: '3. Open Logic puzzle',
			run: async () => {
				await AsyncStorage.removeItem('@fm/recentPuzzles')
				await openScreenshotPractice('logic', 42_017)
				router.replace('/workout/play')
			},
		},
		{
			id: 'matchsticks',
			label: '4. Open Matchsticks puzzle',
			run: async () => {
				await openScreenshotPractice('matchsticks', 12)
				router.replace('/workout/play')
			},
		},
		{
			id: 'sequence',
			label: '5. Open Sequence puzzle',
			run: async () => {
				await openScreenshotPractice('sequence', 300)
				router.replace('/workout/play')
			},
		},
		{
			id: 'play',
			label: '6. Open Play catalog',
			run: async () => {
				await seedScreenshotProgressFixture({
					includeTodayCompletion: false,
				})
				router.replace('/play')
			},
		},
		{
			id: 'result',
			label: '7. Open Result 9/10',
			run: async () => {
				await seedScreenshotProgressFixture({
					includeTodayCompletion: true,
				})
				clearLiveForScreenshotResult()
				router.replace('/workout/result')
			},
		},
		{
			id: 'progress',
			label: '8. Open Progress',
			run: async () => {
				await seedScreenshotProgressFixture({
					includeTodayCompletion: true,
				})
				router.replace('/progress')
			},
		},
		{
			id: 'clear',
			label: '9. Clear fixture',
			run: async () => {
				await clearScreenshotFixture()
			},
		},
	]

	return (
		<ScrollView
			style={styles.screen}
			contentContainerStyle={[
				styles.content,
				{ paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.xl },
			]}
		>
			<Text style={styles.title}>Screenshot lab</Text>
			<Text style={styles.sub}>
				Dev-only. Banners hidden. Production ads config unchanged.
			</Text>
			<Text style={styles.status}>{status}</Text>
			<View style={styles.list}>
				{actions.map((action) => (
					<Pressable
						key={action.id}
						accessibilityRole="button"
						accessibilityLabel={action.label}
						style={styles.btn}
						onPress={() => {
							void run(action)
						}}
					>
						<Text style={styles.btnText}>{action.label}</Text>
					</Pressable>
				))}
			</View>
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
		gap: spacing.sm,
	},
	title: {
		...typography.title,
		color: colors.light.textPrimary,
	},
	sub: {
		...typography.body,
		color: colors.light.textSecondary,
		marginBottom: spacing.sm,
	},
	status: {
		...typography.caption,
		color: colors.light.primary,
		marginBottom: spacing.sm,
	},
	list: {
		gap: spacing.sm,
	},
	btn: {
		backgroundColor: colors.light.surface,
		borderRadius: 12,
		paddingVertical: spacing.md,
		paddingHorizontal: spacing.lg,
		borderWidth: 1,
		borderColor: colors.light.border,
	},
	btnText: {
		...typography.body,
		color: colors.light.textPrimary,
		fontWeight: '600',
	},
})
