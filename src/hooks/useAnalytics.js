import { useEffect, useRef } from 'react';
import { analyticsService } from '../services/analyticsService.js';

export function useAnalytics(gameState) {
  const currentSceneRef = useRef(gameState.timeline.currentScene);

  useEffect(() => {
    // Check if scene has changed
    if (gameState.timeline.currentScene !== currentSceneRef.current) {
      // Scene completed / transitioned
      analyticsService.sceneCompleted({
        scene_number: currentSceneRef.current,
        scene_name: `Scene ${currentSceneRef.current}`,
        approval_rating: gameState.resources.approvalRating,
        budget_remaining: gameState.resources.budget
      });
      
      currentSceneRef.current = gameState.timeline.currentScene;
    }
  }, [gameState.timeline.currentScene, gameState.resources.approvalRating, gameState.resources.budget]);

  return analyticsService;
}
