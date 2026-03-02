import { useState, useEffect, useCallback, useRef } from 'react'
import useAudio from '../hooks/useAudio.js'
import { useSafeTabletTouch } from '../hooks/useSafeTabletTouch.js'

// Simplified challenge types for 4-year-olds
const CHALLENGE_TYPES = {
  INTRO: 'intro',
  LISTEN: 'listen', 
  FIND: 'find',
  TRACE: 'trace',
  REWARD: 'reward'
}

// Shorter durations for 4YO attention span
const CHALLENGE_DURATIONS = {
  [CHALLENGE_TYPES.INTRO]: 15 * 1000,    // 15s (was 30)
  [CHALLENGE_TYPES.LISTEN]: 45 * 1000,  // 45s (was 90)
  [CHALLENGE_TYPES.FIND]: 60 * 1000,    // 60s (was 120)
  [CHALLENGE_TYPES.TRACE]: 60 * 1000,   // 60s (was 120)
  [CHALLENGE_TYPES.REWARD]: 20 * 1000   // 20s (was 30)
}

// Create simplified challenges for 4YO
const createSimpleChallenges = (lesson) => {
  const letter = lesson.title.match(/Letter (.)/)?.[1] || 'A'
  const isNumberLesson = lesson.title.includes('Number')
  
  // Get just ONE target word for 4YO (not 5)
  const targetWord = lesson.targetWords?.[0] || 'Apple'
  const distractorWords = isNumberLesson
    ? ['Apple', 'Ball']
    : (lesson.distractors || ['Ball', 'Cat']).slice(0, 2)

  return [
    {
      type: CHALLENGE_TYPES.INTRO,
      duration: 15,
      content: {
        message: `Hi! Let's learn ${isNumberLesson ? 'number 1' : `letter ${letter}`}!`,
        animation: 'wave'
      }
    },
    {
      type: CHALLENGE_TYPES.LISTEN,
      duration: 45,
      content: {
        sound: isNumberLesson ? 'One!' : `${letter} says ${getPhoneticSound(letter)}`,
        word: isNumberLesson ? 'One apple!' : `${targetWord}!`,
        targetWord: isNumberLesson ? 'Apple' : targetWord,
        repeatCount: 2
      }
    },
    {
      type: CHALLENGE_TYPES.FIND,
      duration: 60,
      content: {
        targetWord: isNumberLesson ? 'Apple' : targetWord,
        targetLabel: isNumberLesson ? 'one' : targetWord,
        distractorWords,
        instruction: isNumberLesson ? 'Tap ONE!' : `Tap ${targetWord}!`,
        autoCorrectAfter: 2
      }
    },
    {
      type: CHALLENGE_TYPES.TRACE,
      duration: 60,
      content: {
        letter: letter,
        isNumber: isNumberLesson,
        mode: 'connect-dots', // 4YO mode: connect dots, not free trace
        dots: isNumberLesson 
          ? [{x: 150, y: 80}, {x: 150, y: 220}] // Vertical line for 1
          : [{x: 100, y: 200}, {x: 150, y: 50}, {x: 200, y: 200}] // A shape
      }
    },
    {
      type: CHALLENGE_TYPES.REWARD,
      duration: 20,
      content: {
        message: 'You did it!',
        subMessage: 'Great job!',
        stars: 1,
        bigEmoji: isNumberLesson ? '🎯' : '🏆'
      }
    }
  ]
}

const getPhoneticSound = (letter) => {
  const sounds = { 'A': 'ahh', 'B': 'buh', 'C': 'cuh', 'D': 'duh', 'E': 'ehh' }
  return sounds[letter] || letter.toLowerCase()
}

const BASE = import.meta.env.BASE_URL
const getObjectImage = (word) => `${BASE}assets/objects/obj-${word.toLowerCase()}.png`
const getTutorImage = (state) => `${BASE}assets/characters/char-tutor-${state}.png`

function SimpleLessonView({ lesson, lessonPlan, onComplete, onExit }) {
  // Safety check - ensure lesson is valid
  if (!lesson || !lesson.title) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#e4e4e7' }}>
        <p>Error: Lesson data not found</p>
        <button onClick={onExit} style={{ padding: '10px 20px', marginTop: '20px' }}>
          Go Back
        </button>
      </div>
    )
  }

  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0)
  const [showMiniCelebration, setShowMiniCelebration] = useState(false)
  const [wrongTapCount, setWrongTapCount] = useState(0)
  const [showAutoHelp, setShowAutoHelp] = useState(false)
  const [traceDotsConnected, setTraceDotsConnected] = useState(0)
  const [isTracing, setIsTracing] = useState(false)
  const [currentDot, setCurrentDot] = useState(0)
  const [exitHoldStart, setExitHoldStart] = useState(null)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  
  const { playSound, playNarration } = useAudio()
  const { isTouchDevice, hapticFeedback } = useSafeTabletTouch()
  const canvasRef = useRef(null)
  
  // Create challenges with error handling
  const challengesRef = useRef([])
  try {
    challengesRef.current = createSimpleChallenges(lesson)
  } catch (e) {
    console.error('Failed to create challenges:', e)
  }
  
  const challenges = challengesRef.current
  const currentChallenge = challenges[currentChallengeIndex]
  
  // Auto-advance for intro/listen
  useEffect(() => {
    if (currentChallenge?.type === CHALLENGE_TYPES.INTRO || 
        currentChallenge?.type === CHALLENGE_TYPES.LISTEN) {
      const timer = setTimeout(() => {
        advanceToNext()
      }, CHALLENGE_DURATIONS[currentChallenge.type])
      
      // Narrate
      if (currentChallenge.type === CHALLENGE_TYPES.INTRO) {
        playNarration(currentChallenge.content.message)
      } else if (currentChallenge.type === CHALLENGE_TYPES.LISTEN) {
        playNarration(`${currentChallenge.content.sound} Like ${currentChallenge.content.word}`)
      }
      
      return () => clearTimeout(timer)
    }
  }, [currentChallengeIndex])
  
  // Play mini-celebration sound with haptic
  const celebrate = useCallback(() => {
    setShowMiniCelebration(true)
    playSound('correct')
    hapticFeedback('success') // Success haptic for 4YO
    setTimeout(() => setShowMiniCelebration(false), 800)
  }, [playSound, hapticFeedback])
  
  const advanceToNext = useCallback(() => {
    if (currentChallengeIndex < challenges.length - 1) {
      setCurrentChallengeIndex(prev => prev + 1)
      setWrongTapCount(0)
      setShowAutoHelp(false)
      setTraceDotsConnected(0)
      setCurrentDot(0)
    } else {
      // Complete - 4YO gets reward
      onComplete(lesson.lessonId, 100, Date.now()) // Always 100% for 4YO
    }
  }, [currentChallengeIndex, challenges.length, lesson, onComplete])
  
  // Handle find challenge tap
  const handleFindTap = useCallback((isTarget) => {
    if (isTarget) {
      celebrate()
      setTimeout(() => advanceToNext(), 1000)
    } else {
      playSound('incorrect')
      hapticFeedback('error') // Error haptic for wrong tap
      const newWrongCount = wrongTapCount + 1
      setWrongTapCount(newWrongCount)
      
      // Auto-help after 2 wrong taps
      if (newWrongCount >= 2) {
        setShowAutoHelp(true)
        playNarration("Try this one!")
        setTimeout(() => {
          celebrate()
          setTimeout(() => advanceToNext(), 1000)
        }, 1500)
      }
    }
  }, [wrongTapCount, celebrate, playSound, advanceToNext, hapticFeedback])
  
  // Handle connect-the-dots tracing
  const handleDotTap = useCallback((dotIndex) => {
    if (dotIndex === currentDot) {
      celebrate()
      setCurrentDot(prev => prev + 1)
      setTraceDotsConnected(prev => prev + 1)
      
      // Check if all dots connected
      const totalDots = currentChallenge.content.dots.length
      if (dotIndex === totalDots - 1) {
        setTimeout(() => advanceToNext(), 1000)
      }
    } else {
      playSound('incorrect')
    }
  }, [currentDot, currentChallenge, celebrate, playSound, advanceToNext])
  
  // Parental exit: Hold 3 seconds
  const handleExitStart = useCallback(() => {
    setExitHoldStart(Date.now())
  }, [])
  
  const handleExitEnd = useCallback(() => {
    if (exitHoldStart) {
      const heldTime = Date.now() - exitHoldStart
      if (heldTime >= 3000) {
        setShowExitConfirm(true)
      }
    }
    setExitHoldStart(null)
  }, [exitHoldStart])
  
  // Render challenge
  const renderChallenge = () => {
    if (!currentChallenge) {
      return <div className="simple-challenge">Loading...</div>
    }
    const { type, content } = currentChallenge
    
    switch (type) {
      case CHALLENGE_TYPES.INTRO:
        return (
          <div className="simple-challenge intro">
            <img className="tutor-big" src={getTutorImage('happy')} alt="Friendly tutor" style={{ animation: 'bounce 1s infinite' }} />
            <div className="big-message">{content.message}</div>
            <div className="waiting-indicator">
              <span className="dot">•</span>
              <span className="dot">•</span>
              <span className="dot">•</span>
            </div>
          </div>
        )
        
      case CHALLENGE_TYPES.LISTEN:
        return (
          <div className="simple-challenge listen">
            <div className="sound-wave">🎵</div>
            <div className="word-display">
              <img className="word-img-big" src={getObjectImage(content.targetWord)} alt={content.word} />
              <span className="word-text-big">{content.word}</span>
            </div>
            <div className="sound-text">{content.sound}</div>
          </div>
        )
        
      case CHALLENGE_TYPES.FIND:
        return (
          <div className="simple-challenge find">
            {showAutoHelp && (
              <div className="auto-help-arrow">👇</div>
            )}
            <div className="find-prompt">{content.instruction}</div>
            <div className="simple-find-grid">
              {/* Target */}
              <button
                className={`simple-find-item target ${showAutoHelp ? 'highlight' : ''}`}
                onClick={() => handleFindTap(true)}
                style={{ width: '140px', height: '140px' }}
              >
                <img src={getObjectImage(content.targetWord)} alt={content.targetLabel} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                <span className="item-label">{content.targetLabel}</span>
              </button>

              {/* Distractors */}
              {content.distractorWords.map((word, i) => (
                <button
                  key={i}
                  className="simple-find-item"
                  onClick={() => handleFindTap(false)}
                  style={{ width: '140px', height: '140px' }}
                >
                  <img src={getObjectImage(word)} alt={word} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </button>
              ))}
            </div>
          </div>
        )
        
      case CHALLENGE_TYPES.TRACE:
        const dots = content.dots
        return (
          <div className="simple-challenge trace">
            <div className="trace-instruction">Connect the dots!</div>
            <div className="connect-dots-area" style={{ width: '300px', height: '300px', position: 'relative' }}>
              {/* Draw lines between connected dots */}
              <svg width="300" height="300" style={{ position: 'absolute', top: 0, left: 0 }}>
                {dots.slice(0, currentDot).map((dot, i) => {
                  if (i === 0) return null
                  const prev = dots[i - 1]
                  return (
                    <line 
                      key={i}
                      x1={prev.x} y1={prev.y}
                      x2={dot.x} y2={dot.y}
                      stroke="#F04D26"
                      strokeWidth="6"
                      strokeLinecap="round"
                    />
                  )
                })}
              </svg>
              
              {/* Dots to tap */}
              {dots.map((dot, i) => (
                <button
                  key={i}
                  className={`connect-dot ${i === currentDot ? 'active' : i < currentDot ? 'connected' : ''}`}
                  style={{ 
                    position: 'absolute', 
                    left: dot.x - 25, 
                    top: dot.y - 25,
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: i === currentDot ? '#F04D26' : i < currentDot ? '#22c55e' : '#71717a',
                    border: '4px solid white',
                    boxShadow: i === currentDot ? '0 0 20px #F04D26' : 'none',
                    zIndex: 10
                  }}
                  onClick={() => handleDotTap(i)}
                  disabled={i !== currentDot}
                >
                  {i === currentDot && <span className="dot-number">{i + 1}</span>}
                </button>
              ))}
            </div>
            
            {/* Progress dots */}
            <div className="dots-progress">
              {dots.map((_, i) => (
                <span key={i} className={`progress-pip ${i < currentDot ? 'done' : ''}`}>●</span>
              ))}
            </div>
          </div>
        )
        
      case CHALLENGE_TYPES.REWARD:
        const rewardLetter = lesson.title.match(/Letter (.)/)?.[1]?.toLowerCase() || 'a'
        const rewardBadgeSrc = lesson.title.includes('Number')
          ? `${BASE}assets/numbers/badge-number-1.png`
          : `${BASE}assets/letters/badge-letter-${rewardLetter}.png`
        return (
          <div className="simple-challenge reward">
            <img className="reward-badge-big" src={rewardBadgeSrc} alt="Achievement badge" />
            <div className="reward-message-big">{content.message}</div>
            <div className="star-fill-animation">
              <span className="star-big">⭐</span>
            </div>
            <div className="confetti-mini">
              {[...Array(8)].map((_, i) => (
                <span key={i} className="mini-confetti" style={{ 
                  left: `${10 + i * 10}%`,
                  animationDelay: `${i * 0.1}s`
                }}>🎉</span>
              ))}
            </div>
          </div>
        )
        
      default:
        return null
    }
  }
  
  return (
    <div className="simple-lesson-view">
      {/* Parental exit button (hidden, requires 3s hold) */}
      <button 
        className="parent-exit-btn"
        onMouseDown={handleExitStart}
        onMouseUp={handleExitEnd}
        onTouchStart={handleExitStart}
        onTouchEnd={handleExitEnd}
        onMouseLeave={handleExitEnd}
        aria-label="Hold to exit"
      >
        {exitHoldStart && (
          <div 
            className="hold-progress" 
            style={{ width: `${Math.min(100, ((Date.now() - exitHoldStart) / 3000) * 100)}%` }}
          />
        )}
      </button>
      
      {/* Exit confirmation modal */}
      {showExitConfirm && (
        <div className="exit-modal" onClick={() => setShowExitConfirm(false)}>
          <div className="exit-modal-content">
            <p>Exit lesson?</p>
            <div className="exit-buttons">
              <button onClick={onExit} className="exit-yes">Yes, exit</button>
              <button onClick={() => setShowExitConfirm(false)} className="exit-no">Keep playing</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Mini celebration overlay */}
      {showMiniCelebration && (
        <div className="mini-celebration">
          <span className="sparkle">✨</span>
          <span className="yay-text">Yay!</span>
        </div>
      )}
      
      {/* Progress dots (visual only) */}
      <div className="simple-progress">
        {challenges.map((_, i) => (
          <div 
            key={i} 
            className={`simple-progress-dot ${i === currentChallengeIndex ? 'current' : i < currentChallengeIndex ? 'done' : ''}`}
          />
        ))}
      </div>
      
      {/* Challenge content */}
      <div className="challenge-content">
        {renderChallenge()}
      </div>
    </div>
  )
}

export default SimpleLessonView
