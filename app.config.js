/** @type {import('expo/config').ExpoConfig} */
const expoConfig = {
	name: 'Головоломка дня',
	slug: 'logicGamesRuStore',
	version: '1.0.0',
	orientation: 'portrait',
	icon: './assets/images/icon.png',
	scheme: 'logicgamesrustore',
	userInterfaceStyle: 'light',
	ios: {
		supportsTablet: true,
	},
	android: {
		package: 'ru.forestmusic.logicgames',
		versionCode: 1,
		blockedPermissions: [
			'android.permission.SYSTEM_ALERT_WINDOW',
			'android.permission.READ_EXTERNAL_STORAGE',
			'android.permission.WRITE_EXTERNAL_STORAGE',
		],
		adaptiveIcon: {
			backgroundColor: '#E8F0FE',
			foregroundImage: './assets/images/android-icon-foreground.png',
			backgroundImage: './assets/images/android-icon-background.png',
			monochromeImage: './assets/images/android-icon-monochrome.png',
		},
		predictiveBackGestureEnabled: false,
	},
	web: {
		bundler: 'metro',
		output: 'static',
		favicon: './assets/images/favicon.png',
	},
	plugins: [
		'expo-router',
		[
			'expo-splash-screen',
			{
				image: './assets/images/splash-icon.png',
				resizeMode: 'contain',
				backgroundColor: '#F5F7FA',
			},
		],
		'expo-dev-client',
	],
	experiments: {
		typedRoutes: true,
	},
}

module.exports = { expo: expoConfig }
