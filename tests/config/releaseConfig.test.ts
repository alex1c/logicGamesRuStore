import { APP_IDENTITY } from '@/src/monetization/config'

describe('release config + icon references', () => {
	it('app.config.js uses approved icon derivatives', () => {
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const fs = require('fs') as typeof import('fs')
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const path = require('path') as typeof import('path')
		const configPath = path.join(__dirname, '../../app.config.js')
		const raw = fs.readFileSync(configPath, 'utf8')
		expect(raw).toContain("icon: './assets/images/icon.png'")
		expect(raw).toContain('android-icon-foreground.png')
		expect(raw).not.toContain('icon-placeholder')
	})

	it('identity constants match store targets', () => {
		expect(APP_IDENTITY.name).toBe('Головоломка дня')
		expect(APP_IDENTITY.packageName).toBe('ru.forestmusic.logicgames')
		expect(APP_IDENTITY.version).toBe('1.0.0')
		expect(APP_IDENTITY.versionCode).toBe(1)
	})

	it('approved source artwork and store master exist', () => {
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const fs = require('fs') as typeof import('fs')
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const path = require('path') as typeof import('path')
		const root = path.join(__dirname, '../..')
		expect(fs.existsSync(path.join(root, 'assets/icon_gpt.png'))).toBe(true)
		expect(
			fs.existsSync(path.join(root, 'release-assets/icon-master.png')),
		).toBe(true)
		expect(fs.existsSync(path.join(root, 'assets/images/icon.png'))).toBe(true)
	})
})
