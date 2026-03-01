import { useState, useEffect, useCallback } from 'react'

/**
 * TabletTouchHook — Comprehensive tablet optimization for Flow Education
 * Handles: touch events, orientation, zoom prevention, and tablet-specific UX
 */
export const useTabletTouch = () => {
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [orientation, setOrientation] = useState('portrait')
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [touchPressure, setTouchPressure] = useState('normal') // 'light', 'normal', 'heavy'

  // Detect touch device on mount
  useEffect(() => {
    const detectTouch = () => {
      const hasTouch = (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches
      )
      setIsTouchDevice(hasTouch)
    }
    detectTouch()
  }, [])

  // Handle orientation changes
  useEffect(() => {
    const updateOrientation = () => {
      const isLandscape = window.innerWidth > window.innerHeight
      setOrientation(isLandscape ? 'landscape' : 'portrait')
      setViewportHeight(window.innerHeight)
    }

    updateOrientation()
    window.addEventListener('resize', updateOrientation)
    window.addEventListener('orientationchange', updateOrientation)

    return () => {
      window.removeEventListener('resize', updateOrientation)
      window.removeEventListener('orientationchange', updateOrientation)
    }
  }, [])

  // Prevent zoom on double-tap
  useEffect(() => {
    if (!isTouchDevice) return

    let lastTouchEnd = 0
    const handleTouchEnd = (e) => {
      const now = Date.now()
      if (now - lastTouchEnd <= 300) {
        e.preventDefault()
      }
      lastTouchEnd = now
    }

    document.addEventListener('touchend', handleTouchEnd, { passive: false })
    return () => document.removeEventListener('touchend', handleTouchEnd)
  }, [isTouchDevice])

  // Prevent pinch-zoom
  useEffect(() => {
    if (!isTouchDevice) return

    const handleTouchMove = (e) => {
      if (e.touches.length > 1) {
        e.preventDefault()
      }
    }

    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    return () => document.removeEventListener('touchmove', handleTouchMove)
  }, [isTouchDevice])

  // Handle viewport height changes (keyboard appearance, etc.)
  useEffect(() => {
    const handleResize = () => {
      setViewportHeight(window.innerHeight)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Request fullscreen (for kiosk/tablet mode)
  const requestFullscreen = useCallback(() => {
    const elem = document.documentElement
    if (elem.requestFullscreen) {
      elem.requestFullscreen()
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen()
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen()
    }
    setIsFullscreen(true)
  }, [])

  // Exit fullscreen
  const exitFullscreen = useCallback(() => {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen()
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen()
    }
    setIsFullscreen(false)
  }, [])

  // Detect touch pressure/intensity (for adaptive feedback)
  const handleTouchStart = useCallback((e) => {
    if (e.touches && e.touches[0]) {
      // Some tablets support force/pressure
      const force = e.touches[0].force || 0.5
      if (force < 0.3) setTouchPressure('light')
      else if (force > 0.7) setTouchPressure('heavy')
      else setTouchPressure('normal')
    }
  }, [])

  // Vibration feedback (haptic)
  const hapticFeedback = useCallback((type = 'light') => {
    if ('vibrate' in navigator) {
      switch (type) {
        case 'light':
          navigator.vibrate(10)
          break
        case 'medium':
          navigator.vibrate(20)
          break
        case 'heavy':
          navigator.vibrate([30, 50, 30])
          break
        case 'success':
          navigator.vibrate([10, 30, 10])
          break
        case 'error':
          navigator.vibrate([50, 30, 50])
          break
        default:
          navigator.vibrate(10)
      }
    }
  }, [])

  // Keep screen awake during lessons
  useEffect(() => {
    if ('wakeLock' in navigator) {
      let wakeLock = null

      const requestWakeLock = async () => {
        try {
          wakeLock = await navigator.wakeLock.request('screen')
        } catch (err) {
          console.log('Wake lock not granted:', err)
        }
      }

      requestWakeLock()

      return () => {
        if (wakeLock) {
          wakeLock.release()
        }
      }
    }
  }, [])

  // Prevent sleep/idle on some tablets via activity simulation
  useEffect(() => {
    const keepAlive = setInterval(() => {
      // Send minimal activity to prevent idle timeout
      if (document.visibilityState === 'visible') {
        // Touch events naturally keep screen alive, but this is backup
      }
    }, 30000) // Every 30 seconds

    return () => clearInterval(keepAlive)
  }, [])

  return {
    isTouchDevice,
    orientation,
    viewportHeight,
    isFullscreen,
    touchPressure,
    requestFullscreen,
    exitFullscreen,
    handleTouchStart,
    hapticFeedback
  }
}

/**
 * usePreventZoom — Prevent all forms of zooming on tablets
 */
export const usePreventZoom = () => {
  useEffect(() => {
    // Prevent Ctrl+/- zoom
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '0')) {
        e.preventDefault()
      }
    }

    // Prevent mouse wheel zoom
    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('wheel', handleWheel)
    }
  }, [])
}

/**
 * useOrientationLock — Lock to portrait for optimal kid experience
 */
export const useOrientationLock = () => {
  const [isLocked, setIsLocked] = useState(false)

  const lockPortrait = useCallback(async () => {
    try {
      if (screen.orientation && screen.orientation.lock) {
        await screen.orientation.lock('portrait')
        setIsLocked(true)
      }
    } catch (err) {
      console.log('Orientation lock not supported:', err)
    }
  }, [])

  const unlockOrientation = useCallback(() => {
    try {
      if (screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock()
        setIsLocked(false)
      }
    } catch (err) {
      console.log('Orientation unlock not supported:', err)
    }
  }, [])

  return { isLocked, lockPortrait, unlockOrientation }
}

export default useTabletTouch
