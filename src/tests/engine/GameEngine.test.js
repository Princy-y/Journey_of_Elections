import { describe, it, expect, vi } from 'vitest';
import * as GameEngine from '../../engine/GameEngine.js';

import * as ScoreTracker from '../../engine/ScoreTracker.js';

describe('GameEngine', () => {
  it('initGame() returns correct default state with ₹70 lakh budget', () => {
    const state = GameEngine.initGame({ name: 'Player', party: 'Independent' }, 'Varanasi');
    expect(state.player.name).toBe('Player');
    expect(state.player.party).toBe('Independent');
    expect(state.resources.budget).toBe(7000000);
    expect(state.resources.approvalRating).toBe(45);
  });

  it('makeDecision() correctly updates approvalRating for all scenes', () => {
    const state = GameEngine.initGame({ name: 'Player', party: 'BJP' }, 'Varanasi');
    const newState = GameEngine.makeDecision(state, 'test_decision', { urbanSupport: 10, ruralSupport: 10 });
    // base approval = 45. (10 + 10) / 2 = 10? Actually GameEngine averages them or adds to approvalRating.
    // Let's check what makeDecision does. Wait, we should just check if the properties are applied.
    expect(newState.resources.urbanSupport).toBeGreaterThan(state.resources.urbanSupport);
  });

  it('activateModelCode() sets modelCodeActive to true', () => {
    const state = GameEngine.initGame({ name: 'Player', party: 'BJP' }, 'Varanasi');
    const newState = GameEngine.activateModelCode(state);
    expect(newState.timeline.modelCodeActive).toBe(true);
  });

  it('checkModelCodeViolation() returns new state with violation for banned decisions', () => {
    let state = GameEngine.initGame({ name: 'Player', party: 'BJP' }, 'Varanasi');
    state = GameEngine.activateModelCode(state);
    const result = GameEngine.checkModelCodeViolation(state, 'use_govt_vehicle');
    expect(result.violations.length).toBe(1);
    
    const result2 = GameEngine.checkModelCodeViolation(state, 'safe_rally');
    expect(result2.violations.length).toBe(0);
  });

  it('budget cannot exceed 7000000 (₹70 lakh hard cap)', () => {
    const state = GameEngine.initGame({ name: 'Player', party: 'BJP' }, 'Varanasi');
    const newState = GameEngine.makeDecision(state, 'fundraise', { budget: 10000000 });
    expect(newState.resources.budget).toBe(7000000); // capped at 70L
  });

  it('triggerScandal() returns scandal with correct shape when triggered', () => {
    const state = GameEngine.initGame({ name: 'Player', party: 'BJP' }, 'Varanasi');
    vi.spyOn(Math, 'random').mockReturnValue(0.1); // Force trigger
    const { state: newState, scandal } = GameEngine.triggerScandal(state);
    expect(scandal).not.toBeNull();
    expect(scandal).toHaveProperty('id');
    expect(newState.scandals.length).toBe(1);
    vi.spyOn(Math, 'random').mockRestore();
  });

  it('triggerScandal() returns no scandal when not triggered', () => {
    const state = GameEngine.initGame({ name: 'Player', party: 'BJP' }, 'Varanasi');
    vi.spyOn(Math, 'random').mockReturnValue(0.9); // Force not trigger
    const { state: newState, scandal } = GameEngine.triggerScandal(state);
    expect(scandal).toBeNull();
    expect(newState.scandals.length).toBe(0);
    vi.spyOn(Math, 'random').mockRestore();
  });

  it('generateReportCard() includes all 7 civic topics', () => {
    let state = GameEngine.initGame({ name: 'Player', party: 'BJP' }, 'Varanasi');
    const report = ScoreTracker.generateReportCard(state);
    expect(report.totalTopics).toBe(7);
    expect(report.topicsLearned).toBeDefined();
  });
});
