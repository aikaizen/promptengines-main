import { useState } from 'react'
import LessonPlanList from './components/LessonPlanList'
import LessonView from './components/LessonView'
import ProgressTracker from './components/ProgressTracker'
import './styles/App.css'

// Import lesson plan data
import lessonPlan001 from '../data/lessonPlan001.json'

function App() {
  const [currentView, setCurrentView] = useState('home') // home, lesson, progress
  const [activeLesson, setActiveLesson] = useState(null)
  const [studentProgress, setStudentProgress] = useState({
    completedLessons: [],
    currentLesson: null,
    masteryScores: {}
  })

  const handleStartLesson = (lesson) => {
    setActiveLesson(lesson)
    setCurrentView('lesson')
  }

  const handleCompleteLesson = (lessonId, score) => {
    setStudentProgress(prev => ({
      ...prev,
      completedLessons: [...prev.completedLessons, lessonId],
      masteryScores: { ...prev.masteryScores, [lessonId]: score }
    }))
    setCurrentView('home')
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <span className="brand-name">Flow Education</span>
          <span className="brand-tagline">Kaizen Learning</span>
        </div>
        <nav className="nav">
          <button 
            className={currentView === 'home' ? 'active' : ''}
            onClick={() => setCurrentView('home')}
          >
            Lessons
          </button>
          <button 
            className={currentView === 'progress' ? 'active' : ''}
            onClick={() => setCurrentView('progress')}
          >
            Progress
          </button>
        </nav>
      </header>

      <main className="app-main">
        {currentView === 'home' && (
          <LessonPlanList 
            lessonPlan={lessonPlan001}
            progress={studentProgress}
            onStartLesson={handleStartLesson}
          />
        )}
        
        {currentView === 'lesson' && activeLesson && (
          <LessonView 
            lesson={activeLesson}
            onComplete={handleCompleteLesson}
            onExit={() => setCurrentView('home')}
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
      </footer>
    </div>
  )
}

export default App
