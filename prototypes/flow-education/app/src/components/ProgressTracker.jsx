import { useMemo } from 'react'

function ProgressTracker({ lessonPlan, progress }) {
  const { structure, metadata } = lessonPlan
  
  // Calculate stats
  const completedCount = progress.completedLessons.length
  const totalLessons = structure.lessonCount
  const percentComplete = Math.round((completedCount / totalLessons) * 100)
  
  const avgScore = useMemo(() => {
    const scores = Object.values(progress.masteryScores)
    if (scores.length === 0) return 0
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  }, [progress.masteryScores])
  
  const totalTimeSpent = progress.totalTimeSpent || 0
  const timeInMinutes = Math.round(totalTimeSpent / 60000)
  
  // Get mastered skills
  const masteredSkills = useMemo(() => {
    return structure.lessons
      .filter(lesson => progress.completedLessons.includes(lesson.lessonId))
      .flatMap(lesson => lesson.skillsTargeted || [])
      .filter((skill, index, self) => self.indexOf(skill) === index)
  }, [structure.lessons, progress.completedLessons])
  
  // Get recent achievements
  const recentAchievements = useMemo(() => {
    const achievements = []
    
    if (completedCount >= 1) {
      achievements.push({ icon: '🌟', title: 'First Steps', desc: 'Completed your first lesson' })
    }
    if (completedCount >= 3) {
      achievements.push({ icon: '🚀', title: 'Halfway There', desc: 'Completed 3 lessons' })
    }
    if (completedCount === totalLessons) {
      achievements.push({ icon: '🏆', title: 'Lesson Plan Master', desc: 'Completed all lessons' })
    }
    if (avgScore >= 80) {
      achievements.push({ icon: '⭐', title: 'High Achiever', desc: 'Average score above 80%' })
    }
    if (timeInMinutes >= 30) {
      achievements.push({ icon: '⏱️', title: 'Dedicated Learner', desc: 'Spent 30+ minutes learning' })
    }
    
    return achievements
  }, [completedCount, totalLessons, avgScore, timeInMinutes])

  return (
    <div className="progress-tracker">
      <h1>Your Learning Journey</h1>
      
      {/* Main Progress Circle */}
      <div className="progress-overview">
        <div className="progress-circle-container">
          <div className="progress-circle" style={{ 
            background: `conic-gradient(var(--accent) ${percentComplete * 3.6}deg, var(--border) 0deg)`
          }}>
            <div className="progress-circle-inner">
              <span className="progress-percent">{percentComplete}%</span>
              <span className="progress-label">Complete</span>
            </div>
          </div>
        </div>
        
        <div className="progress-stats">
          <div className="stat-card">
            <span className="stat-value">{completedCount}</span>
            <span className="stat-label">Lessons Done</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{totalLessons - completedCount}</span>
            <span className="stat-label">Lessons Left</span>
          </div>
          <div className="stat-card highlight">
            <span className="stat-value">{avgScore}%</span>
            <span className="stat-label">Avg Score</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{timeInMinutes}m</span>
            <span className="stat-label">Time Spent</span>
          </div>
        </div>
      </div>

      {/* Achievements */}
      {recentAchievements.length > 0 && (
        <div className="achievements-section">
          <h2>🏅 Achievements</h2>
          <div className="achievements-grid">
            {recentAchievements.map((achievement, index) => (
              <div key={index} className="achievement-card">
                <span className="achievement-icon">{achievement.icon}</span>
                <h3>{achievement.title}</h3>
                <p>{achievement.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills Mastered */}
      {masteredSkills.length > 0 && (
        <div className="mastery-section">
          <h2>🎯 Skills Mastered</h2>
          <div className="skills-grid">
            {masteredSkills.map((skill, index) => (
              <div key={index} className="skill-badge">
                <span className="skill-icon">✓</span>
                <span className="skill-name">{skill.replace(/-/g, ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lesson Breakdown */}
      <div className="lessons-breakdown">
        <h2>📊 Lesson Progress</h2>
        <div className="breakdown-list">
          {structure.lessons.map((lesson) => {
            const isCompleted = progress.completedLessons.includes(lesson.lessonId)
            const score = progress.masteryScores[lesson.lessonId]
            
            return (
              <div 
                key={lesson.lessonId} 
                className={`breakdown-item ${isCompleted ? 'completed' : 'pending'}`}
              >
                <div className="breakdown-status">
                  {isCompleted ? '✓' : '○'}
                </div>
                <div className="breakdown-info">
                  <span className="breakdown-title">{lesson.title}</span>
                  <span className="breakdown-meta">
                    {lesson.duration}
                    {isCompleted && score !== undefined && ` • Score: ${score}%`}
                  </span>
                </div>
                {isCompleted && (
                  <div className="breakdown-bar">
                    <div 
                      className="breakdown-fill" 
                      style={{ width: `${score || 0}%` }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Kaizen Quote */}
      <div className="kaizen-section">
        <blockquote className="kaizen-quote-large">
          "Success is the sum of small efforts, repeated day in and day out."
        </blockquote>
        <cite>— Robert Collier (Kaizen Philosophy)</cite>
        
        <div className="kaizen-principles">
          <div className="principle">
            <span className="principle-icon">📈</span>
            <h4>Continuous Improvement</h4>
            <p>Every session makes you better</p>
          </div>
          <div className="principle">
            <span className="principle-icon">🎯</span>
            <h4>Mastery Focus</h4>
            <p>Understanding before moving on</p>
          </div>
          <div className="principle">
            <span className="principle-icon">💪</span>
            <h4>Growth Mindset</h4>
            <p>Challenges help you grow</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProgressTracker
