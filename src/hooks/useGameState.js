import { useState, useEffect, useCallback } from 'react';
import { 
  getInitialState, 
  initGame as engineInitGame, 
  makeDecision as engineMakeDecision,
  activateModelCode as engineActivateModelCode,
  checkModelCodeViolation as engineCheckModelCodeViolation,
  activateSilencePeriod as engineActivateSilencePeriod,
  triggerScandal as engineTriggerScandal
} from '../engine/GameEngine.js';
import { markTopicLearned as engineMarkTopicLearned } from '../engine/ScoreTracker.js';
import { analyticsService } from '../services/analyticsService.js';

const STORAGE_KEY = 'journey_of_elections_state';

export function useGameState() {
  const [gameState, setGameState] = useState(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse stored game state', e);
    }
    return getInitialState();
  });

  // Persist to session storage on every change
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    } catch (e) {
      console.error('Failed to save game state', e);
    }
  }, [gameState]);

  const initGame = useCallback((playerData, constituencyName) => {
    const newState = engineInitGame(playerData, constituencyName);
    setGameState(newState);
    analyticsService.gameStarted({ party: playerData.party, constituency: constituencyName, state: newState.constituency.state });
  }, []);

  const makeDecision = useCallback((decisionId, choice) => {
    setGameState(prevState => {
      // Check MCC violations
      let stateAfterMcc = engineCheckModelCodeViolation(prevState, decisionId);
      if (stateAfterMcc.violations.length > prevState.violations.length) {
        analyticsService.mccViolationTriggered({ scene: prevState.timeline.currentScene, violation_type: decisionId });
      }
      
      // Check for budget exceeded
      if (choice.budget && (prevState.resources.budget + choice.budget < 0)) {
        analyticsService.budgetExceededAttempt({ scene: prevState.timeline.currentScene, amount_over_limit: Math.abs(prevState.resources.budget + choice.budget) });
      }

      const finalState = engineMakeDecision(stateAfterMcc, decisionId, choice);
      
      analyticsService.decisionMade({ 
        scene: prevState.timeline.currentScene, 
        decision_id: decisionId, 
        choice: choice.id, 
        approval_impact: finalState.resources.approvalRating - prevState.resources.approvalRating 
      });

      return finalState;
    });
  }, []);

  const advanceScene = useCallback((nextSceneId) => {
    setGameState(prevState => ({
      ...prevState,
      timeline: {
        ...prevState.timeline,
        currentScene: nextSceneId,
        daysRemaining: Math.max(0, prevState.timeline.daysRemaining - 10)
      }
    }));
  }, []);

  const activateModelCode = useCallback(() => {
    setGameState(prevState => engineActivateModelCode(prevState));
  }, []);

  const activateSilencePeriod = useCallback(() => {
    setGameState(prevState => engineActivateSilencePeriod(prevState));
  }, []);

  const triggerScandal = useCallback(() => {
    let triggeredScandal = null;
    setGameState(prevState => {
      const result = engineTriggerScandal(prevState);
      triggeredScandal = result.scandal;
      if (triggeredScandal) {
        // Just trigger event, response tracked via makeDecision
        analyticsService.scandalTriggered({ scene: prevState.timeline.currentScene, scandal_type: triggeredScandal.id, response_chosen: null });
      }
      return result.state;
    });
    return triggeredScandal;
  }, []);
  
  const markTopicLearned = useCallback((topicId) => {
    setGameState(prevState => engineMarkTopicLearned(prevState, topicId));
  }, []);

  const resetGame = useCallback(() => {
    setGameState(getInitialState());
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    gameState,
    initGame,
    makeDecision,
    advanceScene,
    activateModelCode,
    activateSilencePeriod,
    triggerScandal,
    markTopicLearned,
    resetGame
  };
}
