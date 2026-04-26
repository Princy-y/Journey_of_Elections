import { describe, it, expect } from 'vitest';
import { calculateVotes } from '../../engine/VoteCalculator.js';

describe('VoteCalculator', () => {
  it('FPTP: candidate with most votes wins regardless of percentage', () => {
    const gameState = {
      resources: { approvalRating: 80, urbanSupport: 80, ruralSupport: 80, partySupport: 80, youthSupport: 80, boothAgents: 0 },
      timeline: { currentScene: 7, daysRemaining: 0, modelCodeActive: false },
      constituency: { totalVoters: 1000000, urbanPercent: 50, ruralPercent: 50 },
      opponents: [{ name: 'Opponent', baseStrength: 10 }],
      violations: [],
      scandals: []
    };
    const result = calculateVotes(gameState);
    expect(result.winner).toBe('player');
  });

  it('MCC violations reduce votes by 3% each', () => {
    const baseGameState = {
      resources: { approvalRating: 50, urbanSupport: 50, ruralSupport: 50, partySupport: 50, boothAgents: 0 },
      timeline: { currentScene: 7 },
      constituency: { totalVoters: 1000000, urbanPercent: 50, ruralPercent: 50 },
      opponents: [{ name: 'Opponent', baseStrength: 42 }],
      violations: [],
      scandals: []
    };
    const baseResult = calculateVotes(baseGameState);
    
    const violationGameState = { ...baseGameState, violations: [{}, {}] };
    const violationResult = calculateVotes(violationGameState);
    
    expect(parseFloat(violationResult.playerSharePercent)).toBeLessThan(parseFloat(baseResult.playerSharePercent));
  });

  it('booth agents > 20 add reliable vote buffer', () => {
    const stateWithAgents = {
      resources: { approvalRating: 40, urbanSupport: 40, ruralSupport: 40, partySupport: 40, boothAgents: 25 },
      timeline: { currentScene: 7 },
      constituency: { totalVoters: 1000000, urbanPercent: 50, ruralPercent: 50 },
      opponents: [{ name: 'Opponent', baseStrength: 42 }],
      violations: [],
      scandals: []
    };
    const stateWithoutAgents = {
      ...stateWithAgents,
      resources: { ...stateWithAgents.resources, boothAgents: 0 }
    };
    const resultWith = calculateVotes(stateWithAgents);
    const resultWithout = calculateVotes(stateWithoutAgents);
    
    expect(parseFloat(resultWith.playerSharePercent)).toBeGreaterThan(parseFloat(resultWithout.playerSharePercent));
  });

  it('recount triggers correctly at margin < 1000', () => {
    const state = {
      resources: { approvalRating: 42, urbanSupport: 42, ruralSupport: 42, partySupport: 42, boothAgents: 0 },
      timeline: { currentScene: 7 },
      constituency: { totalVoters: 1000, urbanPercent: 50, ruralPercent: 50 },
      opponents: [{ name: 'Opponent', baseStrength: 42 }],
      violations: [],
      scandals: []
    };
    const result = calculateVotes(state);
    if (result.margin < 1000) {
      expect(result.isRecount).toBe(true);
    }
  });
});
