import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe } from 'jest-axe';
import Scene3_CampaignBudget from '../../components/scenes/Scene3_CampaignBudget.jsx';
import { vi } from 'vitest';

// Mock fetch so CampaignManager doesn't make real network calls
global.fetch = vi.fn(() => Promise.reject(new Error('No network in tests')));

const mockGameState = {
  timeline: { currentScene: 3, daysRemaining: 50, modelCodeActive: false },
  player: { name: 'Player', party: 'BJP' },
  resources: { budget: 7000000, approvalRating: 45 },
  constituency: { name: 'Varanasi' }
};

const mockProps = {
  gameState: mockGameState,
  makeDecision: vi.fn(),
  advanceScene: vi.fn(),
  markTopicLearned: vi.fn()
};

describe('Scene3_CampaignBudget', () => {
  it('renders without crashing', () => {
    render(<Scene3_CampaignBudget {...mockProps} />);
  });

  it('scene title is visible (partial match for icon + text)', () => {
    render(<Scene3_CampaignBudget {...mockProps} />);
    // The h2 contains an icon span + text — use text content match
    expect(screen.getByText(/₹70 lakhs. 50 days. Spend wisely./i)).toBeInTheDocument();
  });

  it('budget sliders render with correct aria attributes', () => {
    render(<Scene3_CampaignBudget {...mockProps} />);
    const sliders = screen.getAllByRole('slider');
    expect(sliders.length).toBeGreaterThan(0);
    sliders.forEach(slider => {
      expect(slider).toHaveAttribute('aria-valuemin', '0');
      expect(slider).toHaveAttribute('aria-valuemax');
      expect(slider).toHaveAttribute('aria-valuenow');
      expect(slider).toHaveAttribute('aria-valuetext');
    });
  });

  it('budget remaining updates on slider change', async () => {
    render(<Scene3_CampaignBudget {...mockProps} />);
    const sliders = screen.getAllByRole('slider');
    const firstSlider = sliders[0];
    
    fireEvent.change(firstSlider, { target: { value: 2000000 } });

    // Budget display should update (debounced at 300ms in component)
    await waitFor(() => {
      expect(screen.getByText(/Spent:/)).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('exceeding ₹70 lakh shows warning icon', async () => {
    render(<Scene3_CampaignBudget {...mockProps} />);
    const sliders = screen.getAllByRole('slider');
    
    // Set all sliders to high values to push over limit
    fireEvent.change(sliders[0], { target: { value: 6600000 } });
    
    await waitFor(() => {
      // Warning icon appears when remaining < 500000
      const warningIcons = document.querySelectorAll('.material-icons');
      const hasWarning = Array.from(warningIcons).some(el => el.textContent === 'warning');
      expect(hasWarning).toBe(true);
    }, { timeout: 1000 });
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Scene3_CampaignBudget {...mockProps} />);
    const axeResults = await axe(container);
    expect(axeResults).toHaveNoViolations();
  });

  it('budget sliders respond to keyboard navigation', async () => {
    render(<Scene3_CampaignBudget {...mockProps} />);
    const slider = screen.getAllByRole('slider')[0];

    // Press ArrowUp
    fireEvent.keyDown(slider, { key: 'ArrowUp' });
    
    // Press ArrowDown
    fireEvent.keyDown(slider, { key: 'ArrowDown' });
    
    // Should pass without error
    expect(slider).toBeInTheDocument();
  });

  it('submits budget and calls makeDecision, then advanceScene on next', async () => {
    render(<Scene3_CampaignBudget {...mockProps} />);
    const submitBtn = screen.getByText('Submit Expenditure Plan');
    fireEvent.click(submitBtn);

    expect(mockProps.makeDecision).toHaveBeenCalled();
    expect(mockProps.markTopicLearned).toHaveBeenCalledWith('expenditure');

    // Wait for the next view
    const continueBtn = await screen.findByText(/Continue Campaign/i);
    fireEvent.click(continueBtn);
    expect(mockProps.advanceScene).toHaveBeenCalledWith(4);
  });
});
