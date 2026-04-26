// analyticsService.js
export const analyticsService = {
  logEvent: (eventName, params) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, params)
    }
  },
  
  gameStarted: (data) => {
    analyticsService.logEvent('game_started', data);
  },
  
  sceneCompleted: (data) => {
    analyticsService.logEvent('scene_completed', data);
  },
  
  decisionMade: (data) => {
    analyticsService.logEvent('decision_made', data);
  },
  
  mccViolationTriggered: (data) => {
    analyticsService.logEvent('mcc_violation_triggered', data);
  },
  
  scandalTriggered: (data) => {
    analyticsService.logEvent('scandal_triggered', data);
  },
  
  budgetExceededAttempt: (data) => {
    analyticsService.logEvent('budget_exceeded_attempt', data);
  },
  
  gameCompleted: (data) => {
    analyticsService.logEvent('game_completed', data);
  },
  
  reportCardShared: (data) => {
    analyticsService.logEvent('report_card_shared', data);
  }
};
