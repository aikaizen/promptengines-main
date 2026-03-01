import { useState, useEffect, useCallback, useRef } from 'react'
import useAudio from '../hooks/useAudio.js'

// Challenge types per Phase 0 spec
const CHALLENGE_TYPES = {
  INTRO: 'intro',
  LISTEN: 'listen',
  FIND: 'find',
  TRACE: 'trace',
  QUIZ: 'quiz',
  REWARD: 'reward',
  OUTRO: 'outro'
}

// Challenge durations in milliseconds
const CHALLENGE_DURATIONS = {
  [CHALLENGE_TYPES.INTRO]: 30 * 1000,
  [CHALLENGE_TYPES.LISTEN]: 90 * 1000,
  [CHALLENGE_TYPES.FIND]: 120 * 1000,
  [CHALLENGE_TYPES.TRACE]: 120 * 1000,
  [CHALLENGE_TYPES.QUIZ]: 90 * 1000,
  [CHALLENGE_TYPES.REWARD]: 30 * 1000,
  [CHALLENGE_TYPES.OUTRO]: 30 * 1000
}

// Create challenge sequence based on lesson data
const createChallenges = (lesson) => {
  const letter = lesson.title.match(/Letter (.)/)?.[1] || 
                 lesson.title.match(/Number (\d)/)?.[1] || 'A'
  
  const isNumberLesson = lesson.title.includes('Number')
  
  const words = lesson.learningObjectives[2]?.match(/[A-Za-z]+/g) || 
                ['Apple', 'Ant', 'Astronaut', 'Anchor', 'Acorn']
  const targetWords = words.slice(0, 5)
  
  const distractors = isNumberLesson 
    ? ['Two', 'Three', 'Four']
    : lesson.lessonId === 'quest-001-letter-a' 
      ? ['Ball', 'Cat', 'Dog']
      : lesson.lessonId === 'quest-002-letter-b'
        ? ['Apple', 'Cat', 'Dog']
        : lesson.lessonId === 'quest-003-letter-c'
          ? ['Apple', 'Ball', 'Dog']
          : lesson.lessonId === 'quest-004-letter-d'
            ? ['Apple', 'Ball', 'Cat']
            : ['Apple', 'Ball', 'Cat', 'Dog'].slice(0, 4)
  
  if (isNumberLesson) {
    // Number lessons have different structure
    return [
      {
        type: CHALLENGE_TYPES.INTRO,
        title: `Meet Number ${letter}`,
        instruction: `Let's learn about the number ${letter}!`,
        script: `Hello! Today we're learning about the number ${letter}. One means just a single thing.`,
        autoAdvance: true
      },
      {
        type: CHALLENGE_TYPES.LISTEN,
        title: `Counting with ${letter}`,
        instruction: `Listen to counting with ${letter}`,
        words: ['One apple', 'One ball', 'One cat'],
        script: `One! Just one. One apple. One ball. One cat.`,
        autoAdvance: true
      },
      {
        type: CHALLENGE_TYPES.FIND,
        title: `Find One`,
        instruction: `Tap the group that shows ONE item`,
        isCountingChallenge: true,
        items: [
          { count: 1, label: 'One', emoji: '🍎' },
          { count: 2, label: 'Two', emoji: '🍎🍎' },
          { count: 3, label: 'Three', emoji: '🍎🍎🍎' }
        ],
        correctCount: 1,
        requiredCorrect: 3
      },
      {
        type: CHALLENGE_TYPES.TRACE,
        title: `Trace Number ${letter}`,
        instruction: `Use your finger to trace the number ${letter}`,
        letter: letter,
        isNumber: true,
        requiredTraces: 3
      },
      {
        type: CHALLENGE_TYPES.QUIZ,
        title: `Number ${letter} Quiz`,
        instruction: `Which shows ONE?`,
        questions: [
          { question: `Which shows ONE item?`, options: ['🍎', '🍎🍎'], correct: 0, labels: ['One', 'Two'] },
          { question: `Find the number 1:`, options: ['1️⃣', '2️⃣'], correct: 0 },
          { question: `How many fingers?`, options: ['☝️', '✌️'], correct: 0, labels: ['One', 'Two'] }
        ],
        requiredCorrect: 2
      },
      {
        type: CHALLENGE_TYPES.REWARD,
        title: `Number ${letter} Badge!`,
        instruction: `You learned number ${letter}!`,
        script: `Amazing! You know the number ${letter}! You can count one thing!`,
        badge: `number-${letter}`,
        autoAdvance: true
      },
      {
        type: CHALLENGE_TYPES.OUTRO,
        title: `Great Job!`,
        instruction: `See you next time!`,
        script: `Great job today! Next time we'll learn more numbers!`,
        autoAdvance: true
      }
    ]
  }
  
  // Letter lessons
  return [
    {
      type: CHALLENGE_TYPES.INTRO,
      title: `Meet Letter ${letter}`,
      instruction: `Let's learn about the letter ${letter}!`,
      script: `Hello! I'm excited to learn with you! Today we're meeting the letter ${letter}!`,
      autoAdvance: true
    },
    {
      type: CHALLENGE_TYPES.LISTEN,
      title: `Letter ${letter} Sounds`,
      instruction: `Listen carefully to the ${letter} sound`,
      words: targetWords.slice(0, 3),
      script: `${letter} says ${getPhoneticSound(letter)} like ${targetWords[0].toLowerCase()}. ${letter}-${getPhoneticSound(letter)}-${targetWords[0].toLowerCase()}!`,
      autoAdvance: true
    },
    {
      type: CHALLENGE_TYPES.FIND,
      title: `Find ${letter} Words`,
      instruction: `Tap all the pictures that start with "${letter}"`,
      targets: targetWords,
      distractors: distractors,
      requiredCorrect: 4,
      letter: letter
    },
    {
      type: CHALLENGE_TYPES.TRACE,
      title: `Trace Letter ${letter}`,
      instruction: `Use your finger to trace the letter ${letter}`,
      letter: letter,
      requiredTraces: 3
    },
    {
      type: CHALLENGE_TYPES.QUIZ,
      title: `Letter ${letter} Quiz`,
      instruction: `Which one starts with "${letter}"?`,
      questions: [
        { question: `Which starts with "${letter}"?`, options: [targetWords[0], distractors[0]], correct: 0 },
        { question: `Pick the "${letter}" word:`, options: [targetWords[1], distractors[1] || distractors[0]], correct: 0 },
        { question: `Find the "${letter}" sound:`, options: [targetWords[2] || targetWords[0], distractors[2] || distractors[0]], correct: 0 }
      ],
      requiredCorrect: 2
    },
    {
      type: CHALLENGE_TYPES.REWARD,
      title: `Letter ${letter} Badge!`,
      instruction: `You unlocked Letter ${letter}!`,
      script: `Amazing! You unlocked the Letter ${letter}! You know ${letter} is for ${targetWords.map(w => w.toLowerCase()).join(', ')}!`,
      badge: `letter-${letter}`,
      autoAdvance: true
    },
    {
      type: CHALLENGE_TYPES.OUTRO,
      title: `Great Job!`,
      instruction: `See you next time!`,
      script: `Great job today! See you next time for more learning!`,
      autoAdvance: true
    }
  ]
}

const getPhoneticSound = (letter) => {
  const sounds = {
    'A': 'ahh', 'B': 'buh', 'C': 'cuh', 'D': 'duh', 'E': 'ehh',
    'F': 'fff', 'G': 'guh', 'H': 'huh', 'I': 'ihh', 'J': 'juh',
    'K': 'kuh', 'L': 'lll', 'M': 'mmm', 'N': 'nnn', 'O': 'ohh',
    'P': 'puh', 'Q': 'kwuh', 'R': 'rrr', 'S': 'sss', 'T': 'tuh',
    'U': 'uhh', 'V': 'vvv', 'W': 'wuh', 'X': 'ks', 'Y': 'yuh', 'Z': 'zzz'
  }
  return sounds[letter] || letter.toLowerCase()
}

function LessonView({ lesson, lessonPlan, onComplete, onExit }) {
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState([])
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackType, setFeedbackType] = useState('correct')
  const [errorCount, setErrorCount] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [lessonStartTime] = useState(Date.now())
  const [foundItems, setFoundItems] = useState(new Set())
  const [traceCount, setTraceCount] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState([])
  const [needsReview, setNeedsReview] = useState(false)
  const [timer, setTimer] = useState(null)
  const [isTracing, setIsTracing] = useState(false)
  const [tracePath, setTracePath] = useState([])
  const [celebrationActive, setCelebrationActive] = useState(false)
  const [showTraceGuide, setShowTraceGuide] = useState(false)
  const [frustrationTimer, setFrustrationTimer] = useState(null)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [streakCount, setStreakCount] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  
  const { playSound, playNarration } = useAudio()
  const traceCanvasRef = useRef(null)
  const challengeStartTimeRef = useRef(Date.now())
  
  const challenges = useRef(createChallenges(lesson)).current
  const currentChallenge = challenges[currentChallengeIndex]
  
  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handler = (e) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])
  
  // Reset challenge start time when challenge changes
  useEffect(() => {
    challengeStartTimeRef.current = Date.now()
    setStreakCount(0)
    setIsLocked(false)
  }, [currentChallengeIndex])
  
  // Timer for auto-advance (Intro, Listen, Reward, Outro)
  useEffect(() => {
    if (currentChallenge?.autoAdvance) {
      const duration = CHALLENGE_DURATIONS[currentChallenge.type]
      const startTime = Date.now()
      
      playNarration(currentChallenge.script || currentChallenge.instruction)
      
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime
        const remaining = Math.max(0, duration - elapsed)
        setTimer(remaining)
        
        if (remaining <= 0) {
          clearInterval(interval)
          advanceToNextChallenge()
        }
      }, 100)
      
      return () => clearInterval(interval)
    }
    setTimer(null)
  }, [currentChallengeIndex, currentChallenge, playNarration])
  
  // Adaptive difficulty: show hint after 3 errors
  useEffect(() => {
    if (errorCount >= 3 && !showHint) {
      setShowHint(true)
      setFeedbackType('hint')
      setShowFeedback(true)
      playSound('hint')
      const timeout = setTimeout(() => setShowFeedback(false), 2000)
      return () => clearTimeout(timeout)
    }
  }, [errorCount, showHint, playSound])
  
  // Frustration detection: auto-highlight after 30 seconds of no progress
  useEffect(() => {
    if (currentChallenge?.type === CHALLENGE_TYPES.FIND && !showHint) {
      const timer = setTimeout(() => {
        if (foundItems.size === 0) {
          setShowHint(true)
          setFeedbackType('hint')
          setShowFeedback(true)
          playSound('hint')
          setTimeout(() => setShowFeedback(false), 3000)
        }
      }, 30000) // 30 seconds
      
      return () => clearTimeout(timer)
    }
  }, [currentChallenge, foundItems.size, showHint, playSound])
  
  // Trace guide: show after 2 failed traces
  useEffect(() => {
    if (currentChallenge?.type === CHALLENGE_TYPES.TRACE && traceCount === 0) {
      const failedAttempts = Math.floor(errorCount / 2) // Each failed trace adds ~2 errors
      if (failedAttempts >= 2 && !showTraceGuide) {
        setShowTraceGuide(true)
      }
    }
  }, [currentChallenge, traceCount, errorCount, showTraceGuide])
  
  const advanceToNextChallenge = useCallback(() => {
    if (currentChallengeIndex < challenges.length - 1) {
      setCurrentChallengeIndex(prev => prev + 1)
      setErrorCount(0)
      setShowHint(false)
      setFoundItems(new Set())
      setQuizAnswers([])
      setNeedsReview(false)
      setTraceCount(0)
      setTracePath([])
      setCelebrationActive(false)
    } else {
      // Complete lesson
      const timeSpent = Date.now() - lessonStartTime
      const finalScore = Math.round((score / challenges.length) * 100)
      onComplete(lesson.lessonId, finalScore, timeSpent)
    }
  }, [currentChallengeIndex, challenges.length, lesson, score, lessonStartTime, onComplete])
  
  const handleAnswer = useCallback((isCorrect, value) => {
    const newAnswers = [...answers, { challenge: currentChallengeIndex, correct: isCorrect, value }]
    setAnswers(newAnswers)
    
    if (isCorrect) {
      setScore(prev => prev + 1)
      setFeedbackType('correct')
      setErrorCount(0)
      playSound('correct')
      
      if (currentChallenge.type === CHALLENGE_TYPES.REWARD) {
        setCelebrationActive(true)
      }
    } else {
      setErrorCount(prev => prev + 1)
      setFeedbackType('incorrect')
      playSound('incorrect')
    }
    
    setShowFeedback(true)
    
    setTimeout(() => {
      setShowFeedback(false)
      if (isCorrect && !currentChallenge.autoAdvance) {
        advanceToNextChallenge()
      }
    }, 1500)
  }, [answers, currentChallengeIndex, currentChallenge, playSound, advanceToNextChallenge])
  
  // Handle Find/Tap challenge
  const handleFindTap = useCallback((item, isTarget) => {
    if (currentChallenge.isCountingChallenge) {
      // Counting challenge: check if count matches
      const isCorrect = item.count === currentChallenge.correctCount
      handleAnswer(isCorrect, item.count)
      return
    }
    
    if (foundItems.has(item)) return
    
    const newFound = new Set(foundItems)
    
    if (isTarget) {
      newFound.add(item)
      setFoundItems(newFound)
      playSound('tap-correct')
      
      // Check if we've found enough
      if (newFound.size >= currentChallenge.requiredCorrect) {
        handleAnswer(true, item)
      } else {
        // Show progress feedback but don't advance
        setFeedbackType('correct')
        setShowFeedback(true)
        setTimeout(() => setShowFeedback(false), 600)
      }
    } else {
      playSound('tap-wrong')
      setErrorCount(prev => prev + 1)
      setFeedbackType('incorrect')
      setShowFeedback(true)
      setTimeout(() => setShowFeedback(false), 600)
    }
  }, [foundItems, currentChallenge, handleAnswer, playSound])
  
  // Handle trace start
  const handleTraceStart = useCallback((e) => {
    setIsTracing(true)
    const canvas = traceCanvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = (e.touches?.[0]?.clientX || e.clientX) - rect.left
    const y = (e.touches?.[0]?.clientY || e.clientY) - rect.top
    setTracePath([{ x, y }])
  }, [])
  
  // Handle trace move
  const handleTraceMove = useCallback((e) => {
    if (!isTracing) return
    e.preventDefault()
    
    const canvas = traceCanvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = (e.touches?.[0]?.clientX || e.clientX) - rect.left
    const y = (e.touches?.[0]?.clientY || e.clientY) - rect.top
    
    setTracePath(prev => [...prev, { x, y }])
  }, [isTracing])
  
  // Handle trace end
  const handleTraceEnd = useCallback(() => {
    if (!isTracing) return
    setIsTracing(false)
    
    // Calculate trace accuracy with enhanced algorithm
    const accuracy = calculateTraceAccuracy(
      tracePath, 
      currentChallenge.letter,
      currentChallenge.isNumber
    )
    
    // PRD target: 70% accuracy, but we use 55% for MVP to be more forgiving
    const threshold = 55
    
    if (accuracy >= threshold) {
      const newCount = traceCount + 1
      setTraceCount(newCount)
      
      if (newCount >= currentChallenge.requiredTraces) {
        handleAnswer(true, `trace-complete-${accuracy}%`)
      } else {
        playSound('trace-progress')
        setFeedbackType('correct')
        setShowFeedback(true)
        setTracePath([])
        setTimeout(() => setShowFeedback(false), 800)
      }
    } else {
      playSound('trace-fail')
      setErrorCount(prev => prev + 2) // 2 errors per failed trace
      setFeedbackType('incorrect')
      setShowFeedback(true)
      setTimeout(() => {
        setShowFeedback(false)
        setTracePath([])
      }, 800)
    }
  }, [isTracing, tracePath, currentChallenge, traceCount, handleAnswer, playSound])
  
  // Enhanced trace accuracy with letter-specific path detection
  const calculateTraceAccuracy = (path, letter, isNumber = false) => {
    if (path.length < 10) return 0 // Need enough points
    
    const canvas = traceCanvasRef.current
    if (!canvas) return 0
    
    const canvasWidth = canvas.width
    const canvasHeight = canvas.height
    const centerX = canvasWidth / 2
    const centerY = canvasHeight / 2
    
    // Define expected paths for letters and numbers
    const getExpectedPath = (char, isNum) => {
      if (isNum) {
        // Number 1: straight vertical line from top to bottom
        return [
          { x: centerX, y: centerY - 80 },
          { x: centerX, y: centerY + 80 }
        ]
      }
      
      // Letter paths (simplified strokes)
      switch (char) {
        case 'A':
        case 'a':
          // A: diagonal up, diagonal down, horizontal middle
          return [
            { x: centerX - 50, y: centerY + 60 },
            { x: centerX, y: centerY - 60 },
            { x: centerX + 50, y: centerY + 60 },
            { x: centerX - 25, y: centerY },
            { x: centerX + 25, y: centerY }
          ]
        case 'B':
        case 'b':
          // B: vertical, top curve, bottom curve
          return [
            { x: centerX - 40, y: centerY - 70 },
            { x: centerX - 40, y: centerY + 70 },
            { x: centerX + 30, y: centerY - 35 },
            { x: centerX - 40, y: centerY },
            { x: centerX + 30, y: centerY + 35 }
          ]
        case 'C':
        case 'c':
          // C: curve from top right, around to bottom right
          return [
            { x: centerX + 40, y: centerY - 50 },
            { x: centerX - 20, y: centerY - 70 },
            { x: centerX - 50, y: centerY },
            { x: centerX - 20, y: centerY + 70 },
            { x: centerX + 40, y: centerY + 50 }
          ]
        case 'D':
        case 'd':
          // D: vertical, curve right
          return [
            { x: centerX - 40, y: centerY - 70 },
            { x: centerX - 40, y: centerY + 70 },
            { x: centerX + 30, y: centerY + 70 },
            { x: centerX + 50, y: centerY },
            { x: centerX + 30, y: centerY - 70 }
          ]
        case 'E':
        case 'e':
          // E: vertical, top, middle, bottom horizontals
          return [
            { x: centerX + 50, y: centerY - 70 },
            { x: centerX - 40, y: centerY - 70 },
            { x: centerX - 40, y: centerY + 70 },
            { x: centerX - 40, y: centerY },
            { x: centerX + 30, y: centerY },
            { x: centerX - 40, y: centerY + 70 },
            { x: centerX + 50, y: centerY + 70 }
          ]
        default:
          // Generic: any reasonable vertical or diagonal stroke
          return [
            { x: centerX, y: centerY - 70 },
            { x: centerX, y: centerY + 70 }
          ]
      }
    }
    
    const expectedPath = getExpectedPath(letter, isNumber)
    
    // Calculate total distance traced
    const totalDistance = path.reduce((sum, point, i) => {
      if (i === 0) return 0
      const dx = point.x - path[i-1].x
      const dy = point.y - path[i-1].y
      return sum + Math.sqrt(dx*dx + dy*dy)
    }, 0)
    
    // Minimum distance check (100px for letters, 80px for number 1)
    const minDistance = isNumber ? 80 : 100
    if (totalDistance < minDistance) return 0
    
    // Check if traced path covers expected key points
    let pointsCovered = 0
    expectedPath.forEach(expectedPoint => {
      const nearPoint = path.some(p => {
        const dx = p.x - expectedPoint.x
        const dy = p.y - expectedPoint.y
        const dist = Math.sqrt(dx*dx + dy*dy)
        return dist < 40 // Within 40px of expected point
      })
      if (nearPoint) pointsCovered++
    })
    
    // Calculate coverage percentage
    const coveragePercent = (pointsCovered / expectedPath.length) * 100
    
    // Weighted score: coverage is 70%, distance is 30%
    const distanceScore = Math.min(100, (totalDistance / 200) * 100)
    const finalScore = (coveragePercent * 0.7) + (distanceScore * 0.3)
    
    return Math.round(finalScore)
  }
  
  // Handle quiz answer
  const handleQuizAnswer = useCallback((questionIndex, answerIndex) => {
    const question = currentChallenge.questions[questionIndex]
    const isCorrect = answerIndex === question.correct
    
    const newQuizAnswers = [...quizAnswers]
    newQuizAnswers[questionIndex] = { answerIndex, correct: isCorrect }
    setQuizAnswers(newQuizAnswers)
    
    if (isCorrect) {
      playSound('correct')
    } else {
      playSound('incorrect')
      setErrorCount(prev => prev + 1)
    }
    
    // Check if all questions answered
    const answeredCount = newQuizAnswers.filter(a => a !== undefined).length
    if (answeredCount === currentChallenge.questions.length) {
      const correctCount = newQuizAnswers.filter(a => a?.correct).length
      
      if (correctCount >= currentChallenge.requiredCorrect) {
        handleAnswer(true, `quiz-${correctCount}`)
      } else {
        setNeedsReview(true)
        setFeedbackType('incorrect')
        setShowFeedback(true)
        playSound('review-needed')
      }
    }
  }, [currentChallenge, quizAnswers, handleAnswer, playSound])
  
  const handleReview = useCallback(() => {
    // Go back to find challenge for review
    const findChallengeIndex = challenges.findIndex(c => c.type === CHALLENGE_TYPES.FIND)
    if (findChallengeIndex >= 0) {
      setCurrentChallengeIndex(findChallengeIndex)
      setNeedsReview(false)
      setShowFeedback(false)
      setErrorCount(0)
      setFoundItems(new Set())
      setQuizAnswers([])
    }
  }, [challenges])
  
  const progress = ((currentChallengeIndex + 1) / challenges.length) * 100
  const formatTime = (ms) => Math.ceil(ms / 1000)
  
  // Get emoji for word
  const getEmoji = (word) => {
    const emojis = {
      'Apple': '🍎', 'Ant': '🐜', 'Astronaut': '👨‍🚀', 'Anchor': '⚓', 'Acorn': '🌰',
      'Butterfly': '🦋', 'Bear': '🐻', 'Ball': '⚽', 'Boat': '🚢', 'Banana': '🍌',
      'Cat': '🐱', 'Car': '🚗', 'Cookie': '🍪', 'Cup': '☕', 'Carrot': '🥕',
      'Dog': '🐕', 'Duck': '🦆', 'Dinosaur': '🦕', 'Donut': '🍩', 'Door': '🚪',
      'Elephant': '🐘', 'Egg': '🥚', 'Eagle': '🦅', 'Elbow': '💪', 'Engine': '🚂',
      'Balloon': '🎈', 'Book': '📚', 'Bird': '🐦', 'Bus': '🚌'
    }
    return emojis[word] || '⭐'
  }
  
  // Render different challenge types
  const renderChallenge = () => {
    switch (currentChallenge.type) {
      case CHALLENGE_TYPES.INTRO:
        return (
          <div className="intro-challenge">
            <div className="tutor-avatar-large" role="img" aria-label="Friendly tutor">
              👨‍🏫
            </div>
            <h2 className="challenge-title">{currentChallenge.title}</h2>
            <p className="challenge-script">{currentChallenge.script}</p>
            {timer !== null && (
              <div className="timer-bar">
                <div className="timer-progress" style={{ width: `${(1 - timer / CHALLENGE_DURATIONS.INTRO) * 100}%` }}></div>
              </div>
            )}
          </div>
        )
        
      case CHALLENGE_TYPES.LISTEN:
        return (
          <div className="listen-challenge">
            <div className="tutor-avatar" role="img" aria-label="Friendly tutor speaking">
              👨‍🏫
            </div>
            <div className="words-display">
              {currentChallenge.words?.map((word, i) => (
                <div key={word} className="word-card-large" style={{ animationDelay: `${i * 0.8}s` }}>
                  <span className="word-emoji">{getEmoji(word)}</span>
                  <span className="word-text-large">{word}</span>
                  <span className="word-sound">{lesson.title.match(/Letter (.)/)?.[1] || lesson.title.match(/Number (\d)/)?.[1]}-{word.toLowerCase()}</span>
                </div>
              ))}
            </div>
            {timer !== null && (
              <div className="timer" role="timer" aria-label="Time remaining">
                <div className="timer-icon">⏱️</div>
                <span>{formatTime(timer)}s</span>
              </div>
            )}
          </div>
        )
        
      case CHALLENGE_TYPES.FIND:
        const items = currentChallenge.isCountingChallenge
          ? currentChallenge.items
          : [...(currentChallenge.targets || []), ...(currentChallenge.distractors || [])].sort(() => Math.random() - 0.5)
          
        return (
          <div className="find-challenge">
            {!currentChallenge.isCountingChallenge && (
              <div className="find-progress" role="status" aria-label={`Found ${foundItems.size} of ${currentChallenge.requiredCorrect}`}>
                <div className="progress-pill">
                  Found: {foundItems.size} / {currentChallenge.requiredCorrect}
                </div>
              </div>
            )}
            
            <div className="find-grid" role="grid" aria-label={currentChallenge.isCountingChallenge ? "Tap the group showing ONE" : `Tap items starting with ${currentChallenge.letter}`}>
              {currentChallenge.isCountingChallenge ? (
                items.map((item) => (
                  <button
                    key={item.count}
                    className="counting-item"
                    onClick={() => handleFindTap(item, item.count === currentChallenge.correctCount)}
                    style={{ minHeight: '120px', minWidth: '120px' }}
                  >
                    <span className="counting-emoji">{item.emoji}</span>
                    <span className="counting-label">{item.label}</span>
                  </button>
                ))
              ) : (
                items.map((item) => {
                  const isFound = foundItems.has(item)
                  const isTarget = (currentChallenge.targets || []).includes(item)
                  return (
                    <button
                      key={item}
                      className={`find-item-large ${isFound ? 'found' : ''}`}
                      onClick={() => handleFindTap(item, isTarget)}
                      disabled={isFound}
                      role="gridcell"
                      aria-pressed={isFound}
                      style={{ minHeight: '100px', minWidth: '100px' }}
                    >
                      <span className="item-emoji-large">{getEmoji(item)}</span>
                      <span className="item-label">{item}</span>
                    </button>
                  )
                })
              )}
            </div>
            
            {showHint && (
              <div className="hint-large" role="alert">
                💡 Hint: {currentChallenge.isCountingChallenge 
                  ? 'Look for just ONE item' 
                  : `Look for items that start with "${currentChallenge.letter}"`}
              </div>
            )}
          </div>
        )
        
      case CHALLENGE_TYPES.TRACE:
        // Real-time canvas drawing effect
        useEffect(() => {
          const canvas = traceCanvasRef.current
          if (!canvas || tracePath.length < 2) return
          
          const ctx = canvas.getContext('2d')
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          
          // Draw the traced path
          ctx.beginPath()
          ctx.strokeStyle = '#F04D26'
          ctx.lineWidth = 8
          ctx.lineCap = 'round'
          ctx.lineJoin = 'round'
          
          tracePath.forEach((point, i) => {
            if (i === 0) {
              ctx.moveTo(point.x, point.y)
            } else {
              ctx.lineTo(point.x, point.y)
            }
          })
          ctx.stroke()
        }, [tracePath])
        
        return (
          <div className="trace-challenge">
            <div className="trace-progress" role="status" aria-label={`Completed ${traceCount} of ${currentChallenge.requiredTraces} traces`}>
              <div className="trace-dots">
                {[...Array(currentChallenge.requiredTraces)].map((_, i) => (
                  <span key={i} className={`trace-dot ${i < traceCount ? 'completed' : ''}`}>●</span>
                ))}
              </div>
            </div>
            
            <div className="trace-area" style={{ position: 'relative' }}>
              {/* Letter/Number background */}
              <div className="letter-background">
                {currentChallenge.isNumber ? (
                  <span className="trace-number">{currentChallenge.letter}</span>
                ) : (
                  <span className="trace-letter">{currentChallenge.letter}</span>
                )}
              </div>
              
              {/* Animated guide overlay */}
              {showTraceGuide && (
                <div className="trace-guide" aria-hidden="true">
                  <svg width="300" height="300" viewBox="0 0 300 300">
                    {currentChallenge.isNumber ? (
                      // Number 1 guide: vertical line from top to bottom
                      <line 
                        x1="150" y1="50" 
                        x2="150" y2="250" 
                        stroke="#F04D26" 
                        strokeWidth="4" 
                        strokeDasharray="10,10"
                        opacity="0.6"
                      >
                        <animate 
                          attributeName="stroke-dashoffset" 
                          from="0" to="20" 
                          dur="1s" 
                          repeatCount="indefinite"
                        />
                      </line>
                    ) : (
                      // Letter guide dots
                      <g fill="#F04D26" opacity="0.5">
                        <circle cx="150" cy="50" r="8">
                          <animate attributeName="r" values="6;10;6" dur="1.5s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="150" cy="250" r="8">
                          <animate attributeName="r" values="6;10;6" dur="1.5s" begin="0.5s" repeatCount="indefinite" />
                        </circle>
                      </g>
                    )}
                  </svg>
                </div>
              )}
              
              <canvas
                ref={traceCanvasRef}
                className="trace-canvas"
                width={300}
                height={300}
                onMouseDown={handleTraceStart}
                onMouseMove={handleTraceMove}
                onMouseUp={handleTraceEnd}
                onMouseLeave={handleTraceEnd}
                onTouchStart={handleTraceStart}
                onTouchMove={handleTraceMove}
                onTouchEnd={handleTraceEnd}
                style={{ touchAction: 'none', position: 'relative', zIndex: 10 }}
              />
            </div>
            
            {showTraceGuide && (
              <div className="trace-guide-hint" role="alert">
                💡 Follow the dotted line with your finger!
              </div>
            )}
            
            <p className="trace-instruction-large">
              {currentChallenge.isNumber 
                ? `Draw the number ${currentChallenge.letter} with your finger`
                : `Trace the letter ${currentChallenge.letter} with your finger`
              }
            </p>
          </div>
        )
        
      case CHALLENGE_TYPES.QUIZ:
        return (
          <div className="quiz-challenge">
            {needsReview ? (
              <div className="review-needed-large">
                <div className="review-icon">🔄</div>
                <h3>Let's Practice More!</h3>
                <p>You got {quizAnswers.filter(a => a?.correct).length} out of {currentChallenge.questions.length}.</p>
                <p className="review-message">No problem! Let's practice again!</p>
                <button 
                  className="review-btn-large"
                  onClick={handleReview}
                >
                  Practice Again
                </button>
              </div>
            ) : (
              <div className="quiz-questions-large">
                {currentChallenge.questions.map((q, qIndex) => {
                  const answered = quizAnswers[qIndex]
                  const showQuestion = !answered || qIndex === quizAnswers.findIndex(a => !a)
                  
                  if (!showQuestion) return null
                  
                  return (
                    <div key={qIndex} className="quiz-question-active">
                      <div className="question-number">Question {qIndex + 1} of {currentChallenge.questions.length}</div>
                      <h3 className="question-text-large">{q.question}</h3>
                      <div className="quiz-options-large" role="radiogroup" aria-label={q.question}>
                        {q.options.map((option, oIndex) => (
                          <button
                            key={oIndex}
                            className={`quiz-option-large ${answered?.answerIndex === oIndex ? (answered?.correct ? 'correct' : 'incorrect') : ''}`}
                            onClick={() => !answered && handleQuizAnswer(qIndex, oIndex)}
                            disabled={answered !== undefined}
                            role="radio"
                            aria-checked={answered?.answerIndex === oIndex}
                            style={{ minHeight: '100px', fontSize: q.labels ? '1.5rem' : '3rem' }}
                          >
                            {q.labels ? q.labels[oIndex] : option}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
                
                {quizAnswers.filter(a => a !== undefined).length > 0 && (
                  <div className="quiz-progress">
                    {quizAnswers.map((a, i) => (
                      <span key={i} className={`quiz-dot ${a ? (a.correct ? 'correct' : 'incorrect') : ''}`}>●</span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )
        
      case CHALLENGE_TYPES.REWARD:
        return (
          <div className={`reward-challenge ${celebrationActive ? 'celebrating' : ''}`}>
            <div className="badge-container">
              <div className="badge-large" role="img" aria-label="Achievement badge">
                {currentChallenge.badge?.includes('letter') ? '🏆' : currentChallenge.badge?.includes('number') ? '🎯' : '⭐'}
              </div>
              <div className="badge-letter">{lesson.title.match(/Letter (.)/)?.[1] || lesson.title.match(/Number (\d)/)?.[1]}</div>
            </div>
            <h2 className="reward-title">{currentChallenge.title}</h2>
            <p className="reward-script">{currentChallenge.script}</p>
            <div className="confetti" aria-hidden="true">
              {[...Array(20)].map((_, i) => (
                <span key={i} className="confetti-piece" style={{ 
                  left: `${Math.random() * 100}%`, 
                  animationDelay: `${Math.random() * 2}s`,
                  backgroundColor: ['#F04D26', '#22c55e', '#3b82f6', '#f59e0b'][Math.floor(Math.random() * 4)]
                }}>🎉</span>
              ))}
            </div>
          </div>
        )
        
      case CHALLENGE_TYPES.OUTRO:
        return (
          <div className="outro-challenge">
            <div className="tutor-avatar-wave" role="img" aria-label="Friendly tutor waving goodbye">
              👋
            </div>
            <h2 className="outro-title">Great Job!</h2>
            <p className="outro-script">{currentChallenge.script}</p>
            {timer !== null && (
              <div className="timer-bar">
                <div className="timer-progress" style={{ width: `${(1 - timer / CHALLENGE_DURATIONS.OUTRO) * 100}%` }}></div>
              </div>
            )}
          </div>
        )
        
      default:
        return <div className="unknown-challenge">Unknown challenge type: {currentChallenge.type}</div>
    }
  }
  
  return (
    <div className="lesson-view" role="article" aria-label={`Lesson: ${lesson.title}`}>
      <div className="lesson-header">
        <button 
          className="exit-btn" 
          onClick={onExit}
          aria-label="Exit lesson"
        >
          ← Exit
        </button>
        <h2>{lesson.title}</h2>
        <div className="progress-bar" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="challenge-indicator">
          {currentChallenge.title}
        </div>
      </div>

      <div className="challenge-container" role="region" aria-label="Challenge area">
        {showFeedback ? (
          <div 
            className={`feedback-large ${feedbackType}`}
            role="alert"
            aria-live="polite"
          >
            <div className="feedback-icon">
              {feedbackType === 'correct' && '🎉'}
              {feedbackType === 'incorrect' && '💪'}
              {feedbackType === 'hint' && '💡'}
            </div>
            <div className="feedback-text">
              {feedbackType === 'correct' && 'Great job!'}
              {feedbackType === 'incorrect' && 'Keep trying!'}
              {feedbackType === 'hint' && 'Here\'s a hint!'}
            </div>
          </div>
        ) : (
          renderChallenge()
        )}
      </div>

      <div className="lesson-footer">
        <span>Quest {lesson.sequence} of {lessonPlan.structure.lessonCount}</span>
        <span className="score" aria-label={`Current score: ${score}`}>
          Stars: {score} ⭐
        </span>
      </div>
    </div>
  )
}

export default LessonView
