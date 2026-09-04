import * as Haptics from 'expo-haptics'
import { getSettings } from '@/src/storage'

export async function hapticSelect(): Promise<void> {
	const settings = await getSettings()
	if (!settings.hapticsEnabled) {
		return
	}
	try {
		await Haptics.selectionAsync()
	} catch {
		// Ignore missing native module in tests/web.
	}
}

export async function hapticCorrect(): Promise<void> {
	const settings = await getSettings()
	if (!settings.hapticsEnabled) {
		return
	}
	try {
		await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
	} catch {
		// ignore
	}
}

export async function hapticWrong(): Promise<void> {
	const settings = await getSettings()
	if (!settings.hapticsEnabled) {
		return
	}
	try {
		await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
	} catch {
		// ignore
	}
}

export async function hapticAchievement(): Promise<void> {
	const settings = await getSettings()
	if (!settings.hapticsEnabled) {
		return
	}
	try {
		await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
	} catch {
		// ignore
	}
}
