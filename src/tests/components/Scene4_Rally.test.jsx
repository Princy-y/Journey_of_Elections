import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import Scene4_Rally from '../../components/scenes/Scene4_Rally.jsx';
import { vi } from 'vitest';

// Mock fetch so CampaignManager doesn't make real network calls
global.fetch = vi.fn(() => Promise.reject(new Error('No network in tests')));

const mockGameState = {
  timeline: { currentScene: 4, daysRemaining: 35, modelCodeActive: false },
  player: { name: 'Player', party: 'BJP' },
  resources: { budget: 7000000, approvalRating: 45 },
  constituency: { name: 'Varanasi' }
};

const mockProps = {
  gameState: mockGameState,
  makeDecision: vi.fn(),
  advanceScene: vi.fn(),
  activateModelCode: vi.fn(),
  markTopicLearned: vi.fn()
};

describe('Scene4_Rally', () => {
  afterEach(() => { vi.clearAllMocks(); });

  it('renders without crashing', () => {
    render(<Scene4_Rally {...mockProps} />);
  });

  it('scene title is visible', () => {
    render(<Scene4_Rally {...mockProps} />);
    expect(screen.getByText('Every move is being watched')).toBeInTheDocument();
  });

  it('all decision options are rendered', () => {
    render(<Scene4_Rally {...mockProps} />);
    expect(screen.getByText('Hold a massive rally — book stadium, invite star campaigner')).toBeInTheDocument();
    expect(screen.getByText('Door-to-door campaign in key booths')).toBeInTheDocument();
    expect(screen.getByText('Focus on social media blitz')).toBeInTheDocument();
  });

  it('clicking a decision calls makeDecision()', () => {
    render(<Scene4_Rally {...mockProps} />);
    const decision = screen.getByText('Door-to-door campaign in key booths');
    fireEvent.click(decision);
    expect(mockProps.makeDecision).toHaveBeenCalled();
  });

  it('days remaining counter displays correctly', () => {
    render(<Scene4_Rally {...mockProps} />);
    expect(screen.getByText('Days to Polling: 35')).toBeInTheDocument();
  });

  it('decision radiogroup has correct aria role', () => {
    render(<Scene4_Rally {...mockProps} />);
    const group = screen.getByRole('radiogroup');
    expect(group).toBeInTheDocument();
  });

  it('MCC banner is visible', () => {
    render(<Scene4_Rally {...mockProps} />);
    expect(screen.getByText('Model Code of Conduct Activated')).toBeInTheDocument();
  });

  it('advancing to next scene calls advanceScene() after selecting', () => {
    render(<Scene4_Rally {...mockProps} />);
    fireEvent.click(screen.getByText('Door-to-door campaign in key booths'));
    const btn = screen.getByText('Confirm & Continue');
    fireEvent.click(btn);
    expect(mockProps.advanceScene).toHaveBeenCalledWith(5);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Scene4_Rally {...mockProps} />);
    const axeResults = await axe(container);
    expect(axeResults).toHaveNoViolations();
  });
});
