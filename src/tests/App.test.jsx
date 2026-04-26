import React from 'react';
import { render, screen, act } from '@testing-library/react';
import App from '../App.jsx';
import { vi } from 'vitest';

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('App', () => {
  it('renders landing page initially', () => {
    render(<App />);
    expect(screen.getByText(/Journey of Elections/)).toBeInTheDocument();
  });
});
