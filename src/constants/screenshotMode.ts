/**
 * Dev-only RuStore screenshot capture mode.
 * Production release builds never enable this (__DEV__ is false).
 */

export const isStoreScreenshotMode =
	__DEV__ && process.env.EXPO_PUBLIC_STORE_SCREENSHOTS === '1'
