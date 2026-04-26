import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import Scene6_CountingDay from '../../components/scenes/Scene6_CountingDay.jsx';
import { vi } from 'vitest';

// Mock fetch for CampaignManager
global.fetch = vi.fn(() => Promise.reject(new Error('No network in tests')));

// Mock useAnalytics — prevents analyticsService crash
vi.mock('../../hooks/useAnalytics.js', () => ({
  useAnalytics: vi.fn(() => ({}))
}));

window.google = {
  visualization: {
    DataTable: class {
      addColumn() {}
      addRows() {}
    },
    BarChart: class {
      draw() {}
    }
  }
};

const mockGameState = {
  timeline: { currentScene: 6, daysRemaining: 0, modelCodeActive: false },
  player: { name: 'Player', party: 'BJP' },
  resources: {
    budget: 7000000, approvalRating: 55, urbanSupport: 55,
    ruralSupport: 55, partySupport: 55, boothAgents: 5
  },
  constituency: { name: 'Varanasi', totalVoters: 1000000, urbanPercent: 50, ruralPercent: 50 },
  opponents: [{ name: 'Rival', baseStrength: 42 }, { name: 'Third', baseStrength: 18 }],
  violations: [],
  scandals: []
};

const mockProps = {
  gameState: mockGameState,
  makeDecision: vi.fn(),
  advanceScene: vi.fn(),
  markTopicLearned: vi.fn()
};

describe('Scene6_CountingDay', () => {
  afterEach(() => {
    vi.clearAllMocks();
    if (vi.isFakeTimers()) vi.useRealTimers();
  });

  it('renders without crashing', () => {
    render(<Scene6_CountingDay {...mockProps} />);
  });

  it('scene title is visible', () => {
    render(<Scene6_CountingDay {...mockProps} />);
    expect(screen.getByText('The EVMs are opened')).toBeInTheDocument();
  });

  it('Start Counting button is visible on initial render', () => {
    render(<Scene6_CountingDay {...mockProps} />);
    expect(screen.getByText('Start Counting')).toBeInTheDocument();
  });

  it('clicking Start Counting shows Rounds Counted panel', () => {
    vi.useFakeTimers();
    render(<Scene6_CountingDay {...mockProps} />);
    act(() => {
      fireEvent.click(screen.getByText('Start Counting'));
    });
    expect(screen.getByText('Rounds Counted')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('Google Charts container has correct aria role after counting starts', () => {
    vi.useFakeTimers();
    render(<Scene6_CountingDay {...mockProps} />);
    act(() => { fireEvent.click(screen.getByText('Start Counting')); });
    const chartEl = document.querySelector('[role="img"]');
    expect(chartEl).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('View Final Declaration button appears after all 21 rounds complete', () => {
    vi.useFakeTimers();
    render(<Scene6_CountingDay {...mockProps} />);
    act(() => { fireEvent.click(screen.getByText('Start Counting')); });
    // Component uses chained setTimeout (2000ms each) through useEffect.
    // Must advance round-by-round so each re-render can register the next timer.
    for (let i = 0; i < 22; i++) {
      act(() => { vi.advanceTimersByTime(2000); });
    }
    expect(screen.getByText('View Final Declaration')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('has no accessibility violations on initial render', async () => {
    // Real timers so axe internal promises can resolve
    const { container } = render(<Scene6_CountingDay {...mockProps} />);
    const axeResults = await axe(container);
    expect(axeResults).toHaveNoViolations();
  });
});
