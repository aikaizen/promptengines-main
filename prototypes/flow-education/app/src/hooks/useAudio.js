import { useCallback, useRef, useEffect } from 'react'

// Web Audio API-based sound generation for MVP
// In production, replace with pre-recorded MP3 files
const useAudio = () => {
  const audioContextRef = useRef(null)
  const masterGainRef = useRef(null)

  // Initialize audio context on first user interaction
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext
        audioContextRef.current = new AudioContext()
        masterGainRef.current = audioContextRef.current.createGain()
        masterGainRef.current.gain.value = 0.3 // 30% volume
        masterGainRef.current.connect(audioContextRef.current.destination)
      } catch (e) {
        console.warn('Web Audio API not supported:', e)
        return false
      }
    }
    return true
  }, [])

  // Generate tone with envelope
  const playTone = useCallback((frequency, duration, type = 'sine', startTime = 0) => {
    if (!initAudio()) return
    
    const ctx = audioContextRef.current
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    
    osc.type = type
    osc.frequency.setValueAtTime(frequency, ctx.currentTime + startTime)
    
    // Envelope
    gain.gain.setValueAtTime(0, ctx.currentTime + startTime)
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + startTime + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTime + duration)
    
    osc.connect(gain)
    gain.connect(masterGainRef.current)
    
    osc.start(ctx.currentTime + startTime)
    osc.stop(ctx.currentTime + startTime + duration)
  }, [initAudio])

  // Play success chord
  const playSuccess = useCallback(() => {
    if (!initAudio()) return
    const now = audioContextRef.current.currentTime
    playTone(523.25, 0.3, 'sine', 0)      // C5
    playTone(659.25, 0.3, 'sine', 0.05)   // E5
    playTone(783.99, 0.4, 'sine', 0.1)    // G5
  }, [initAudio, playTone])

  // Play error buzz
  const playError = useCallback(() => {
    if (!initAudio()) return
    playTone(200, 0.15, 'sawtooth')
    setTimeout(() => playTone(180, 0.15, 'sawtooth'), 100)
  }, [initAudio, playTone])

  // Play tap feedback
  const playTap = useCallback(() => {
    if (!initAudio()) return
    playTone(800, 0.05, 'sine')
  }, [initAudio, playTone])

  // Play hint chime
  const playHint = useCallback(() => {
    if (!initAudio()) return
    const now = audioContextRef.current.currentTime
    playTone(880, 0.1, 'sine', 0)
    playTone(1108, 0.2, 'sine', 0.1)
  }, [initAudio, playTone])

  // Play progress chime
  const playProgress = useCallback(() => {
    if (!initAudio()) return
    playTone(660, 0.1, 'sine')
  }, [initAudio, playTone])

  // Play celebration
  const playCelebration = useCallback(() => {
    if (!initAudio()) return
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51] // C major arpeggio up
    notes.forEach((freq, i) => {
      playTone(freq, 0.3, 'sine', i * 0.08)
    })
  }, [initAudio, playTone])

  // Play sound by type
  const playSound = useCallback((type) => {
    switch (type) {
      case 'correct':
      case 'success':
        playSuccess()
        break
      case 'incorrect':
      case 'error':
        playError()
        break
      case 'tap':
      case 'tap-correct':
        playTap()
        break
      case 'hint':
        playHint()
        break
      case 'trace-progress':
      case 'progress':
        playProgress()
        break
      case 'trace-fail':
        playError()
        break
      case 'review-needed':
        playHint()
        break
      case 'celebration':
        playCelebration()
        break
      default:
        console.log(`Sound type not implemented: ${type}`)
    }
  }, [playSuccess, playError, playTap, playHint, playProgress, playCelebration])

  // Narration placeholder - will be replaced with TTS or pre-recorded
  const playNarration = useCallback((text) => {
    // For MVP: Log narration requests
    // In production: Play MP3 files or use TTS
    console.log(`[Narration] ${text}`)
    
    // Optional: Use browser's speech synthesis as fallback
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1.1
      utterance.volume = 0.8
      speechSynthesis.speak(utterance)
    }
  }, [])

  // Resume audio context (needed for browsers that suspend it)
  useEffect(() => {
    const resumeAudio = () => {
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume()
      }
    }
    
    window.addEventListener('click', resumeAudio, { once: true })
    window.addEventListener('touchstart', resumeAudio, { once: true })
    
    return () => {
      window.removeEventListener('click', resumeAudio)
      window.removeEventListener('touchstart', resumeAudio)
    }
  }, [])

  return { 
    playSound, 
    playNarration,
    initAudio,
    audioContext: audioContextRef
  }
}

export default useAudio
