import { renderHook } from '@testing-library/react';
import { useAnalytics } from '../../hooks/useAnalytics.js';
import { analyticsService } from '../../services/analyticsService.js';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../services/analyticsService.js', () => ({
  analyticsService: {
    sceneCompleted: vi.fn()
  }
}));

describe('useAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not call sceneCompleted on initial render', () => {
    const gameState = {
      timeline: { currentScene: 1 },
      resources: { approvalRating: 50, budget: 100 }
    };
    renderHook(() => useAnalytics(gameState));
    expect(analyticsService.sceneCompleted).not.toHaveBeenCalled();
  });

  it('calls sceneCompleted when scene changes', () => {
    let gameState = {
      timeline: { currentScene: 1 },
      resources: { approvalRating: 50, budget: 100 }
    };
    const { rerender } = renderHook((props) => useAnalytics(props), { initialProps: gameState });
    
    // Change scene
    gameState = {
      timeline: { currentScene: 2 },
      resources: { approvalRating: 60, budget: 80 }
    };
    rerender(gameState);
    
    expect(analyticsService.sceneCompleted).toHaveBeenCalledWith({
      scene_number: 1,
      scene_name: 'Scene 1',
      approval_rating: 60,
      budget_remaining: 80
    });
  });
});
