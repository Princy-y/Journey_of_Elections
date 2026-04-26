import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyticsService } from '../../services/analyticsService.js';

describe('analyticsService', () => {
  beforeEach(() => {
    vi.stubGlobal('gtag', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('gameStarted triggers gtag', () => {
    analyticsService.gameStarted({ party: 'BJP' });
    expect(window.gtag).toHaveBeenCalledWith('event', 'game_started', { party: 'BJP' });
  });

  it('sceneCompleted triggers gtag', () => {
    analyticsService.sceneCompleted({ scene_number: 1 });
    expect(window.gtag).toHaveBeenCalledWith('event', 'scene_completed', { scene_number: 1 });
  });

  it('decisionMade triggers gtag', () => {
    analyticsService.decisionMade({ decision_id: 'A' });
    expect(window.gtag).toHaveBeenCalledWith('event', 'decision_made', { decision_id: 'A' });
  });

  it('mccViolationTriggered triggers gtag', () => {
    analyticsService.mccViolationTriggered({ violation_type: 'bribe' });
    expect(window.gtag).toHaveBeenCalledWith('event', 'mcc_violation_triggered', { violation_type: 'bribe' });
  });

  it('scandalTriggered triggers gtag', () => {
    analyticsService.scandalTriggered({ scandal_type: 'cash' });
    expect(window.gtag).toHaveBeenCalledWith('event', 'scandal_triggered', { scandal_type: 'cash' });
  });

  it('budgetExceededAttempt triggers gtag', () => {
    analyticsService.budgetExceededAttempt({ amount: 1000 });
    expect(window.gtag).toHaveBeenCalledWith('event', 'budget_exceeded_attempt', { amount: 1000 });
  });

  it('gameCompleted triggers gtag', () => {
    analyticsService.gameCompleted({ winner: true });
    expect(window.gtag).toHaveBeenCalledWith('event', 'game_completed', { winner: true });
  });

  it('reportCardShared triggers gtag', () => {
    analyticsService.reportCardShared({ score: 90 });
    expect(window.gtag).toHaveBeenCalledWith('event', 'report_card_shared', { score: 90 });
  });
  
  it('does not crash if gtag is undefined', () => {
    vi.stubGlobal('gtag', undefined);
    expect(() => analyticsService.gameStarted({ party: 'BJP' })).not.toThrow();
  });
});
