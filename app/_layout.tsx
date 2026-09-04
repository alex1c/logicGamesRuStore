import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { colors } from '@/src/theme'
import { ensureGeneratorsRegistered } from '@/src/features/puzzles/generators'

// Register generators as early as possible for workout + tests entry points.
ensureGeneratorsRegistered()

export {
	// Catch any errors thrown by the Layout component.
	ErrorBoundary,
} from 'expo-router'

export const unstable_settings = {
	initialRouteName: '(tabs)',
}

export default function RootLayout() {
	return (
		<>
			<StatusBar style="dark" />
			<Stack
				screenOptions={{
					headerShown: false,
					contentStyle: { backgroundColor: colors.light.background },
				}}
			>
				<Stack.Screen name="(tabs)" />
				<Stack.Screen name="workout" options={{ headerShown: false }} />
			</Stack>
		</>
	)
}
