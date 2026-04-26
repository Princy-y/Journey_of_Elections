import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import Scene2_VoterDrive from '../../components/scenes/Scene2_VoterDrive.jsx';
import { vi } from 'vitest';

// Mock fetch so CampaignManager doesn't make real network calls
global.fetch = vi.fn(() => Promise.reject(new Error('No network in tests')));

const mockGameState = {
  timeline: { currentScene: 2, daysRemaining: 60, modelCodeActive: false },
  player: { name: 'Player' },
  resources: { budget: 7000000, approvalRating: 45 },
  constituency: { name: 'Varanasi' }
};

const mockProps = {
  gameState: mockGameState,
  makeDecision: vi.fn(),
  advanceScene: vi.fn(),
  markTopicLearned: vi.fn()
};

describe('Scene2_VoterDrive', () => {
  it('renders without crashing', () => {
    render(<Scene2_VoterDrive {...mockProps} />);
  });

  it('scene title is visible', () => {
    render(<Scene2_VoterDrive {...mockProps} />);
    expect(screen.getByText('Your voters must be on the rolls')).toBeInTheDocument();
  });

  it('all decision options are rendered', () => {
    render(<Scene2_VoterDrive {...mockProps} />);
    expect(screen.getByText('Spend ₹3 lakhs on EPIC card registration camps')).toBeInTheDocument();
    expect(screen.getByText('Partner with local NGOs and student unions')).toBeInTheDocument();
    expect(screen.getByText('Focus on fundraising instead')).toBeInTheDocument();
  });

  it('clicking a decision calls makeDecision()', () => {
    render(<Scene2_VoterDrive {...mockProps} />);
    const decision = screen.getByText('Spend ₹3 lakhs on EPIC card registration camps');
    fireEvent.click(decision);
    expect(mockProps.makeDecision).toHaveBeenCalled();
  });

  it('days remaining counter displays correctly', () => {
    render(<Scene2_VoterDrive {...mockProps} />);
    expect(screen.getByText('Days to Polling: 60')).toBeInTheDocument();
  });

  it('decision radiogroup has correct aria role', () => {
    render(<Scene2_VoterDrive {...mockProps} />);
    const group = screen.getByRole('radiogroup');
    expect(group).toBeInTheDocument();
  });

  it('advancing to next scene calls advanceScene() after selecting', () => {
    render(<Scene2_VoterDrive {...mockProps} />);
    fireEvent.click(screen.getByText('Partner with local NGOs and student unions'));
    const btn = screen.getByText('Confirm & Continue');
    fireEvent.click(btn);
    expect(mockProps.advanceScene).toHaveBeenCalledWith(3);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Scene2_VoterDrive {...mockProps} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
