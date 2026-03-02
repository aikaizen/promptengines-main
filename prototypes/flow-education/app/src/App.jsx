import { useState, useEffect, useCallback } from 'react'
import LessonPlanList from './components/LessonPlanList'
import LessonView from './components/LessonView'
import SimpleLessonView from './components/SimpleLessonView'
import ProgressTracker from './components/ProgressTracker'
import { useSafeTabletTouch } from './hooks/useSafeTabletTouch.js'
import './styles/App.css'

// Import lesson plan data
import lessonPlan001 from './data/lessonPlan001.json'

// Progress storage keys
const STORAGE_KEY = 'flow-education-progress'
const MODE_KEY = 'flow-education-mode'

function App() {
  // Initialize safe tablet optimizations (iOS-compatible)
  const { isTouchDevice, orientation, hapticFeedback } = useSafeTabletTouch()
  
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
    // Load from localStorage on init safely
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        // Validate required fields
        if (parsed && typeof parsed === 'object') {
          return {
            completedLessons: parsed.completedLessons || [],
            currentLesson: parsed.currentLesson || null,
            masteryScores: parsed.masteryScores || {},
            totalTimeSpent: parsed.totalTimeSpent || 0,
            lastAccessed: parsed.lastAccessed || null
          }
        }
      }
    } catch (e) {
      console.error('Failed to load progress:', e)
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
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(studentProgress))
    } catch (e) {
      console.error('Failed to save progress:', e)
    }
  }, [studentProgress])
  
  // Debug: Log current state
  useEffect(() => {
    console.log('Flow Education State:', {
      ageMode,
      currentView,
      hasActiveLesson: !!activeLesson,
      progressLessons: studentProgress?.completedLessons?.length || 0
    })
  }, [ageMode, currentView, activeLesson, studentProgress])

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
    try {
      setAgeMode(mode)
      localStorage.setItem(MODE_KEY, mode)
      setCurrentView('home')
    } catch (e) {
      console.error('Failed to save mode:', e)
      // Still switch mode even if storage fails
      setAgeMode(mode)
      setCurrentView('home')
    }
  }, [])

  const handleChangeMode = useCallback(() => {
    setCurrentView('mode-select')
  }, [])

  // Mode selector (shown on first launch or when changing modes)
  const showModeSelector = !ageMode || currentView === 'mode-select'
  
  if (showModeSelector) {
    return (
      <div className="mode-selector-screen">
        <h1 className="mode-title">Pick Your Level!</h1>
        <div className="mode-buttons">
          <button
            className="mode-btn mode-btn-young"
            onClick={() => handleSelectMode('4yo')}
          >
            <span className="mode-emoji">🧒</span>
            <span className="mode-label">I'm 4!</span>
            <span className="mode-desc">Tap & play</span>
          </button>
          <button
            className="mode-btn mode-btn-older"
            onClick={() => handleSelectMode('5-6')}
          >
            <span className="mode-emoji">🎒</span>
            <span className="mode-label">I'm 5 or 6!</span>
            <span className="mode-desc">More challenges</span>
          </button>
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
