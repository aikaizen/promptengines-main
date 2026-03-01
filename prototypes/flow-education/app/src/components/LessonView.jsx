import { useState, useEffect } from 'react'

function LessonView({ lesson, onComplete, onExit }) {
  const [currentChallenge, setCurrentChallenge] = useState(0)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState([])
  const [showFeedback, setShowFeedback] = useState(false)

  // Simulated challenges for the lesson
  const challenges = [
    { type: 'listen', question: 'What sound does A make?', options: ['/æ/', '/eɪ/', '/ɑː/'], correct: 0 },
    { type: 'identify', question: 'Tap the letter A', options: ['A', 'B', 'C'], correct: 0 },
    { type: 'trace', question: 'Trace the letter A', template: 'A' },
    { type: 'quiz', question: 'Which word starts with A?', options: ['Apple', 'Banana', 'Car'], correct: 0 }
  ]

  const handleAnswer = (answerIndex) => {
    const isCorrect = answerIndex === challenges[currentChallenge].correct
    setAnswers([...answers, { challenge: currentChallenge, correct: isCorrect }])
    
    if (isCorrect) {
      setScore(score + 1)
    }
    
    setShowFeedback(true)
    
    setTimeout(() => {
      setShowFeedback(false)
      if (currentChallenge < challenges.length - 1) {
        setCurrentChallenge(currentChallenge + 1)
      } else {
        onComplete(lesson.lessonId, score + (isCorrect ? 1 : 0))
      }
    }, 1500)
  }

  const progress = ((currentChallenge + 1) / challenges.length) * 100

  return (
    <div className="lesson-view">
      <div className="lesson-header">
        <button className="exit-btn" onClick={onExit}>← Exit</button>
        <h2>{lesson.title}</h2>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="challenge-container">
        {showFeedback ? (
          <div className={`feedback ${answers[answers.length - 1]?.correct ? 'correct' : 'incorrect'}`}>
            {answers[answers.length - 1]?.correct ? '🎉 Great job!' : '💪 Try again next time!'}
          </div>
        ) : (
          <>
            <div className="challenge-type">{challenges[currentChallenge].type}</div>
            <h3 className="question">{challenges[currentChallenge].question}</h3>
            
            {challenges[currentChallenge].options && (
              <div className="options-grid">
                {challenges[currentChallenge].options.map((option, index) => (
                  <button 
                    key={index}
                    className="option-btn"
                    onClick={() => handleAnswer(index)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {challenges[currentChallenge].template && (
              <div className="trace-area">
                <div className="letter-template">{challenges[currentChallenge].template}</div>
                <p className="trace-hint">Use your finger to trace the letter</p>
              </div>
            )}
          </>
        )}
      </div>

      <div className="lesson-footer">
        <span>Challenge {currentChallenge + 1} of {challenges.length}</span>
        <span className="score">Score: {score}/{challenges.length}</span>
      </div>
    </div>
  )
}

export default LessonView
