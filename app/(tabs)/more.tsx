import { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { SurfaceCard } from '@/src/components/ui'
import {
	DEFAULT_SETTINGS,
	getSettings,
	saveSettings,
	type AppSettings,
} from '@/src/storage'
import { colors, spacing, typography } from '@/src/theme'

export default function MoreScreen() {
	const insets = useSafeAreaInsets()
	const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)

	useEffect(() => {
		void getSettings().then(setSettings)
	}, [])

	const toggleSound = async (soundEnabled: boolean) => {
		const next = await saveSettings({ soundEnabled })
		setSettings(next)
	}

	return (
		<ScrollView
			style={styles.screen}
			contentContainerStyle={[
				styles.content,
				{ paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.xl },
			]}
		>
			<Text style={styles.title}>Ещё</Text>
			<Text style={styles.subtitle}>
				Настройки и сведения о приложении. Реклама, аналитика и аккаунты
				появятся позже.
			</Text>

			<SurfaceCard>
				<View style={styles.row}>
					<View style={styles.rowText}>
						<Text style={styles.rowTitle}>Звук</Text>
						<Text style={styles.rowBody}>Пока только переключатель-заглушка</Text>
					</View>
					<Switch
						accessibilityLabel="Звук"
						value={settings.soundEnabled}
						onValueChange={(value) => {
							void toggleSound(value)
						}}
						trackColor={{
							false: colors.light.border,
							true: colors.light.primaryMuted,
						}}
						thumbColor={
							settings.soundEnabled
								? colors.light.primary
								: colors.light.textTertiary
						}
					/>
				</View>
			</SurfaceCard>

			<SurfaceCard>
				<Text style={styles.rowTitle}>О приложении</Text>
				<Text style={styles.rowBody}>
					Логические игры / Игры разума — сборник коротких тренировок для ума.
					Версия 1.0.0 · Phase 0–1 foundation.
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
	title: {
		...typography.display,
		color: colors.light.textPrimary,
	},
	subtitle: {
		...typography.body,
		color: colors.light.textSecondary,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: spacing.md,
	},
	rowText: {
		flex: 1,
	},
	rowTitle: {
		...typography.subtitle,
		color: colors.light.textPrimary,
		marginBottom: spacing.xxs,
	},
	rowBody: {
		...typography.body,
		color: colors.light.textSecondary,
	},
})
