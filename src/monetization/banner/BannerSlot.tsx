import { useEffect, useMemo, useRef, useState, type ComponentType } from 'react'
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native'
import type { BannerPlacement } from '@/src/monetization/config'
import { ADS_CONFIG, resolveAdUnitId } from '@/src/monetization/config'
import { trackEvent } from '@/src/analytics'
import { spacing } from '@/src/theme'
import { isStoreScreenshotMode } from '@/src/constants/screenshotMode'

type Props = {
	placement: BannerPlacement
}

type BannerSize = {
	width: number
	height: number
}

/**
 * Sticky adaptive banner slot. Collapses silently on no-fill / missing SDK.
 */
export function BannerSlot({ placement }: Props) {
	const { width } = useWindowDimensions()
	const [size, setSize] = useState<BannerSize | null>(null)
	const [visible, setVisible] = useState(false)
	const reported = useRef<'none' | 'loaded' | 'failed'>('none')
	const unitId = resolveAdUnitId('banner')

	const BannerView = useMemo(() => {
		// Dev-only RuStore capture: never request / render banners.
		if (isStoreScreenshotMode) {
			return null
		}
		if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
			return null
		}
		if (!ADS_CONFIG.banner.enabled || !unitId) {
			return null
		}
		try {
			// eslint-disable-next-line @typescript-eslint/no-require-imports
			const mod = require('yandex-mobile-ads') as {
				BannerView: ComponentType<Record<string, unknown>>
				BannerAdSize: {
					stickySize: (w: number) => Promise<BannerSize>
				}
			}
			return mod
		} catch {
			return null
		}
	}, [unitId])

	useEffect(() => {
		let cancelled = false
		if (!BannerView) {
			return
		}
		void (async () => {
			try {
				const adSize = await BannerView.BannerAdSize.stickySize(
					Math.floor(width - spacing.lg * 2),
				)
				if (!cancelled) {
					setSize(adSize)
				}
			} catch {
				if (!cancelled && reported.current === 'none') {
					reported.current = 'failed'
					trackEvent('ad_banner_failed', { placement, stage: 'size' })
				}
			}
		})()
		return () => {
			cancelled = true
		}
	}, [BannerView, width, placement])

	if (!BannerView || !size || !unitId) {
		return null
	}

	const ViewComp = BannerView.BannerView

	return (
		<View
			style={[styles.wrap, visible ? styles.visible : styles.collapsed]}
			pointerEvents={visible ? 'auto' : 'none'}
			accessibilityElementsHidden={!visible}
			importantForAccessibility={visible ? 'yes' : 'no-hide-descendants'}
		>
			<ViewComp
				adRequest={{ adUnitId: unitId }}
				size={size}
				onAdLoaded={() => {
					if (reported.current === 'loaded') {
						return
					}
					reported.current = 'loaded'
					setVisible(true)
					trackEvent('ad_banner_loaded', { placement })
				}}
				onAdFailedToLoad={() => {
					if (reported.current === 'failed') {
						return
					}
					reported.current = 'failed'
					setVisible(false)
					trackEvent('ad_banner_failed', { placement, stage: 'load' })
				}}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	wrap: {
		alignItems: 'center',
		justifyContent: 'center',
		minHeight: 0,
		overflow: 'hidden',
	},
	visible: {
		marginVertical: spacing.sm,
		minHeight: 50,
	},
	collapsed: {
		height: 0,
		marginVertical: 0,
	},
})
