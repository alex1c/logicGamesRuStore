import { useEffect, useState } from 'react'
import {
	Linking,
	ScrollView,
	StyleSheet,
	Switch,
	Text,
	Pressable,
	View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { SurfaceCard } from '@/src/components/ui'
import {
	DEFAULT_SETTINGS,
	getSettings,
	saveSettings,
	type AppSettings,
} from '@/src/storage'
import { APP_IDENTITY } from '@/src/monetization/config'
import { colors, spacing, typography } from '@/src/theme'

export default function MoreScreen() {
	const insets = useSafeAreaInsets()
	const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)

	useEffect(() => {
		void getSettings().then(setSettings)
	}, [])

	const update = async (patch: Partial<AppSettings>) => {
		const next = await saveSettings(patch)
		setSettings(next)
	}

	const openMail = async () => {
		const url = `mailto:${APP_IDENTITY.supportEmail}`
		try {
			const can = await Linking.canOpenURL(url)
			if (can) {
				await Linking.openURL(url)
			}
		} catch {
			// Missing mail client must not crash.
		}
	}

	const openSite = async () => {
		try {
			await Linking.openURL(APP_IDENTITY.developerWebsite)
		} catch {
			// ignore
		}
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
			<Text style={styles.subtitle}>Настройки и сведения о приложении.</Text>

			<SurfaceCard>
				<View style={styles.row}>
					<View style={styles.rowText}>
						<Text style={styles.rowTitle}>Вибрация</Text>
						<Text style={styles.rowBody}>Лёгкий отклик при ответах</Text>
					</View>
					<Switch
						accessibilityLabel="Вибрация"
						value={settings.hapticsEnabled}
						onValueChange={(value) => {
							void update({ hapticsEnabled: value })
						}}
						trackColor={{
							false: colors.light.border,
							true: colors.light.primaryMuted,
						}}
						thumbColor={
							settings.hapticsEnabled
								? colors.light.primary
								: colors.light.textTertiary
						}
					/>
				</View>
			</SurfaceCard>

			<SurfaceCard>
				<Text style={styles.rowTitle}>{APP_IDENTITY.name}</Text>
				<Text style={styles.rowBody}>
					Логические задачи, головоломки и короткие ежедневные тренировки.
				</Text>
				<Text style={styles.meta}>Версия {APP_IDENTITY.version}</Text>
				<Pressable
					accessibilityRole="link"
					accessibilityLabel="Написать в поддержку"
					onPress={() => {
						void openMail()
					}}
				>
					<Text style={styles.link}>{APP_IDENTITY.supportEmail}</Text>
				</Pressable>
				<Pressable
					accessibilityRole="link"
					accessibilityLabel="Сайт разработчика"
					onPress={() => {
						void openSite()
					}}
				>
					<Text style={styles.link}>{APP_IDENTITY.developerWebsite}</Text>
				</Pressable>
			</SurfaceCard>
		</ScrollView>
	)
}

const styles = StyleSheet.create({
	screen: { flex: 1, backgroundColor: colors.light.background },
	content: { padding: spacing.lg, gap: spacing.md },
	title: { ...typography.display, color: colors.light.textPrimary },
	subtitle: { ...typography.body, color: colors.light.textSecondary },
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: spacing.md,
	},
	rowText: { flex: 1 },
	rowTitle: {
		...typography.subtitle,
		color: colors.light.textPrimary,
		marginBottom: spacing.xxs,
	},
	rowBody: { ...typography.body, color: colors.light.textSecondary },
	meta: {
		...typography.caption,
		color: colors.light.textTertiary,
		marginTop: spacing.sm,
	},
	link: {
		...typography.bodyStrong,
		color: colors.light.primary,
		marginTop: spacing.sm,
	},
})
