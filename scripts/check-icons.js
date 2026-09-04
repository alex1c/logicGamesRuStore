/**
 * Verify approved icon_gpt master and derived Expo/Android icon assets.
 * Does not require sharp — uses PNG IHDR parsing only.
 */
const fs = require('fs')
const path = require('path')

function readPngSize(filePath) {
	const buf = fs.readFileSync(filePath)
	if (buf.toString('hex', 0, 8) !== '89504e470d0a1a0a') {
		throw new Error(`${filePath}: not a PNG`)
	}
	const width = buf.readUInt32BE(16)
	const height = buf.readUInt32BE(20)
	return { width, height }
}

function assertSquare(filePath, min = 48) {
	const { width, height } = readPngSize(filePath)
	if (width !== height) {
		throw new Error(`${filePath}: expected square, got ${width}x${height}`)
	}
	if (width < min) {
		throw new Error(`${filePath}: too small ${width}`)
	}
	console.log(`OK ${path.relative(process.cwd(), filePath)} ${width}x${height}`)
}

const root = path.join(__dirname, '..')
const required = [
	'assets/icon_gpt.png',
	'release-assets/icon-master.png',
	'assets/images/icon.png',
	'assets/images/android-icon-foreground.png',
	'assets/images/android-icon-background.png',
	'assets/images/splash-icon.png',
]

for (const rel of required) {
	const full = path.join(root, rel)
	if (!fs.existsSync(full)) {
		console.error(`MISSING ${rel}`)
		process.exit(1)
	}
	assertSquare(full)
}

const master = readPngSize(path.join(root, 'assets/icon_gpt.png'))
if (master.width !== 1254 || master.height !== 1254) {
	console.warn(
		`Note: icon_gpt is ${master.width}x${master.height} (expected 1254 square)`,
	)
}

console.log('Icon check passed')
