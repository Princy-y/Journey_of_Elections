import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ReportCard from '../../components/ui/ReportCard.jsx';
import { vi } from 'vitest';
import * as analyticsService from '../../services/analyticsService.js';

// Mock Firebase so it doesn't crash on mount
vi.mock('../../services/firebaseService.js', () => ({
  subscribeLeaderboard: vi.fn((cb) => {
    cb([
      { id: '1', playerName: 'Alice', party: 'BJP', constituency: 'Varanasi', civicScore: 92, won: true },
      { id: '2', playerName: 'Bob', party: 'INC', constituency: 'Mumbai', civicScore: 78, won: false }
    ]);
    return () => {};
  })
}));

// Mock google charts
window.google = {
  visualization: {
    DataTable: class {
      addColumn() {}
      addRows() {}
    },
    PieChart: class {
      draw() {}
    }
  }
};

// Mock analytics service
vi.mock('../../services/analyticsService.js', () => ({
  analyticsService: {
    reportCardShared: vi.fn()
  }
}));

const mockReport = {
  civicScore: 90,
  topicsLearned: [
    { id: 'nomination', label: 'Nomination Process', learned: true },
    { id: 'mcc', label: 'Model Code of Conduct', learned: true },
    { id: 'epic', label: 'Voter ID & EPIC Cards', learned: true },
    { id: 'expenditure', label: 'ECI Campaign Expenditure Limits', learned: true },
    { id: 'fptp', label: 'First Past The Post System', learned: true },
    { id: 'evm', label: 'EVM & VVPAT Process', learned: true },
    { id: 'certification', label: 'Result Certification & Form 20', learned: true }
  ],
  totalTopics: 7,
  decisionsLog: [],
  stats: {
    budgetSpent: 4000000,
    budgetRemaining: 3000000,
    scandalsSurvived: 0,
    mccViolations: 0,
    boothAgentsDeployed: 5,
    finalTurnout: '67%'
  }
};

const mockResults = {
  playerSharePercent: '45.0',
  opponentSharePercent: '38.0',
  winner: 'player',
  margin: 15000
};

describe('ReportCard', () => {
  it('renders civicScore out of 100', () => {
    render(<ReportCard report={mockReport} results={mockResults} />);
    expect(screen.getByText('90')).toBeInTheDocument();
    expect(screen.getByText('Score')).toBeInTheDocument();
  });

  it('renders all 7 topics learned', () => {
    render(<ReportCard report={mockReport} results={mockResults} />);
    expect(screen.getByText('Nomination Process')).toBeInTheDocument();
    expect(screen.getByText('Model Code of Conduct')).toBeInTheDocument();
    expect(screen.getByText('EVM & VVPAT Process')).toBeInTheDocument();
    // Check topic count display
    expect(screen.getByText('Topics Mastered (7/7)')).toBeInTheDocument();
  });

  it('budget spent stat shows correct ₹ amount', () => {
    render(<ReportCard report={mockReport} results={mockResults} />);
    // Budget spent = 4,000,000. Node.js uses Indian locale: 40,00,000
    // Use getByText with an exact match for the Indian locale format
    const el = screen.getByText(/Budget Spent:/);
    expect(el).toBeInTheDocument();
    // The sibling span should contain the ₹ amount — check it's non-zero
    const budgetText = screen.getAllByText(/₹/);
    const spentEl = budgetText.find(el => el.textContent.includes('40,00,000') || el.textContent.includes('4,000,000'));
    expect(spentEl).toBeTruthy();
  });

  it('share button triggers analytics event', () => {
    // Mock navigator.clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      writable: true
    });
    // Suppress window.alert
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<ReportCard report={mockReport} results={mockResults} />);
    const shareBtn = screen.getByText('Share Score');
    fireEvent.click(shareBtn);
    expect(analyticsService.analyticsService.reportCardShared).toHaveBeenCalled();
  });

  it('leaderboard renders with mocked Firebase data', () => {
    render(<ReportCard report={mockReport} results={mockResults} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });
});
