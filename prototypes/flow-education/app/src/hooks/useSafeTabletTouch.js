import { useState, useEffect, useCallback } from 'react'

/**
 * useSafeTabletTouch — Tablet-friendly without iOS crashes
 * Only uses APIs that are safe across all devices
 */
export const useSafeTabletTouch = () => {
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [orientation, setOrientation] = useState('portrait')

  // Detect touch device
  useEffect(() => {
    const hasTouch = (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0
    )
    setIsTouchDevice(hasTouch)
  }, [])

  // Handle orientation
  useEffect(() => {
    const updateOrientation = () => {
      setOrientation(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait')
    }
    updateOrientation()
    window.addEventListener('resize', updateOrientation)
    return () => window.removeEventListener('resize', updateOrientation)
  }, [])

  // Safe haptic (only on supported devices)
  const hapticFeedback = useCallback((type = 'light') => {
    // iPhone doesn't support vibrate - check first
    if ('vibrate' in navigator && navigator.vibrate) {
      try {
        switch (type) {
          case 'light': navigator.vibrate(10); break
          case 'success': navigator.vibrate([10, 30, 10]); break
          case 'error': navigator.vibrate([50, 30, 50]); break
          default: navigator.vibrate(10)
        }
      } catch (e) {
        // Ignore errors on unsupported devices
      }
    }
  }, [])

  return {
    isTouchDevice,
    orientation,
    hapticFeedback
  }
}

/**
 * usePreventZoomSafe — Prevent zoom without breaking iOS
 */
export const usePreventZoomSafe = () => {
  useEffect(() => {
    // Only prevent keyboard zoom (Ctrl +/-)
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '0')) {
        e.preventDefault()
      }
    }

    // Prevent pinch zoom but NOT double-tap (iOS handles this better natively now)
    const handleTouchMove = (e) => {
      if (e.touches.length > 1) {
        e.preventDefault()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('touchmove', handleTouchMove, { passive: false })

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('touchmove', handleTouchMove)
    }
  }, [])
}

export default useSafeTabletTouch
