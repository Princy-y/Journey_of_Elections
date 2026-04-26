import { describe, it, expect } from 'vitest';
import { triggerScandal } from '../../engine/ScandalEngine.js';

describe('ScandalEngine', () => {
  it('triggerScandal() returns one of the 6 defined scandals', () => {
    const scandal = triggerScandal();
    expect(scandal).toHaveProperty('id');
    expect(scandal).toHaveProperty('title');
    expect(scandal).toHaveProperty('description');
    expect(scandal).toHaveProperty('responses');
  });

  it('each scandal has title, description, responses array, approvalImpact', () => {
    const scandal = triggerScandal();
    expect(typeof scandal.title).toBe('string');
    expect(typeof scandal.description).toBe('string');
    expect(Array.isArray(scandal.responses)).toBe(true);
    expect(scandal.responses.length).toBeGreaterThan(0);
    expect(scandal).toHaveProperty('approvalImpact');
  });

  it('silence period violation scandal only triggers in Scene 5', () => {
    const scene4State = { timeline: { currentScene: 4 } };
    const scene5State = { timeline: { currentScene: 5 } };
    
    expect(triggerScandal(scene4State).id).not.toBe('silence_period_violation');
    expect(triggerScandal(scene5State).id).toBe('silence_period_violation');
  });
});
