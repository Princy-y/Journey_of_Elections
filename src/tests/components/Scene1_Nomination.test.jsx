import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import Scene1_Nomination from '../../components/scenes/Scene1_Nomination.jsx';
import { vi } from 'vitest';

// Mock fetch for CampaignManager so it doesn't make real network calls
global.fetch = vi.fn(() => Promise.reject(new Error('No network in tests')));

const mockGameState = {
  timeline: { currentScene: 1, daysRemaining: 75, modelCodeActive: false },
  player: { name: 'Player', party: 'Independent' },
  resources: { budget: 7000000, approvalRating: 45 },
  constituency: { name: 'Varanasi' }
};

const mockProps = {
  gameState: mockGameState,
  makeDecision: vi.fn(),
  advanceScene: vi.fn(),
  markTopicLearned: vi.fn()
};

describe('Scene1_Nomination', () => {
  afterEach(() => { vi.clearAllMocks(); });

  it('renders without crashing', () => {
    render(<Scene1_Nomination {...mockProps} />);
  });

  it('scene title is visible', () => {
    render(<Scene1_Nomination {...mockProps} />);
    expect(screen.getByText('Your political journey begins today')).toBeInTheDocument();
  });

  it('all decision options are rendered', () => {
    render(<Scene1_Nomination {...mockProps} />);
    expect(screen.getByText('Contest on BJP ticket')).toBeInTheDocument();
    expect(screen.getByText('Contest on INC ticket')).toBeInTheDocument();
    expect(screen.getByText('Contest as Independent')).toBeInTheDocument();
    expect(screen.getByText('Contest on AAP ticket')).toBeInTheDocument();
  });

  it('clicking a decision calls makeDecision()', () => {
    render(<Scene1_Nomination {...mockProps} />);
    const decision = screen.getByText('Contest on BJP ticket');
    fireEvent.click(decision);
    expect(mockProps.makeDecision).toHaveBeenCalledWith(
      'nomination_party_choice',
      expect.objectContaining({ id: 'A' })
    );
  });

  it('days remaining counter displays correctly', () => {
    render(<Scene1_Nomination {...mockProps} />);
    expect(screen.getByText('Days to Polling: 75')).toBeInTheDocument();
  });

  it('decision radiogroup has correct aria role', () => {
    render(<Scene1_Nomination {...mockProps} />);
    const group = screen.getByRole('radiogroup');
    expect(group).toBeInTheDocument();
  });

  it('advancing to next scene calls advanceScene() after selecting a decision', () => {
    render(<Scene1_Nomination {...mockProps} />);
    fireEvent.click(screen.getByText('Contest on BJP ticket'));
    const confirmBtn = screen.getByText('Confirm & Continue');
    fireEvent.click(confirmBtn);
    expect(mockProps.advanceScene).toHaveBeenCalledWith(2);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Scene1_Nomination {...mockProps} />);
    const axeResults = await axe(container);
    expect(axeResults).toHaveNoViolations();
  });
});
