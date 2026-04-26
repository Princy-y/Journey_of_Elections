import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { axe } from 'jest-axe';
import Scene7_Certification from '../../components/scenes/Scene7_Certification.jsx';
import { vi } from 'vitest';

// Mock firebase so it doesn't crash
vi.mock('../../services/firebaseService.js', () => ({
  saveGameSession: vi.fn().mockResolvedValue(undefined),
  saveToLeaderboard: vi.fn().mockResolvedValue(undefined),
  subscribeLeaderboard: vi.fn((cb) => { cb([]); return () => {}; })
}));

// Mock analytics
vi.mock('../../services/analyticsService.js', () => ({
  analyticsService: {
    gameCompleted: vi.fn(),
    reportCardShared: vi.fn()
  }
}));

const mockGameState = {
  timeline: { currentScene: 7, daysRemaining: 0, modelCodeActive: false },
  player: { name: 'Player', party: 'BJP' },
  resources: { budget: 3000000, approvalRating: 45, urbanSupport: 45, ruralSupport: 45, partySupport: 50, boothAgents: 5 },
  constituency: { name: 'Varanasi', totalVoters: 1000000, urbanPercent: 50, ruralPercent: 50 },
  opponents: [{ name: 'Opponent', baseStrength: 42 }],
  violations: [],
  scandals: [],
  decisions: [],
  achievements: ['nomination', 'epic', 'expenditure', 'mcc', 'fptp', 'evm', 'certification'],
  civicScore: 90
};

const mockProps = {
  gameState: mockGameState,
  markTopicLearned: vi.fn(),
  resetGame: vi.fn()
};

describe('Scene7_Certification', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('scene title renders (Returning Officer announcement)', () => {
    render(<Scene7_Certification {...mockProps} />);
    expect(screen.getByText('The Returning Officer rises to declare the result')).toBeInTheDocument();
  });

  it('renders winning or losing state correctly after timers advance', () => {
    vi.useFakeTimers();
    render(<Scene7_Certification {...mockProps} />);
    act(() => { vi.advanceTimersByTime(11000); });
    const victory = screen.queryByText('VICTORY!');
    const defeat = screen.queryByText('DEFEAT');
    expect(victory || defeat).toBeTruthy();
    vi.useRealTimers();
  });

  it('renders losing state correctly when opponent wins', () => {
    vi.useFakeTimers();
    const loseGameState = {
      ...mockGameState,
      resources: { ...mockGameState.resources, approvalRating: 15, urbanSupport: 15, ruralSupport: 15, partySupport: 15 }
    };
    render(<Scene7_Certification {...{ ...mockProps, gameState: loseGameState }} />);
    act(() => { vi.advanceTimersByTime(11000); });
    expect(screen.getByText('DEFEAT')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('advancing timers shows Start New Campaign button', () => {
    vi.useFakeTimers();
    render(<Scene7_Certification {...mockProps} />);
    act(() => { vi.advanceTimersByTime(11000); });
    expect(screen.getByText('Start New Campaign')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('has no accessibility violations on initial render', async () => {
    // Do NOT use fake timers here — axe needs real promise resolution
    const { container } = render(<Scene7_Certification {...mockProps} />);
    const axeResults = await axe(container);
    expect(axeResults).toHaveNoViolations();
  });
});
