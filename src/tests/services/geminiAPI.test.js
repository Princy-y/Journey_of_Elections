import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

describe('geminiAPI', () => {
  // We need to reset module state (debounce timer) between tests
  let callCampaignManager;
  
  beforeEach(async () => {
    vi.useFakeTimers();
    sessionStorage.clear();
    
    // Re-import module fresh each test to reset debounce state
    vi.resetModules();
    const module = await import('../../services/geminiAPI.js');
    callCampaignManager = module.callCampaignManager;

    // Mock fetch — return a successful proxy response
    global.fetch = vi.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        message: 'Test message from Star',
        realWorldFact: 'ECI was established in 1950',
        tip: 'File your nomination early',
        mood: 'encouraging'
      })
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('callCampaignManager() returns parsed JSON with all 4 fields', async () => {
    const promise = callCampaignManager('Scene 1', 'Context', 'Decision A', {});
    vi.runAllTimers();
    const result = await promise;
    expect(result.message).toBe('Test message from Star');
    expect(result.realWorldFact).toBe('ECI was established in 1950');
    expect(result.tip).toBe('File your nomination early');
    expect(result.mood).toBe('encouraging');
  });

  it('callCampaignManager() uses cache on second call with same key', async () => {
    // First call
    const p1 = callCampaignManager('Scene 1', 'Context', 'Decision A', {});
    vi.runAllTimers();
    await p1;
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Reset modules again to get same instance but cache is in sessionStorage
    vi.resetModules();
    const module2 = await import('../../services/geminiAPI.js');
    const callCM2 = module2.callCampaignManager;

    // Second call — same scene + decision → cache hit
    const p2 = callCM2('Scene 1', 'Context', 'Decision A', {});
    vi.runAllTimers();
    await p2;
    // fetch should still only have been called once total (cache hit)
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('callCampaignManager() returns fallback message on API failure', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));
    const promise = callCampaignManager('Scene 3', 'Context', 'Decision C', {});
    vi.runAllTimers();
    const result = await promise;
    expect(result.mood).toBe('warning');
    expect(result.message).toContain('Network signals are weak');
  });

  it('callCampaignManager() sanitizes and forwards scene input', async () => {
    const promise = callCampaignManager('Scene 1', 'Context', 'Decision A', {});
    vi.runAllTimers();
    await promise;
    const fetchCall = global.fetch.mock.calls[0];
    const body = JSON.parse(fetchCall[1].body);
    expect(body).toHaveProperty('scene', 'Scene 1');
    expect(body).toHaveProperty('context', 'Context');
  });

  it('callCampaignManager() debounces — only one fetch for rapid calls', async () => {
    // Fire 3 rapid calls — debounce should collapse to 1
    callCampaignManager('Scene 4', 'Ctx', 'D1', {});
    callCampaignManager('Scene 4', 'Ctx', 'D1', {});
    const p3 = callCampaignManager('Scene 4', 'Ctx', 'D1', {});
    vi.runAllTimers();
    await p3;
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
