// progress-tracker.js
// Simple progress tracking for Phase 0 MVP
// Stores session data locally (AsyncStorage for React Native)

class ProgressTracker {
  constructor(storage) {
    this.storage = storage; // AsyncStorage or localStorage
    this.studentId = null;
    this.currentSession = null;
  }

  /**
   * Initialize tracker for a student
   */
  async init(studentId) {
    this.studentId = studentId;
    
    // Load existing progress
    const stored = await this.loadProgress();
    
    if (!stored) {
      // First time - create new record
      await this.saveProgress({
        studentId,
        startedAt: new Date().toISOString(),
        totalSessions: 0,
        totalTimeMinutes: 0,
        completedQuests: [],
        skillMastery: {},
        streakDays: 0,
        lastSessionDate: null
      });
    }
    
    return this;
  }

  /**
   * Start a new session
   */
  async startSession() {
    this.currentSession = {
      id: `session-${Date.now()}`,
      startTime: Date.now(),
      questId: null,
      challengesCompleted: [],
      errors: 0,
      successes: 0,
      hintsUsed: 0
    };
    
    return this.currentSession;
  }

  /**
   * Record quest start
   */
  async startQuest(questId) {
    if (!this.currentSession) {
      await this.startSession();
    }
    
    this.currentSession.questId = questId;
    this.currentSession.questStartTime = Date.now();
    
    // Update progress
    const progress = await this.loadProgress();
    progress.currentQuest = questId;
    await this.saveProgress(progress);
  }

  /**
   * Record challenge completion
   */
  async completeChallenge(challengeId, success, skill, timeMs) {
    if (!this.currentSession) return;
    
    this.currentSession.challengesCompleted.push({
      challengeId,
      success,
      skill,
      timeMs,
      timestamp: Date.now()
    });
    
    if (success) {
      this.currentSession.successes++;
    } else {
      this.currentSession.errors++;
    }
  }

  /**
   * Record hint usage
   */
  async useHint() {
    if (this.currentSession) {
      this.currentSession.hintsUsed++;
    }
  }

  /**
   * Complete current quest
   */
  async completeQuest(questId, score) {
    if (!this.currentSession) return;
    
    this.currentSession.questCompleteTime = Date.now();
    this.currentSession.questScore = score;
    
    // Update student progress
    const progress = await this.loadProgress();
    
    if (!progress.completedQuests.includes(questId)) {
      progress.completedQuests.push(questId);
    }
    
    // Update mastery for skills used
    for (const challenge of this.currentSession.challengesCompleted) {
      if (challenge.skill) {
        if (!progress.skillMastery[challenge.skill]) {
          progress.skillMastery[challenge.skill] = {
            attempts: 0,
            successes: 0,
            lastPracticed: null
          };
        }
        
        progress.skillMastery[challenge.skill].attempts++;
        if (challenge.success) {
          progress.skillMastery[challenge.skill].successes++;
        }
        progress.skillMastery[challenge.skill].lastPracticed = new Date().toISOString();
      }
    }
    
    await this.saveProgress(progress);
  }

  /**
   * End session and save summary
   */
  async endSession() {
    if (!this.currentSession) return;
    
    this.currentSession.endTime = Date.now();
    const duration = this.currentSession.endTime - this.currentSession.startTime;
    const durationMinutes = Math.floor(duration / 60000);
    
    // Update overall progress
    const progress = await this.loadProgress();
    progress.totalSessions++;
    progress.totalTimeMinutes += durationMinutes;
    progress.lastSessionDate = new Date().toISOString();
    
    // Check streak
    const lastSession = new Date(progress.lastSessionDate);
    const today = new Date();
    const daysSinceLastSession = Math.floor((today - lastSession) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastSession === 1) {
      progress.streakDays++;
    } else if (daysSinceLastSession > 1) {
      progress.streakDays = 1; // Reset streak
    }
    
    await this.saveProgress(progress);
    
    // Save session history
    await this.saveSessionHistory(this.currentSession);
    
    const summary = this.getSessionSummary();
    this.currentSession = null;
    
    return summary;
  }

  /**
   * Get session summary for display/reward
   */
  getSessionSummary() {
    if (!this.currentSession) return null;
    
    const duration = (this.currentSession.endTime || Date.now()) - this.currentSession.startTime;
    const challenges = this.currentSession.challengesCompleted;
    const successRate = challenges.length > 0
      ? (challenges.filter(c => c.success).length / challenges.length * 100).toFixed(0)
      : 0;
    
    return {
      durationMinutes: Math.floor(duration / 60000),
      challengesCompleted: challenges.length,
      successRate: `${successRate}%`,
      hintsUsed: this.currentSession.hintsUsed,
      questCompleted: !!this.currentSession.questCompleteTime
    };
  }

  /**
   * Get overall student stats
   */
  async getStats() {
    const progress = await this.loadProgress();
    
    if (!progress) return null;
    
    // Calculate mastery levels
    const masteredSkills = Object.entries(progress.skillMastery || {})
      .filter(([_, data]) => {
        const rate = data.successes / data.attempts;
        return data.attempts >= 5 && rate >= 0.8;
      })
      .map(([skill]) => skill);
    
    // Calculate learning velocity (quests per week)
    const questsPerWeek = progress.totalSessions > 0 && progress.totalTimeMinutes > 0
      ? (progress.completedQuests.length / (progress.totalTimeMinutes / 60 / 24 / 7)).toFixed(1)
      : 0;
    
    return {
      totalSessions: progress.totalSessions,
      totalTimeHours: (progress.totalTimeMinutes / 60).toFixed(1),
      completedQuests: progress.completedQuests.length,
      streakDays: progress.streakDays,
      masteredSkills: masteredSkills.length,
      totalSkillsAttempted: Object.keys(progress.skillMastery || {}).length,
      learningVelocity: `${questsPerWeek} quests/week`,
      lastSession: progress.lastSessionDate
        ? new Date(progress.lastSessionDate).toLocaleDateString()
        : 'Never'
    };
  }

  /**
   * Get recommended next quest
   */
  async getNextRecommendation() {
    const progress = await this.loadProgress();
    
    // Define quest sequence
    const questSequence = [
      'quest-001-letter-a',
      'quest-002-letter-b',
      'quest-003-letter-c',
      'quest-004-letter-d',
      'quest-005-letter-e',
      'quest-006-number-1',
      'quest-007-number-2',
      'quest-008-number-3',
      'quest-009-shapes',
      'quest-010-colors'
    ];
    
    // Find first incomplete quest
    for (const questId of questSequence) {
      if (!progress.completedQuests.includes(questId)) {
        return {
          nextQuest: questId,
          reason: 'next_in_sequence',
          completedSoFar: progress.completedQuests.length,
          totalInSequence: questSequence.length
        };
      }
    }
    
    // All quests complete
    return {
      nextQuest: null,
      reason: 'all_complete',
      completedSoFar: progress.completedQuests.length,
      message: 'Amazing! You completed all the quests!'
    };
  }

  /**
   * Check if child needs review (struggling with a skill)
   */
  async needsReview(skill, threshold = 0.5) {
    const progress = await this.loadProgress();
    const skillData = progress.skillMastery?.[skill];
    
    if (!skillData || skillData.attempts < 3) {
      return false; // Not enough data
    }
    
    const successRate = skillData.successes / skillData.attempts;
    return successRate < threshold;
  }

  /**
   * Get skills needing review
   */
  async getSkillsNeedingReview(threshold = 0.5) {
    const progress = await this.loadProgress();
    const skillsNeedingReview = [];
    
    for (const [skill, data] of Object.entries(progress.skillMastery || {})) {
      if (data.attempts >= 3) {
        const rate = data.successes / data.attempts;
        if (rate < threshold) {
          skillsNeedingReview.push({
            skill,
            successRate: `${(rate * 100).toFixed(0)}%`,
            attempts: data.attempts,
            lastPracticed: data.lastPracticed
          });
        }
      }
    }
    
    return skillsNeedingReview.sort((a, b) => 
      parseFloat(a.successRate) - parseFloat(b.successRate)
    );
  }

  // Storage helpers
  async loadProgress() {
    try {
      const data = await this.storage.getItem(`progress-${this.studentId}`);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  async saveProgress(progress) {
    await this.storage.setItem(`progress-${this.studentId}`, JSON.stringify(progress));
  }

  async saveSessionHistory(session) {
    try {
      const key = `sessions-${this.studentId}`;
      const existing = await this.storage.getItem(key);
      const sessions = existing ? JSON.parse(existing) : [];
      sessions.push(session);
      
      // Keep only last 50 sessions to avoid storage bloat
      if (sessions.length > 50) {
        sessions.shift();
      }
      
      await this.storage.setItem(key, JSON.stringify(sessions));
    } catch (err) {
      console.error('Failed to save session history:', err);
    }
  }
}

// Example usage for React Native:
// import AsyncStorage from '@react-native-async-storage/async-storage';
// const tracker = new ProgressTracker(AsyncStorage);
// await tracker.init('student-001');

module.exports = { ProgressTracker };
