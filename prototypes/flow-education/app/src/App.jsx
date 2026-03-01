import { useState, useEffect, useCallback } from 'react'
import LessonPlanList from './components/LessonPlanList'
import LessonView from './components/LessonView'
import ProgressTracker from './components/ProgressTracker'
import './styles/App.css'

// Import lesson plan data
import lessonPlan001 from '../data/lessonPlan001.json'

// Progress storage key
const STORAGE_KEY = 'flow-education-progress'

function App() {
  const [currentView, setCurrentView] = useState('home') // home, lesson, progress
  const [activeLesson, setActiveLesson] = useState(null)
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

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <span className="brand-name">Flow Education</span>
          <span className="brand-tagline">Kaizen Learning</span>
        </div>
        <nav className="nav" role="navigation" aria-label="Main navigation">
          <button 
            className={currentView === 'home' ? 'active' : ''}
            onClick={() => setCurrentView('home')}
            aria-pressed={currentView === 'home'}
          >
            Lessons
          </button>
          <button 
            className={currentView === 'progress' ? 'active' : ''}
            onClick={() => setCurrentView('progress')}
            aria-pressed={currentView === 'progress'}
          >
            Progress
          </button>
        </nav>
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
          <LessonView 
            lesson={activeLesson}
            lessonPlan={lessonPlan001}
            onComplete={handleCompleteLesson}
            onExit={handleExitLesson}
          />
        )}
        
        {currentView === 'progress' && (
          <ProgressTracker 
            lessonPlan={lessonPlan001}
            progress={studentProgress}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>Flow Education — A PromptEngines Experiment</p>
        <p className="kaizen-tagline">改善 — Continuous Improvement</p>
      </footer>
    </div>
  )
}

export default App
