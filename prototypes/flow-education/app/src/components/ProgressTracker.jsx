function ProgressTracker({ lessonPlan, progress }) {
  const { structure } = lessonPlan
  const completedCount = progress.completedLessons.length
  const totalLessons = structure.lessonCount
  const percentComplete = Math.round((completedCount / totalLessons) * 100)

  return (
    <div className="progress-tracker">
      <h1>Your Learning Journey</h1>
      
      <div className="progress-overview">
        <div className="progress-circle">
          <div className="progress-percent">{percentComplete}%</div>
          <div className="progress-label">Complete</div>
        </div>
        
        <div className="progress-stats">
          <div className="stat">
            <span className="stat-value">{completedCount}</span>
            <span className="stat-label">Lessons Done</span>
          </div>
          <div className="stat">
            <span className="stat-value">{totalLessons - completedCount}</span>
            <span className="stat-label">Lessons Left</span>
          </div>
          <div className="stat">
            <span className="stat-value">
              {Object.values(progress.masteryScores).reduce((a, b) => a + b, 0) / (completedCount || 1)}
            </span>
            <span className="stat-label">Avg Score</span>
          </div>
        </div>
      </div>

      <div className="mastery-section">
        <h2>Skills Mastered</h2>
        <div className="skills-grid">
          {structure.lessons
            .filter(lesson => progress.completedLessons.includes(lesson.lessonId))
            .flatMap(lesson => lesson.skillsTargeted)
            .filter((skill, index, self) => self.indexOf(skill) === index)
            .map(skill => (
              <div key={skill} className="skill-badge">
                ✓ {skill.replace(/-/g, ' ')}
              </div>
            ))}
        </div>
      </div>

      <div className="kaizen-quote">
        <blockquote>
          "Improvement is not a destination, but a continuous journey."
        </blockquote>
        <cite>— Kaizen Philosophy</cite>
      </div>
    </div>
  )
}

export default ProgressTracker
