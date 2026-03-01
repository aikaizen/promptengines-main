import { useMemo } from 'react'

function LessonPlanList({ lessonPlan, progress, onStartLesson, onResetProgress }) {
  const { metadata, structure, targetStudent } = lessonPlan

  // Calculate overall progress
  const percentComplete = useMemo(() => {
    return Math.round((progress.completedLessons.length / structure.lessonCount) * 100)
  }, [progress.completedLessons, structure.lessonCount])

  // Format time spent
  const formatTime = (ms) => {
    if (!ms) return '0 min'
    const minutes = Math.round(ms / 60000)
    return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`
  }

  return (
    <div className="lesson-plan-list">
      <div className="lesson-plan-header">
        <div className="header-top">
          <h1>{metadata.title}</h1>
          {progress.completedLessons.length > 0 && (
            <button 
              className="reset-btn"
              onClick={onResetProgress}
              title="Reset all progress"
              aria-label="Reset progress"
              style={{ minHeight: '44px' }}
            >
              🔄 Reset
            </button>
          )}
        </div>
        <p className="description">{metadata.description}</p>
        
        <div className="meta-tags">
          <span className="tag age">{targetStudent.ageRange}</span>
          <span className="tag grade">{targetStudent.gradeLevel}</span>
          <span className="tag duration">{structure.totalDuration}</span>
        </div>

        {/* Progress Overview */}
        <div className="overview-stats">
          <div className="stat-box">
            <span className="stat-number">{progress.completedLessons.length}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat-box">
            <span className="stat-number">{structure.lessonCount - progress.completedLessons.length}</span>
            <span className="stat-label">Remaining</span>
          </div>
          <div className="stat-box">
            <span className="stat-number">{percentComplete}%</span>
            <span className="stat-label">Progress</span>
          </div>
          <div className="stat-box">
            <span className="stat-number">{formatTime(progress.totalTimeSpent)}</span>
            <span className="stat-label">Time Spent</span>
          </div>
        </div>
      </div>

      <div className="lessons-section">
        <h2 className="section-title">Your Learning Path</h2>
        <div className="lessons-grid" role="list" aria-label="Lessons">
          {structure.lessons.map((lesson, index) => {
            const isCompleted = progress.completedLessons.includes(lesson.lessonId)
            const prevLesson = index > 0 ? structure.lessons[index - 1] : null
            const isLocked = prevLesson && !progress.completedLessons.includes(prevLesson.lessonId)
            const isCurrent = progress.currentLesson === lesson.lessonId
            const masteryScore = progress.masteryScores[lesson.lessonId]
            
            return (
              <div 
                key={lesson.lessonId}
                className={`lesson-card ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''} ${isCurrent ? 'current' : ''}`}
                role="listitem"
              >
                <div className="lesson-badge">
                  <div className="lesson-number" aria-hidden="true">
                    {isCompleted ? '✓' : isLocked ? '🔒' : lesson.sequence}
                  </div>
                  {masteryScore !== undefined && (
                    <div className="mastery-stars" aria-label={`Mastery: ${masteryScore}%`}>
                      {masteryScore >= 80 ? '⭐⭐⭐' : masteryScore >= 50 ? '⭐⭐' : '⭐'}
                    </div>
                  )}
                </div>
                
                <div className="lesson-content">
                  <h3>{lesson.title}</h3>
                  <p className="duration">⏱ {lesson.duration}</p>
                  <div className="objectives">
                    {lesson.learningObjectives.slice(0, 2).map((obj, i) => (
                      <span key={i} className="objective" title={obj}>
                        {obj.length > 40 ? obj.substring(0, 40) + '...' : obj}
                      </span>
                    ))}
                  </div>
                  {lesson.specialNotes && (
                    <p className="special-note">💡 {lesson.specialNotes}</p>
                  )}
                </div>
                
                <div className="lesson-actions">
                  <button 
                    className="start-btn"
                    onClick={() => !isLocked && onStartLesson(lesson)}
                    disabled={isLocked}
                    aria-label={isCompleted ? 'Replay lesson' : isLocked ? 'Complete previous lesson to unlock' : 'Start lesson'}
                    style={{ minHeight: '60px', minWidth: '120px' }}
                  >
                    {isCompleted ? 'Replay ↻' : isLocked ? 'Locked 🔒' : 'Start ▶'}
                  </button>
                  {isCompleted && (
                    <span className="completion-badge" aria-label="Lesson completed">
                      Done!
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Kaizen Philosophy Footer */}
      <div className="kaizen-footer">
        <blockquote>
          "Every mistake is a step forward. Every success builds confidence."
        </blockquote>
        <cite>— The Kaizen Way</cite>
      </div>
    </div>
  )
}

export default LessonPlanList
