import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  initFirebase, 
  saveGameSession, 
  saveToLeaderboard, 
  getLeaderboard, 
  subscribeLeaderboard 
} from '../../services/firebaseService.js';
import * as firestore from 'firebase/firestore';

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  signInAnonymously: vi.fn(() => Promise.resolve()),
  onAuthStateChanged: vi.fn((auth, cb) => {
    cb({ uid: 'test_uid' });
  }),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn(),
  doc: vi.fn(),
  setDoc: vi.fn(() => Promise.resolve()),
  query: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  onSnapshot: vi.fn((q, cb) => {
    cb({ docs: [{ id: '1', data: () => ({ name: 'Test' }) }] });
    return vi.fn();
  }),
  getDocs: vi.fn(() => Promise.resolve({ docs: [{ id: '1', data: () => ({ name: 'Test' }) }] })),
}));

describe('firebaseService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initFirebase initializes app and auth', () => {
    initFirebase();
    expect(firestore.getFirestore).toHaveBeenCalled();
  });

  it('saveGameSession saves to firestore', async () => {
    initFirebase();
    await saveGameSession(
      { player: { name: 'P', party: 'BJP' }, constituency: { name: 'C' }, resources: { approvalRating: 50, budget: 100 }, scandals: [] },
      { winner: 'player' },
      { civicScore: 10, decisionsLog: [] }
    );
    expect(firestore.setDoc).toHaveBeenCalled();
  });

  it('saveToLeaderboard saves to firestore', async () => {
    initFirebase();
    await saveToLeaderboard('P', 10, true, 'C', 'BJP');
    expect(firestore.setDoc).toHaveBeenCalled();
  });

  it('getLeaderboard fetches from firestore', async () => {
    initFirebase();
    const data = await getLeaderboard();
    expect(data.length).toBe(1);
    expect(data[0].name).toBe('Test');
  });

  it('subscribeLeaderboard calls callback with data', () => {
    initFirebase();
    const cb = vi.fn();
    const unsubscribe = subscribeLeaderboard(cb);
    expect(cb).toHaveBeenCalledWith([{ id: '1', name: 'Test' }]);
    expect(typeof unsubscribe).toBe('function');
  });
});
