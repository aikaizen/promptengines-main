import { useState, useEffect, useCallback, useRef } from 'react'

// Challenge types per Phase 0 spec
const CHALLENGE_TYPES = {
  LISTEN: 'listen',
  FIND: 'find',
  TRACE: 'trace',
  QUIZ: 'quiz'
}

// Challenge durations in milliseconds (per MVP spec)
const CHALLENGE_DURATIONS = {
  [CHALLENGE_TYPES.LISTEN]: 90 * 1000,  // 90 seconds
  [CHALLENGE_TYPES.FIND]: 120 * 1000,    // 120 seconds
  [CHALLENGE_TYPES.TRACE]: 120 * 1000,   // 120 seconds
  [CHALLENGE_TYPES.QUIZ]: 90 * 1000      // 90 seconds
}

// Default challenge structure per lesson
const createChallenges = (lesson) => {
  const letter = lesson.title.includes('A') ? 'A' : 
                 lesson.title.includes('B') ? 'B' :
                 lesson.title.includes('C') ? 'C' :
                 lesson.title.includes('D') ? 'D' :
                 lesson.title.includes('E') ? 'E' : '1'
  
  const words = lesson.learningObjectives[2]?.match(/[A-Za-z]+/g) || ['Apple', 'Ant', 'Astronaut']
  const targetWords = words.slice(0, 3)
  
  return [
    {
      type: CHALLENGE_TYPES.LISTEN,
      title: `Listen to Letter ${letter}`,
      instruction: `Listen carefully to the words that start with "${letter}"`,
      words: targetWords,
      autoAdvance: true
    },
    {
      type: CHALLENGE_TYPES.FIND,
      title: `Find the ${letter} Words`,
      instruction: `Tap all the pictures that start with "${letter}"`,
      targets: targetWords,
      distractors: lesson.lessonId === 'quest-001-letter-a' 
        ? ['Ball', 'Cat', 'Dog']
        : lesson.lessonId === 'quest-002-letter-b'
        ? ['Apple', 'Cat', 'Dog']
        : ['Apple', 'Ball', 'Dog'],
      requiredCorrect: 4,
      gridSize: { cols: 3, rows: 2 }
    },
    {
      type: CHALLENGE_TYPES.TRACE,
      title: `Trace Letter ${letter}`,
      instruction: `Use your finger to trace the letter ${letter}`,
      letter: letter,
      requiredTraces: 3,
      accuracyThreshold: 70
    },
    {
      type: CHALLENGE_TYPES.QUIZ,
      title: `Quiz Time!`,
      instruction: `Which one starts with "${letter}"?`,
      questions: [
        { question: `Which starts with "${letter}"?`, options: [targetWords[0], 'Banana'], correct: 0 },
        { question: `Pick the "${letter}" word:`, options: [targetWords[1], 'Car'], correct: 0 },
        { question: `Find the "${letter}" sound:`, options: [targetWords[2], 'Door'], correct: 0 }
      ],
      requiredCorrect: 2
    }
  ]
}

function LessonView({ lesson, lessonPlan, onComplete, onExit }) {
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState([])
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackType, setFeedbackType] = useState('correct') // 'correct', 'incorrect', 'hint'
  const [errorCount, setErrorCount] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [lessonStartTime] = useState(Date.now())
  const [foundItems, setFoundItems] = useState(new Set())
  const [traceCount, setTraceCount] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState([])
  const [needsReview, setNeedsReview] = useState(false)
  const [timer, setTimer] = useState(null)
  
  const challenges = useRef(createChallenges(lesson)).current
  const currentChallenge = challenges[currentChallengeIndex]
  
  // Timer for auto-advance (Listen phase)
  useEffect(() => {
    if (currentChallenge?.type === CHALLENGE_TYPES.LISTEN && currentChallenge?.autoAdvance) {
      const duration = CHALLENGE_DURATIONS[CHALLENGE_TYPES.LISTEN]
      const startTime = Date.now()
      
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
  }, [currentChallengeIndex])
  
  // Adaptive difficulty: show hint after 3 errors
  useEffect(() => {
    if (errorCount >= 3 && !showHint) {
      setShowHint(true)
      setFeedbackType('hint')
      setShowFeedback(true)
      const timeout = setTimeout(() => setShowFeedback(false), 2000)
      return () => clearTimeout(timeout)
    }
  }, [errorCount, showHint])
  
  const advanceToNextChallenge = useCallback(() => {
    if (currentChallengeIndex < challenges.length - 1) {
      setCurrentChallengeIndex(prev => prev + 1)
      setErrorCount(0)
      setShowHint(false)
      setFoundItems(new Set())
      setQuizAnswers([])
      setNeedsReview(false)
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
    } else {
      setErrorCount(prev => prev + 1)
      setFeedbackType('incorrect')
    }
    
    setShowFeedback(true)
    
    setTimeout(() => {
      setShowFeedback(false)
      if (isCorrect) {
        advanceToNextChallenge()
      }
    }, 1500)
  }, [answers, currentChallengeIndex, advanceToNextChallenge])
  
  // Handle Find/Tap challenge
  const handleFindTap = useCallback((item, isTarget) => {
    if (foundItems.has(item)) return
    
    const newFound = new Set(foundItems)
    
    if (isTarget) {
      newFound.add(item)
      setFoundItems(newFound)
      
      // Check if we've found enough
      if (newFound.size >= currentChallenge.requiredCorrect) {
        handleAnswer(true, item)
      }
    } else {
      // Wrong item tapped
      setErrorCount(prev => prev + 1)
      setFeedbackType('incorrect')
      setShowFeedback(true)
      setTimeout(() => setShowFeedback(false), 800)
    }
  }, [foundItems, currentChallenge, handleAnswer])
  
  // Handle trace completion
  const handleTraceComplete = useCallback(() => {
    const newCount = traceCount + 1
    setTraceCount(newCount)
    
    if (newCount >= currentChallenge.requiredTraces) {
      handleAnswer(true, 'trace-complete')
    } else {
      // Show progress but don't advance
      setFeedbackType('correct')
      setShowFeedback(true)
      setTimeout(() => setShowFeedback(false), 800)
    }
  }, [traceCount, currentChallenge, handleAnswer])
  
  // Handle quiz answer
  const handleQuizAnswer = useCallback((questionIndex, answerIndex) => {
    const question = currentChallenge.questions[questionIndex]
    const isCorrect = answerIndex === question.correct
    
    const newQuizAnswers = [...quizAnswers]
    newQuizAnswers[questionIndex] = { answerIndex, correct: isCorrect }
    setQuizAnswers(newQuizAnswers)
    
    if (!isCorrect) {
      setErrorCount(prev => prev + 1)
    }
    
    // Check if all questions answered
    const answeredCount = newQuizAnswers.filter(a => a !== undefined).length
    if (answeredCount === currentChallenge.questions.length) {
      const correctCount = newQuizAnswers.filter(a => a?.correct).length
      
      if (correctCount >= currentChallenge.requiredCorrect) {
        handleAnswer(true, `quiz-${correctCount}`)
      } else {
        // Failed quiz - needs review
        setNeedsReview(true)
        setFeedbackType('incorrect')
        setShowFeedback(true)
      }
    }
  }, [currentChallenge, quizAnswers, handleAnswer])
  
  const handleReview = useCallback(() => {
    // Go back to find challenge for review
    setCurrentChallengeIndex(1)
    setNeedsReview(false)
    setShowFeedback(false)
    setErrorCount(0)
    setFoundItems(new Set())
  }, [])
  
  const progress = ((currentChallengeIndex + 1) / challenges.length) * 100
  const formatTime = (ms) => Math.ceil(ms / 1000)
  
  // Render different challenge types
  const renderChallenge = () => {
    switch (currentChallenge.type) {
      case CHALLENGE_TYPES.LISTEN:
        return (
          <div className="listen-challenge">
            <div className="tutor-avatar" role="img" aria-label="Friendly tutor">
              👨‍🏫
            </div>
            <div className="words-display">
              {currentChallenge.words.map((word, i) => (
                <div key={word} className="word-card" style={{ animationDelay: `${i * 0.5}s` }}>
                  <span className="word-text">{word}</span>
                  <span className="word-sound">{lesson.title.match(/Letter (.)/)?.[1] || 'A'}-{word.toLowerCase()}</span>
                </div>
              ))}
            </div>
            {timer !== null && (
              <div className="timer" role="timer" aria-label="Time remaining">
                Auto-advancing in {formatTime(timer)}s
              </div>
            )}
          </div>
        )
        
      case CHALLENGE_TYPES.FIND:
        const allItems = [...currentChallenge.targets, ...currentChallenge.distractors].sort(() => Math.random() - 0.5)
        return (
          <div className="find-challenge">
            <div className="find-progress" role="status" aria-label={`Found ${foundItems.size} of ${currentChallenge.requiredCorrect}`}>
              Found: {foundItems.size} / {currentChallenge.requiredCorrect}
            </div>
            <div className="find-grid" role="grid" aria-label="Tap the target items">
              {allItems.map((item) => {
                const isFound = foundItems.has(item)
                const isTarget = currentChallenge.targets.includes(item)
                return (
                  <button
                    key={item}
                    className={`find-item ${isFound ? 'found' : ''}`}
                    onClick={() => handleFindTap(item, isTarget)}
                    disabled={isFound}
                    role="gridcell"
                    aria-pressed={isFound}
                    style={{ minHeight: '80px', minWidth: '80px' }} // Large touch target for kids
                  >
                    <span className="item-emoji">
                      {item === 'Apple' ? '🍎' :
                       item === 'Ant' ? '🐜' :
                       item === 'Astronaut' ? '👨‍🚀' :
                       item === 'Butterfly' ? '🦋' :
                       item === 'Bear' ? '🐻' :
                       item === 'Ball' ? '⚽' :
                       item === 'Cat' ? '🐱' :
                       item === 'Dog' ? '🐕' : '🎯'}
                    </span>
                    <span className="item-label">{item}</span>
                  </button>
                )
              })}
            </div>
            {showHint && (
              <div className="hint" role="alert">
                💡 Hint: Look for items that start with "{lesson.title.match(/Letter (.)/)?.[1] || 'A'}"
              </div>
            )}
          </div>
        )
        
      case CHALLENGE_TYPES.TRACE:
        return (
          <div className="trace-challenge">
            <div className="trace-progress" role="status" aria-label={`Completed ${traceCount} of ${currentChallenge.requiredTraces} traces`}>
              Traces: {traceCount} / {currentChallenge.requiredTraces}
            </div>
            <div className="letter-display">
              <span className="trace-letter">{currentChallenge.letter}</span>
            </div>
            <button 
              className="trace-btn"
              onClick={handleTraceComplete}
              style={{ minHeight: '120px', minWidth: '200px', fontSize: '1.5rem' }}
            >
              ✋ Trace Here
            </button>
            <p className="trace-instruction">
              Start at the top and follow the letter shape with your finger
            </p>
          </div>
        )
        
      case CHALLENGE_TYPES.QUIZ:
        return (
          <div className="quiz-challenge">
            {needsReview ? (
              <div className="review-needed">
                <h3>Let's Practice More!</h3>
                <p>You got {quizAnswers.filter(a => a?.correct).length} out of {currentChallenge.questions.length}.</p>
                <p>Let's go back and practice again!</p>
                <button 
                  className="review-btn"
                  onClick={handleReview}
                  style={{ minHeight: '60px', minWidth: '200px', fontSize: '1.25rem' }}
                >
                  Practice Again 🔄
                </button>
              </div>
            ) : (
              <div className="quiz-questions">
                {currentChallenge.questions.map((q, qIndex) => {
                  const answered = quizAnswers[qIndex]
                  return (
                    <div key={qIndex} className={`quiz-question ${answered ? 'answered' : ''}`}>
                      <p className="question-text">{q.question}</p>
                      <div className="quiz-options" role="radiogroup" aria-label={q.question}>
                        {q.options.map((option, oIndex) => (
                          <button
                            key={oIndex}
                            className={`quiz-option ${answered?.answerIndex === oIndex ? (answered?.correct ? 'correct' : 'incorrect') : ''}`}
                            onClick={() => !answered && handleQuizAnswer(qIndex, oIndex)}
                            disabled={answered !== undefined}
                            role="radio"
                            aria-checked={answered?.answerIndex === oIndex}
                            style={{ minHeight: '80px', fontSize: '1.25rem' }}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
        
      default:
        return <div>Unknown challenge type</div>
    }
  }
  
  return (
    <div className="lesson-view" role="article" aria-label={`Lesson: ${lesson.title}`}>
      <div className="lesson-header">
        <button 
          className="exit-btn" 
          onClick={onExit}
          aria-label="Exit lesson"
          style={{ minHeight: '44px', minWidth: '80px' }}
        >
          ← Exit
        </button>
        <h2>{lesson.title}</h2>
        <div className="progress-bar" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="challenge-indicator" aria-label={`Challenge ${currentChallengeIndex + 1} of ${challenges.length}`}>
          Challenge {currentChallengeIndex + 1} of {challenges.length}: {currentChallenge.title}
        </div>
      </div>

      <div className="challenge-container" role="region" aria-label="Challenge area">
        {showFeedback ? (
          <div 
            className={`feedback ${feedbackType}`}
            role="alert"
            aria-live="polite"
          >
            {feedbackType === 'correct' && '🎉 Great job!'}
            {feedbackType === 'incorrect' && '💪 Keep trying!'}
            {feedbackType === 'hint' && '💡 Here\'s a hint!'}
          </div>
        ) : (
          <>
            <div className="challenge-type" aria-label={`Challenge type: ${currentChallenge.type}`}>
              {currentChallenge.type}
            </div>
            <h3 className="question">{currentChallenge.instruction}</h3>
            {renderChallenge()}
          </>
        )}
      </div>

      <div className="lesson-footer">
        <span>Quest {lesson.sequence} of {lessonPlan.structure.lessonCount}</span>
        <span className="score" aria-label={`Current score: ${score}`}>
          Score: {score}/{challenges.length}
        </span>
      </div>
    </div>
  )
}

export default LessonView
