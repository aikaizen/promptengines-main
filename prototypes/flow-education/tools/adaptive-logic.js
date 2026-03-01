/**
 * adaptive-logic.js
 * 
 * Simple rule-based adaptive algorithm for Phase 0 MVP.
 * Adjusts difficulty based on student performance in real-time.
 * 
 * This is NOT machine learning. It's explicit rules that:
 * - Track error rates per skill
 * - Adjust challenge difficulty up/down
 * - Trigger review lessons when needed
 * - Never let a child get stuck
 */

class AdaptiveEngine {
  constructor(studentId) {
    this.studentId = studentId;
    this.session = {
      startTime: Date.now(),
      challengesCompleted: [],
      currentChallenge: null,
      errorCount: 0,
      successCount: 0,
      skillStates: new Map() // skill -> { errors, successes, level }
    };
    
    // Difficulty levels
    this.LEVELS = {
      EASIEST: 1,    // Extra scaffolding, more hints
      EASY: 2,       // Standard scaffolding
      NORMAL: 3,     // Default challenge
      HARD: 4,       // Faster pace, less scaffolding
      HARDEST: 5     // No hints, timed elements
    };
    
    // Thresholds for adaptation
    this.THRESHOLDS = {
      ERROR_BURST: 3,           // 3 errors in a row = drop difficulty
      SUCCESS_STREAK: 5,          // 5 correct = raise difficulty
      REVIEW_TRIGGER: 0.3,        // <30% success rate = review lesson
      MASTERY_THRESHOLD: 0.8,     // >80% success = challenge complete
      FRUSTRATION_TIME: 30000,    // 30 seconds stuck = offer hint/help
      MAX_CHALLENGE_TIME: 300000  // 5 minutes max per challenge
    };
  }

  /**
   * Initialize or load student skill state
   */
  getSkillState(skill) {
    if (!this.session.skillStates.has(skill)) {
      this.session.skillStates.set(skill, {
        errors: 0,
        successes: 0,
        currentLevel: this.LEVELS.NORMAL,
        consecutiveErrors: 0,
        consecutiveSuccesses: 0,
        lastAttempt: null
      });
    }
    return this.session.skillStates.get(skill);
  }

  /**
   * Record an attempt on a challenge
   */
  recordAttempt(skill, correct, timeMs, hintUsed = false) {
    const state = this.getSkillState(skill);
    state.lastAttempt = { correct, timeMs, hintUsed, timestamp: Date.now() };
    
    if (correct) {
      state.successes++;
      state.consecutiveSuccesses++;
      state.consecutiveErrors = 0;
      this.session.successCount++;
    } else {
      state.errors++;
      state.consecutiveErrors++;
      state.consecutiveSuccesses = 0;
      this.session.errorCount++;
    }
    
    return this.shouldAdapt(skill);
  }

  /**
   * Determine if adaptation is needed based on recent performance
   */
  shouldAdapt(skill) {
    const state = this.getSkillState(skill);
    const totalAttempts = state.errors + state.successes;
    const successRate = totalAttempts > 0 ? state.successes / totalAttempts : 0;
    
    const adaptations = [];
    
    // Error burst - child is struggling
    if (state.consecutiveErrors >= this.THRESHOLDS.ERROR_BURST) {
      adaptations.push({
        type: 'REDUCE_DIFFICULTY',
        reason: `${state.consecutiveErrors} consecutive errors`,
        action: 'DROP_ONE_LEVEL',
        message: 'Let me make this a bit easier for you.'
      });
    }
    
    // Success streak - child is ready for more challenge
    if (state.consecutiveSuccesses >= this.THRESHOLDS.SUCCESS_STREAK) {
      adaptations.push({
        type: 'INCREASE_DIFFICULTY',
        reason: `${state.consecutiveSuccesses} correct in a row`,
        action: 'RAISE_ONE_LEVEL',
        message: 'You're doing great! Let me give you a bigger challenge.'
      });
    }
    
    // Very low success rate - needs review or easier content
    if (totalAttempts >= 5 && successRate < this.THRESHOLDS.REVIEW_TRIGGER) {
      adaptations.push({
        type: 'REVIEW_NEEDED',
        reason: `${(successRate * 100).toFixed(0)}% success rate`,
        action: 'INSERT_REVIEW_LESSON',
        message: 'Let me show you that one more time.'
      });
    }
    
    // Mastery achieved - can move on
    if (totalAttempts >= 5 && successRate >= this.THRESHOLDS.MASTERY_THRESHOLD) {
      adaptations.push({
        type: 'MASTERY',
        reason: `${(successRate * 100).toFixed(0)}% success rate`,
        action: 'COMPLETE_CHALLENGE',
        message: 'You mastered this! Great job!'
      });
    }
    
    return adaptations;
  }

  /**
   * Get current difficulty level for a skill
   */
  getDifficulty(skill) {
    return this.getSkillState(skill).currentLevel;
  }

  /**
   * Adjust difficulty for a skill
   */
  setDifficulty(skill, level) {
    const state = this.getSkillState(skill);
    const oldLevel = state.currentLevel;
    state.currentLevel = Math.max(this.LEVELS.EASIEST, Math.min(this.LEVELS.HARDEST, level));
    return { old: oldLevel, new: state.currentLevel };
  }

  /**
   * Get next challenge recommendation
   */
  getNextChallenge(completedChallenges, availableChallenges) {
    // Filter out completed
    const remaining = availableChallenges.filter(c => 
      !completedChallenges.includes(c.id)
    );
    
    if (remaining.length === 0) {
      return { type: 'COMPLETE', message: 'All challenges complete!' };
    }
    
    // Find most appropriate based on current skill states
    // Prioritize: review needed > current skill > new skill
    for (const challenge of remaining) {
      const skill = challenge.targetSkill || challenge.id;
      const state = this.getSkillState(skill);
      const total = state.errors + state.successes;
      
      if (total > 0 && state.errors / total > 0.5) {
        // This skill needs more practice
        return {
          type: 'REVIEW',
          challenge: challenge,
          reason: 'Needs more practice on this skill'
        };
      }
    }
    
    // Default: next sequential challenge
    return {
      type: 'NEXT',
      challenge: remaining[0],
      reason: 'Continuing to next challenge'
    };
  }

  /**
   * Check if child might be frustrated (stuck for too long)
   */
  checkFrustration(challengeStartTime) {
    const elapsed = Date.now() - challengeStartTime;
    
    if (elapsed > this.THRESHOLDS.MAX_CHALLENGE_TIME) {
      return {
        frustrated: true,
        action: 'FORCE_HINT',
        message: 'Let me give you a hint to help you out.'
      };
    }
    
    if (elapsed > this.THRESHOLDS.FRUSTRATION_TIME) {
      return {
        frustrated: true,
        action: 'OFFER_HINT',
        message: 'Would you like a hint?'
      };
    }
    
    return { frustrated: false };
  }

  /**
   * Generate session summary
   */
  getSessionSummary() {
    const duration = Date.now() - this.session.startTime;
    const minutes = Math.floor(duration / 60000);
    const totalAttempts = this.session.errorCount + this.session.successCount;
    const successRate = totalAttempts > 0 
      ? (this.session.successCount / totalAttempts * 100).toFixed(1) 
      : 0;
    
    // Build skill report
    const skills = [];
    for (const [skill, state] of this.session.skillStates) {
      const total = state.errors + state.successes;
      skills.push({
        skill,
        level: state.currentLevel,
        attempts: total,
        successRate: total > 0 ? (state.successes / total * 100).toFixed(1) : 0,
        mastered: total >= 5 && state.successes / total >= this.THRESHOLDS.MASTERY_THRESHOLD
      });
    }
    
    return {
      studentId: this.studentId,
      durationMinutes: minutes,
      totalAttempts,
      successRate: `${successRate}%`,
      challengesCompleted: this.session.challengesCompleted.length,
      skills,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Save session data (placeholder for Phase 2 data system)
   */
  async saveSession() {
    const summary = this.getSessionSummary();
    // In Phase 2, this would save to database
    // For now, return summary for logging
    return summary;
  }
}

// Difficulty level configuration
const DIFFICULTY_CONFIG = {
  [AdaptiveEngine.prototype.LEVELS.EASIEST]: {
    name: 'Easiest',
    hints: 'ALWAYS',
    extraTime: true,
    distractorCount: 2,
    scaffolding: 'HIGH',
    praiseFrequency: 'HIGH'
  },
  [AdaptiveEngine.prototype.LEVELS.EASY]: {
    name: 'Easy',
    hints: 'OFTEN',
    extraTime: true,
    distractorCount: 3,
    scaffolding: 'MEDIUM',
    praiseFrequency: 'MEDIUM'
  },
  [AdaptiveEngine.prototype.LEVELS.NORMAL]: {
    name: 'Normal',
    hints: 'ON_REQUEST',
    extraTime: false,
    distractorCount: 3,
    scaffolding: 'LOW',
    praiseFrequency: 'NORMAL'
  },
  [AdaptiveEngine.prototype.LEVELS.HARD]: {
    name: 'Hard',
    hints: 'RARE',
    extraTime: false,
    distractorCount: 4,
    scaffolding: 'MINIMAL',
    praiseFrequency: 'NORMAL'
  },
  [AdaptiveEngine.prototype.LEVELS.HARDEST]: {
    name: 'Hardest',
    hints: 'NEVER',
    extraTime: false,
    distractorCount: 5,
    scaffolding: 'NONE',
    praiseFrequency: 'LOW',
    timed: true
  }
};

// Export for use in React Native app
module.exports = {
  AdaptiveEngine,
  DIFFICULTY_CONFIG
};

// Example usage (for testing):
if (require.main === module) {
  console.log('Testing Adaptive Engine...\n');
  
  const engine = new AdaptiveEngine('test-student-001');
  
  // Simulate some attempts
  console.log('Simulating letter-B learning session...\n');
  
  // First few errors - child struggling
  engine.recordAttempt('letter-b-recognition', false, 5000);
  engine.recordAttempt('letter-b-recognition', false, 4000);
  engine.recordAttempt('letter-b-recognition', false, 6000);
  
  let adaptations = engine.shouldAdapt('letter-b-recognition');
  console.log('After 3 errors:', adaptations.map(a => a.type));
  
  // Then success
  engine.recordAttempt('letter-b-recognition', true, 3000);
  engine.recordAttempt('letter-b-recognition', true, 2500);
  engine.recordAttempt('letter-b-recognition', true, 2800);
  engine.recordAttempt('letter-b-recognition', true, 2200);
  engine.recordAttempt('letter-b-recognition', true, 2400);
  
  adaptations = engine.shouldAdapt('letter-b-recognition');
  console.log('After 5 successes:', adaptations.map(a => a.type));
  
  // Get summary
  const summary = engine.getSessionSummary();
  console.log('\nSession Summary:');
  console.log(JSON.stringify(summary, null, 2));
}
