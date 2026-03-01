import { useMemo } from 'react'

function LessonPlanList({ lessonPlan, progress, onStartLesson, onResetProgress }) {
  const { metadata, structure } = lessonPlan

  // Calculate overall progress
  const percentComplete = useMemo(() => {
    return Math.round((progress.completedLessons.length / structure.lessonCount) * 100)
  }, [progress.completedLessons, structure.lessonCount])

  // Format time spent
  const formatTime = (ms) => {
    if (!ms) return '0'
    const minutes = Math.round(ms / 60000)
    return minutes < 60 ? `${minutes}` : `${Math.floor(minutes / 60)}`
  }

  // Get lesson emoji/icon based on content
  const getLessonIcon = (lesson) => {
    if (lesson.isNumberLesson) return '🔢'
    const letter = lesson.title.match(/Letter (.)/)?.[1]
    const icons = {
      'A': '🍎', 'B': '🐻', 'C': '🐱', 'D': '🦕', 'E': '🐘'
    }
    return icons[letter] || '📚'
  }

  // Get status icon
  const getStatusIcon = (isCompleted, isLocked, isCurrent) => {
    if (isCompleted) return '✅'
    if (isLocked) return '🔒'
    if (isCurrent) return '▶️'
    return '🎯'
  }

  return (
    <div className="lesson-plan-list kid-friendly">
      {/* Kid-friendly header - minimal text, big visuals */}
      <div className="kid-header">
        <div className="kid-title-row">
          <span className="kid-icon-large">🎒</span>
          <h1 className="kid-title">Your Lessons</h1>
        </div>
        
        {/* Visual progress - no text labels */}
        <div className="kid-progress-container" role="img" aria-label={`${percentComplete} percent complete`}>
          <div className="kid-progress-bar">
            <div 
              className="kid-progress-fill" 
              style={{ width: `${percentComplete}%` }}
            />
          </div>
          <div className="kid-progress-stars">
            {[...Array(6)].map((_, i) => (
              <span 
                key={i} 
                className={`kid-star ${i < progress.completedLessons.length ? 'earned' : ''}`}
                aria-hidden="true"
              >
                {i < progress.completedLessons.length ? '⭐' : '◯'}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Kid-friendly lesson grid */}
      <div className="kid-lessons-grid" role="list" aria-label="Lessons">
        {structure.lessons.map((lesson, index) => {
          const isCompleted = progress.completedLessons.includes(lesson.lessonId)
          const prevLesson = index > 0 ? structure.lessons[index - 1] : null
          const isLocked = prevLesson && !progress.completedLessons.includes(prevLesson.lessonId)
          const isCurrent = progress.currentLesson === lesson.lessonId
          
          return (
            <div 
              key={lesson.lessonId}
              className={`kid-lesson-card ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''} ${isCurrent ? 'current' : ''}`}
              role="listitem"
            >
              {/* Big visual icon - no text needed to understand */}
              <div className="kid-lesson-icon">
                <span className="kid-emoji-large" aria-hidden="true">
                  {getLessonIcon(lesson)}
                </span>
                <span className="kid-lesson-letter" aria-label={`Lesson ${lesson.sequence}`}>
                  {lesson.isNumberLesson ? '1' : lesson.title.match(/Letter (.)/)?.[1]}
                </span>
              </div>
              
              {/* Status indicator - visual only */}
              <div className="kid-status-badge">
                <span className="kid-status-icon" aria-hidden="true">
                  {getStatusIcon(isCompleted, isLocked, isCurrent)}
                </span>
              </div>
              
              {/* Big touch-friendly button - minimal text */}
              <button 
                className={`kid-start-btn ${isLocked ? 'locked' : ''}`}
                onClick={() => !isLocked && onStartLesson(lesson)}
                disabled={isLocked}
                aria-label={isCompleted ? 'Play again' : isLocked ? 'Locked' : 'Start'}
              >
                <span className="kid-btn-icon" aria-hidden="true">
                  {isCompleted ? '↻' : isLocked ? '🔒' : '▶'}
                </span>
                <span className="kid-btn-text">
                  {isCompleted ? 'Again!' : isLocked ? '' : 'Go!'}
                </span>
              </button>
            </div>
          )
        })}
      </div>

      {/* Optional: Teacher info (small, at bottom) */}
      {progress.completedLessons.length > 0 && (
        <div className="teacher-info">
          <button 
            className="teacher-reset-btn"
            onClick={onResetProgress}
            title="Reset all progress"
          >
            🔄 Reset Progress
          </button>
          <div className="teacher-stats">
            <span>Time: {formatTime(progress.totalTimeSpent)}m</span>
            <span> • </span>
            <span>Done: {progress.completedLessons.length}/{structure.lessonCount}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default LessonPlanList
