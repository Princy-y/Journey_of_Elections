import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import CampaignManager from '../../components/ui/CampaignManager.jsx';
import { vi } from 'vitest';

vi.mock('../../services/geminiAPI.js', () => ({
  callCampaignManager: vi.fn(() => Promise.resolve({
    message: 'Mock message',
    realWorldFact: 'Mock fact',
    tip: 'Mock tip',
    mood: 'encouraging'
  }))
}));

const mockGameState = {
  timeline: { currentScene: 1 }
};

describe('CampaignManager', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Bypass typewriter animation
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });
  
  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('renders loading state initially and then shows message', async () => {
    render(
      <CampaignManager 
        scene="Scene 1" 
        context="Context" 
        playerDecision="Decision" 
        gameState={mockGameState} 
      />
    );
    // Loading skeleton should be present
    expect(document.querySelector('[aria-busy="true"]')).toBeInTheDocument();
    
    await act(async () => {
      vi.runAllTimers();
    });
    
    expect(screen.getByText('Mock message')).toBeInTheDocument();
    expect(screen.getByText('Mock fact')).toBeInTheDocument();
    expect(screen.getByText('Tip: Mock tip')).toBeInTheDocument();
  });

  it('can be dismissed and reopened', async () => {
    render(
      <CampaignManager 
        scene="Scene 1" 
        context="Context" 
        playerDecision="Decision" 
        gameState={mockGameState} 
      />
    );
    
    await act(async () => {
      vi.runAllTimers();
    });

    const closeBtn = screen.getByLabelText('Dismiss panel');
    fireEvent.click(closeBtn);
    
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    
    expect(screen.queryByText('Mock message')).not.toBeInTheDocument();

    const openBtn = screen.getByLabelText('Open Campaign Manager');
    fireEvent.click(openBtn);
    expect(screen.getByText('Mock message')).toBeInTheDocument();
  });
});
