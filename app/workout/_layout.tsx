import { Stack } from 'expo-router'
import { colors, typography } from '@/src/theme'

export default function WorkoutLayout() {
	return (
		<Stack
			screenOptions={{
				headerStyle: { backgroundColor: colors.light.background },
				headerShadowVisible: false,
				headerTitleStyle: {
					...typography.subtitle,
					color: colors.light.textPrimary,
				},
				headerTintColor: colors.light.primary,
				contentStyle: { backgroundColor: colors.light.background },
			}}
		>
			<Stack.Screen name="index" options={{ title: 'Мини-тренировка' }} />
			<Stack.Screen name="play" options={{ title: 'Задача' }} />
			<Stack.Screen
				name="result"
				options={{ title: 'Результат', headerBackVisible: false }}
			/>
		</Stack>
	)
}
