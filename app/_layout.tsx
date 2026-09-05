import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { colors } from '@/src/theme'
import { ensureGeneratorsRegistered } from '@/src/features/puzzles/generators'
import { ensureStorageMigrated } from '@/src/storage'
import { bootstrapAnalytics } from '@/src/analytics'
import { initializeAds } from '@/src/monetization'
import { isStoreScreenshotMode } from '@/src/constants/screenshotMode'

// Register generators as early as possible for workout + tests entry points.
ensureGeneratorsRegistered()

export {
	// Catch any errors thrown by the Layout component.
	ErrorBoundary,
} from 'expo-router'

export const unstable_settings = {
	initialRouteName: '(tabs)',
}

function disableDevToolsChrome (): void {
	if (!isStoreScreenshotMode) {
		return
	}
	try {
		// Close any open Expo Dev Menu overlay during storefront capture.
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const DevMenu = require('expo-dev-menu') as {
			hideMenu?: () => void
			closeMenu?: () => void
		}
		DevMenu.hideMenu?.()
		DevMenu.closeMenu?.()
	} catch {
		// Optional — missing module must not break capture builds.
	}
}

export default function RootLayout() {
	useEffect(() => {
		disableDevToolsChrome()
		let cancelled = false
		void (async () => {
			try {
				await ensureStorageMigrated()
			} catch {
				// Storage failure must not block UI.
			}
			if (cancelled) {
				return
			}
			// Analytics + ads after storage — never await for Today paint.
			try {
				bootstrapAnalytics()
			} catch {
				// ignore
			}
			void initializeAds()
		})()
		return () => {
			cancelled = true
		}
	}, [])

	return (
		<>
			<StatusBar
				style="dark"
				hidden={isStoreScreenshotMode}
			/>
			<Stack
				screenOptions={{
					headerShown: false,
					contentStyle: { backgroundColor: colors.light.background },
				}}
			>
				<Stack.Screen name="(tabs)" />
				<Stack.Screen name="workout" options={{ headerShown: false }} />
				<Stack.Screen name="screenshot-lab" options={{ headerShown: false }} />
			</Stack>
		</>
	)
}
