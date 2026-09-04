import { Tabs } from 'expo-router'
import { Text, StyleSheet } from 'react-native'
import { colors, typography } from '@/src/theme'

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
	return (
		<Text style={[styles.icon, focused && styles.iconFocused]}>{label}</Text>
	)
}

export default function TabsLayout() {
	return (
		<Tabs
			screenOptions={{
				headerShown: true,
				headerTitleStyle: {
					...typography.subtitle,
					color: colors.light.textPrimary,
				},
				headerStyle: {
					backgroundColor: colors.light.background,
				},
				headerShadowVisible: false,
				tabBarActiveTintColor: colors.light.tabActive,
				tabBarInactiveTintColor: colors.light.tabInactive,
				tabBarStyle: {
					backgroundColor: colors.light.surface,
					borderTopColor: colors.light.border,
					height: 64,
					paddingBottom: 8,
					paddingTop: 6,
				},
				tabBarLabelStyle: {
					fontSize: 12,
					fontWeight: '600',
				},
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: 'Сегодня',
					tabBarIcon: ({ focused }) => (
						<TabIcon label="☀" focused={focused} />
					),
				}}
			/>
			<Tabs.Screen
				name="play"
				options={{
					title: 'Играть',
					tabBarIcon: ({ focused }) => (
						<TabIcon label="▶" focused={focused} />
					),
				}}
			/>
			<Tabs.Screen
				name="progress"
				options={{
					title: 'Прогресс',
					tabBarIcon: ({ focused }) => (
						<TabIcon label="◉" focused={focused} />
					),
				}}
			/>
			<Tabs.Screen
				name="more"
				options={{
					title: 'Ещё',
					tabBarIcon: ({ focused }) => (
						<TabIcon label="☰" focused={focused} />
					),
				}}
			/>
		</Tabs>
	)
}

const styles = StyleSheet.create({
	icon: {
		fontSize: 16,
		opacity: 0.55,
	},
	iconFocused: {
		opacity: 1,
	},
})
