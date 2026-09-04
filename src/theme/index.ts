import { colors, type ColorSchemeName, type ThemeColors } from './tokens'

export {
	spacing,
	radius,
	typography,
	elevation,
	colors,
	touchTarget,
} from './tokens'
export type { ColorSchemeName, ThemeColors } from './tokens'

/**
 * Resolve the active palette. Dark tokens exist for future use;
 * the app currently defaults to light.
 */
export function getThemeColors(
	scheme: ColorSchemeName = 'light',
): ThemeColors {
	return colors[scheme]
}
