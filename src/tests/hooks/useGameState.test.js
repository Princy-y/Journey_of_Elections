import { renderHook, act } from '@testing-library/react';
import { useGameState } from '../../hooks/useGameState.js';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('useGameState', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes game state with defaults', () => {
    const { result } = renderHook(() => useGameState());
    expect(result.current.gameState.player).toBeDefined();
    expect(result.current.gameState.resources).toBeDefined();
  });

  it('updates player data via initGame', () => {
    const { result } = renderHook(() => useGameState());
    act(() => {
      result.current.initGame({ name: 'Test Player', party: 'BJP' }, 'Varanasi');
    });
    expect(result.current.gameState.player.name).toBe('Test Player');
    expect(result.current.gameState.player.party).toBe('BJP');
    expect(result.current.gameState.constituency.name).toBe('Varanasi');
  });

  it('makes decision and updates budget', () => {
    const { result } = renderHook(() => useGameState());
    act(() => {
      result.current.makeDecision('test_decision', {
        id: 'A',
        budget: -100000,
        urbanSupport: 10
      });
    });
    expect(result.current.gameState.resources.budget).toBe(6900000);
    // Approval rating recalculates based on supports, so it should be higher than initial 45
    expect(result.current.gameState.resources.approvalRating).toBeGreaterThan(45);
  });

  it('advances scene', () => {
    const { result } = renderHook(() => useGameState());
    act(() => {
      result.current.advanceScene(2);
    });
    expect(result.current.gameState.timeline.currentScene).toBe(2);
  });

  it('marks topic learned', () => {
    const { result } = renderHook(() => useGameState());
    act(() => {
      result.current.markTopicLearned('evm');
    });
    expect(result.current.gameState.achievements).toContain('evm');
  });
  
  it('activates model code', () => {
    const { result } = renderHook(() => useGameState());
    act(() => {
      result.current.activateModelCode();
    });
    expect(result.current.gameState.timeline.modelCodeActive).toBe(true);
  });

  it('activates silence period', () => {
    const { result } = renderHook(() => useGameState());
    act(() => {
      result.current.activateSilencePeriod();
    });
    expect(result.current.gameState.timeline.silencePeriodActive).toBe(true);
  });

  it('triggers scandal based on random chance', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    const { result } = renderHook(() => useGameState());
    let scandal;
    act(() => {
      scandal = result.current.triggerScandal();
    });
    expect(scandal).not.toBeNull();
    expect(result.current.gameState.scandals.length).toBe(1);
    vi.spyOn(Math, 'random').mockRestore();
  });

  it('resets game', () => {
    const { result } = renderHook(() => useGameState());
    act(() => {
      result.current.advanceScene(5);
      result.current.resetGame();
    });
    expect(result.current.gameState.timeline.currentScene).toBe(1);
  });
});
