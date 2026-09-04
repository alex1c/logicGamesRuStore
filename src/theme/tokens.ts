/**
 * Centralized design tokens for ForestMusic Logic Games.
 * Keep visual values here so screens avoid magic numbers/colors.
 * Light theme is the primary look; dark tokens are reserved for later.
 */

export const spacing = {
	xxs: 4,
	xs: 8,
	sm: 12,
	md: 16,
	lg: 24,
	xl: 32,
	xxl: 48,
} as const

export const radius = {
	sm: 8,
	md: 12,
	lg: 16,
	xl: 24,
	pill: 999,
} as const

export const typography = {
	display: {
		fontSize: 28,
		lineHeight: 34,
		fontWeight: '700' as const,
	},
	title: {
		fontSize: 22,
		lineHeight: 28,
		fontWeight: '700' as const,
	},
	subtitle: {
		fontSize: 18,
		lineHeight: 24,
		fontWeight: '600' as const,
	},
	body: {
		fontSize: 16,
		lineHeight: 22,
		fontWeight: '400' as const,
	},
	bodyStrong: {
		fontSize: 16,
		lineHeight: 22,
		fontWeight: '600' as const,
	},
	caption: {
		fontSize: 14,
		lineHeight: 18,
		fontWeight: '500' as const,
	},
	label: {
		fontSize: 13,
		lineHeight: 16,
		fontWeight: '600' as const,
	},
	puzzlePrompt: {
		fontSize: 20,
		lineHeight: 28,
		fontWeight: '600' as const,
	},
} as const

export const elevation = {
	none: {
		shadowColor: 'transparent',
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0,
		shadowRadius: 0,
		elevation: 0,
	},
	sm: {
		shadowColor: '#1A2B3C',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.06,
		shadowRadius: 3,
		elevation: 1,
	},
	md: {
		shadowColor: '#1A2B3C',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 3,
	},
	lg: {
		shadowColor: '#1A2B3C',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.12,
		shadowRadius: 14,
		elevation: 5,
	},
} as const

/**
 * Semantic color tokens. Prefer these over raw hex in components.
 */
export const colors = {
	light: {
		background: '#F5F7FA',
		surface: '#FFFFFF',
		surfaceMuted: '#EEF2F6',
		border: '#D8E0E8',
		textPrimary: '#1A2B3C',
		textSecondary: '#5A6B7C',
		textTertiary: '#8A9AAB',
		primary: '#2F6FED',
		primaryPressed: '#2458C4',
		primaryMuted: '#E8F0FE',
		accent: '#1FA97A',
		accentMuted: '#E6F7F0',
		warning: '#E8A317',
		warningMuted: '#FFF6E0',
		danger: '#D64545',
		dangerMuted: '#FDECEC',
		success: '#1FA97A',
		successMuted: '#E6F7F0',
		overlay: 'rgba(26, 43, 60, 0.45)',
		tabInactive: '#8A9AAB',
		tabActive: '#2F6FED',
		streak: '#E87A2E',
	},
	dark: {
		background: '#121820',
		surface: '#1C2430',
		surfaceMuted: '#243041',
		border: '#334155',
		textPrimary: '#F1F5F9',
		textSecondary: '#94A3B8',
		textTertiary: '#64748B',
		primary: '#5B8FF9',
		primaryPressed: '#4A7AE0',
		primaryMuted: '#1E2F4A',
		accent: '#34D399',
		accentMuted: '#14352A',
		warning: '#FBBF24',
		warningMuted: '#3A3018',
		danger: '#F87171',
		dangerMuted: '#3A1F1F',
		success: '#34D399',
		successMuted: '#14352A',
		overlay: 'rgba(0, 0, 0, 0.55)',
		tabInactive: '#64748B',
		tabActive: '#5B8FF9',
		streak: '#FB923C',
	},
} as const

export type ColorSchemeName = 'light' | 'dark'

/** Semantic palette shape shared by light/dark token sets. */
export type ThemeColors = {
	background: string
	surface: string
	surfaceMuted: string
	border: string
	textPrimary: string
	textSecondary: string
	textTertiary: string
	primary: string
	primaryPressed: string
	primaryMuted: string
	accent: string
	accentMuted: string
	warning: string
	warningMuted: string
	danger: string
	dangerMuted: string
	success: string
	successMuted: string
	overlay: string
	tabInactive: string
	tabActive: string
	streak: string
}

export const touchTarget = {
	min: 48,
} as const
