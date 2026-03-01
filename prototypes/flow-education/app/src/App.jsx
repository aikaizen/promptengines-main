import { useState, useEffect, useCallback } from 'react'
import LessonPlanList from './components/LessonPlanList'
import LessonView from './components/LessonView'
import SimpleLessonView from './components/SimpleLessonView'
import ProgressTracker from './components/ProgressTracker'
import { useSafeTabletTouch, usePreventZoomSafe } from './hooks/useSafeTabletTouch.js'
import './styles/App.css'

// Import lesson plan data
import lessonPlan001 from './data/lessonPlan001.json'

// Progress storage keys
const STORAGE_KEY = 'flow-education-progress'
const MODE_KEY = 'flow-education-mode'

function App() {
  // Initialize safe tablet optimizations (iOS-compatible)
  const { isTouchDevice, orientation, hapticFeedback } = useSafeTabletTouch()
  usePreventZoomSafe()
  
  const [currentView, setCurrentView] = useState('home') // home, lesson, progress, mode-select
  const [activeLesson, setActiveLesson] = useState(null)
  const [ageMode, setAgeMode] = useState(() => {
    // Load mode preference safely
    try {
      const savedMode = localStorage.getItem(MODE_KEY)
      if (savedMode === '4yo' || savedMode === '5-6') {
        return savedMode
      }
    } catch (e) {
      console.error('Failed to load mode:', e)
    }
    return null // null = not selected yet
  })
  const [studentProgress, setStudentProgress] = useState(() => {
    // Load from localStorage on init
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error('Failed to load progress:', e)
      }
    }
    return {
      completedLessons: [],
      currentLesson: null,
      masteryScores: {},
      totalTimeSpent: 0,
      lastAccessed: null
    }
  })

  // Persist to localStorage whenever progress changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(studentProgress))
  }, [studentProgress])

  const handleStartLesson = useCallback((lesson) => {
    setActiveLesson(lesson)
    setStudentProgress(prev => ({
      ...prev,
      currentLesson: lesson.lessonId,
      lastAccessed: new Date().toISOString()
    }))
    setCurrentView('lesson')
  }, [])

  const handleCompleteLesson = useCallback((lessonId, score, timeSpent) => {
    setStudentProgress(prev => {
      const isCompleted = prev.completedLessons.includes(lessonId)
      return {
        ...prev,
        completedLessons: isCompleted 
          ? prev.completedLessons 
          : [...prev.completedLessons, lessonId],
        masteryScores: { 
          ...prev.masteryScores, 
          [lessonId]: Math.max(prev.masteryScores[lessonId] || 0, score)
        },
        totalTimeSpent: (prev.totalTimeSpent || 0) + (timeSpent || 0),
        currentLesson: null
      }
    })
    setCurrentView('home')
    setActiveLesson(null)
  }, [])

  const handleExitLesson = useCallback(() => {
    setCurrentView('home')
    setActiveLesson(null)
    setStudentProgress(prev => ({ ...prev, currentLesson: null }))
  }, [])

  const handleResetProgress = useCallback(() => {
    if (confirm('Are you sure you want to reset all progress?')) {
      const reset = {
        completedLessons: [],
        currentLesson: null,
        masteryScores: {},
        totalTimeSpent: 0,
        lastAccessed: null
      }
      setStudentProgress(reset)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reset))
    }
  }, [])

  const handleSelectMode = useCallback((mode) => {
    setAgeMode(mode)
    localStorage.setItem(MODE_KEY, mode)
    setCurrentView('home')
  }, [])

  const handleChangeMode = useCallback(() => {
    setCurrentView('mode-select')
  }, [])

  // Mode selector (shown on first launch or when changing modes)
  if (!ageMode || currentView === 'mode-select') {
    return (
      <div className="app mode-selector">
        <div className="mode-select-container">
          <div className="mode-select-title">Choose Your Adventure!</div>
          
          <div className="mode-options">
            <button 
              className="mode-option simple"
              onClick={() => handleSelectMode('4yo')}
            >
              <div className="mode-emoji">🧒</div>
              <div className="mode-label">I'm 4!</div>
              <div className="mode-desc">Super simple & fun</div>
              <div className="mode-features">
                <span>🎯</span>
                <span>🎉</span>
                <span>⭐</span>
              </div>
            </button>
            
            <button 
              className="mode-option normal"
              onClick={() => handleSelectMode('5-6')}
            >
              <div className="mode-emoji">🎒</div>
              <div className="mode-label">I'm 5 or 6!</div>
              <div className="mode-desc">More challenges</div>
              <div className="mode-features">
                <span>📚</span>
                <span>✏️</span>
                <span>🏆</span>
              </div>
            </button>
          </div>
          
          <div className="mode-hint">
            Parents: Tap and hold top-right corner for 3 seconds to change mode later
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <span className="brand-icon" aria-hidden="true">🎒</span>
          <span className="brand-name">Flow</span>
        </div>
        <nav className="nav kid-nav" role="navigation" aria-label="Main navigation">
          <button 
            className={`nav-btn ${currentView === 'home' ? 'active' : ''}`}
            onClick={() => setCurrentView('home')}
            aria-pressed={currentView === 'home'}
            title="Lessons"
          >
            <span className="nav-icon" aria-hidden="true">📚</span>
            <span className="nav-label">Learn</span>
          </button>
          <button 
            className={`nav-btn ${currentView === 'progress' ? 'active' : ''}`}
            onClick={() => setCurrentView('progress')}
            aria-pressed={currentView === 'progress'}
            title="Progress"
          >
            <span className="nav-icon" aria-hidden="true">🏆</span>
            <span className="nav-label">Stars</span>
          </button>
        </nav>
        
        {/* DEMO: Quick mode switcher */}
        <button
          onClick={() => setCurrentView('mode-select')}
          style={{
            background: ageMode === '4yo' ? '#22c55e' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            padding: '6px 12px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginLeft: '10px'
          }}
          title="Switch age mode"
        >
          {ageMode === '4yo' ? '🧒 4YO' : '🎒 5-6'}
        </button>
      </header>

      <main className="app-main" role="main">
        {currentView === 'home' && (
          <LessonPlanList 
            lessonPlan={lessonPlan001}
            progress={studentProgress}
            onStartLesson={handleStartLesson}
            onResetProgress={handleResetProgress}
          />
        )}
        
        {currentView === 'lesson' && activeLesson && (
          ageMode === '4yo' ? (
            <SimpleLessonView 
              lesson={activeLesson}
              lessonPlan={lessonPlan001}
              onComplete={handleCompleteLesson}
              onExit={handleExitLesson}
            />
          ) : (
            <LessonView 
              lesson={activeLesson}
              lessonPlan={lessonPlan001}
              onComplete={handleCompleteLesson}
              onExit={handleExitLesson}
            />
          )
        )}
        
        {currentView === 'progress' && (
          <ProgressTracker 
            lessonPlan={lessonPlan001}
            progress={studentProgress}
          />
        )}
      </main>

      <footer className="app-footer kid-footer">
        <span className="kid-footer-icon" aria-hidden="true">✨</span>
        <span className="kid-footer-text">Keep learning!</span>
      </footer>
    </div>
  )
}

export default App
