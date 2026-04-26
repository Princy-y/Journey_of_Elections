import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import Scene5_PhaseVoting from '../../components/scenes/Scene5_PhaseVoting.jsx';
import { vi } from 'vitest';

// Mock fetch so CampaignManager doesn't make real network calls
global.fetch = vi.fn(() => Promise.reject(new Error('No network in tests')));

const mockGameState = {
  timeline: { currentScene: 5, daysRemaining: 20, modelCodeActive: true },
  player: { name: 'Player', party: 'BJP' },
  resources: { budget: 7000000, approvalRating: 45 },
  constituency: { name: 'Varanasi' }
};

// No scandal variant — main decisions are shown
const propsNoScandal = {
  gameState: mockGameState,
  makeDecision: vi.fn(),
  advanceScene: vi.fn(),
  triggerScandal: vi.fn(() => null),
  activateSilencePeriod: vi.fn(),
  markTopicLearned: vi.fn()
};

// With scandal variant
const scandalResponses = [
  { id: 'scandal_A', label: 'Call press conference', impactLabel: '+trust', impact: { urbanSupport: 2 } },
  { id: 'scandal_B', label: 'Stay silent', impactLabel: '-10 approval', impact: { urbanSupport: -10 } }
];
const propsWithScandal = {
  ...propsNoScandal,
  triggerScandal: vi.fn(() => ({
    id: 'test_scandal',
    title: 'Test Scandal',
    description: 'A test scandal.',
    responses: scandalResponses
  })),
  makeDecision: vi.fn()
};

describe('Scene5_PhaseVoting', () => {
  afterEach(() => { vi.clearAllMocks(); });

  it('renders without crashing', () => {
    render(<Scene5_PhaseVoting {...propsNoScandal} />);
  });

  it('scene title is visible', () => {
    render(<Scene5_PhaseVoting {...propsNoScandal} />);
    expect(screen.getByText('India votes in phases')).toBeInTheDocument();
  });

  it('days remaining counter displays correctly', () => {
    render(<Scene5_PhaseVoting {...propsNoScandal} />);
    expect(screen.getByText('Days to Polling: 20')).toBeInTheDocument();
  });

  it('election silence period notice is shown', () => {
    render(<Scene5_PhaseVoting {...propsNoScandal} />);
    expect(screen.getByText('ELECTION SILENCE PERIOD APPROACHING')).toBeInTheDocument();
  });

  it('all main decision options are rendered when no scandal', () => {
    render(<Scene5_PhaseVoting {...propsNoScandal} />);
    expect(screen.getByText('Final mega rally the day before silence period')).toBeInTheDocument();
    expect(screen.getByText('Booth management — deploy agents to all booths')).toBeInTheDocument();
    expect(screen.getByText('National TV interview')).toBeInTheDocument();
  });

  it('scandal appears when triggerScandal returns a scandal', () => {
    render(<Scene5_PhaseVoting {...propsWithScandal} />);
    expect(screen.getByText('BREAKING: Scandal Surfaced!')).toBeInTheDocument();
  });

  it('clicking a scandal response calls makeDecision()', () => {
    render(<Scene5_PhaseVoting {...propsWithScandal} />);
    const responseBtn = screen.getByText('Stay silent');
    fireEvent.click(responseBtn);
    expect(propsWithScandal.makeDecision).toHaveBeenCalledWith('scandal_response', expect.any(Object));
  });

  it('advancing to next scene calls advanceScene()', () => {
    render(<Scene5_PhaseVoting {...propsNoScandal} />);
    fireEvent.click(screen.getByText('National TV interview'));
    const btn = screen.getByText('Go to Counting Day');
    fireEvent.click(btn);
    expect(propsNoScandal.advanceScene).toHaveBeenCalledWith(6);
  });

  it('has no accessibility violations when no scandal', async () => {
    const { container } = render(<Scene5_PhaseVoting {...propsNoScandal} />);
    const axeResults = await axe(container);
    expect(axeResults).toHaveNoViolations();
  });
});
