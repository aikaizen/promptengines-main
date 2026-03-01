function LessonPlanList({ lessonPlan, progress, onStartLesson }) {
  const { metadata, structure, targetStudent } = lessonPlan

  return (
    <div className="lesson-plan-list">
      <div className="lesson-plan-header">
        <h1>{metadata.title}</h1>
        <p className="description">{metadata.description}</p>
        
        <div className="meta-tags">
          <span className="tag">{targetStudent.ageRange}</span>
          <span className="tag">{targetStudent.gradeLevel}</span>
          <span className="tag">{structure.totalDuration}</span>
        </div>
      </div>

      <div className="lessons-grid">
        {structure.lessons.map((lesson, index) => {
          const isCompleted = progress.completedLessons.includes(lesson.lessonId)
          const isLocked = index > 0 && !progress.completedLessons.includes(structure.lessons[index - 1]?.lessonId)
          
          return (
            <div 
              key={lesson.lessonId}
              className={`lesson-card ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}
            >
              <div className="lesson-number">{lesson.sequence}</div>
              <div className="lesson-content">
                <h3>{lesson.title}</h3>
                <p className="duration">{lesson.duration}</p>
                <div className="objectives">
                  {lesson.learningObjectives.slice(0, 2).map((obj, i) => (
                    <span key={i} className="objective">{obj}</span>
                  ))}
                </div>
              </div>
              <button 
                className="start-btn"
                onClick={() => !isLocked && onStartLesson(lesson)}
                disabled={isLocked}
              >
                {isCompleted ? '✓ Done' : isLocked ? '🔒 Locked' : 'Start'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default LessonPlanList
