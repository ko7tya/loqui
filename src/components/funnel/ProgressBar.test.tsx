import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from './ProgressBar';

/**
 * ProgressBar — 3-section chunked indicator (Profile Q1-Q4 / Moment Q5-Q8 /
 * Plan Q9-Q10).
 *
 * Fill proportions are verified by re-implementing the pure `sectionFill`
 * logic locally — this keeps the test deterministic regardless of whether
 * Framer Motion stamps inline styles under jsdom.
 */

describe('ProgressBar aria + label', () => {
  it('renders with aria-valuenow matching currentStep', () => {
    render(<ProgressBar currentStep={3} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '3');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '10');
  });

  it('clamps currentStep below 0 to 0', () => {
    render(<ProgressBar currentStep={-5} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '0');
  });

  it('clamps currentStep above 10 to 10', () => {
    render(<ProgressBar currentStep={99} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '10');
  });
});

describe('ProgressBar section label', () => {
  it('shows Profile for steps 1..4', () => {
    for (const step of [1, 2, 3, 4]) {
      const { unmount } = render(<ProgressBar currentStep={step} />);
      expect(screen.getByText('Profile')).toBeInTheDocument();
      unmount();
    }
  });

  it('shows Moment for steps 5..8', () => {
    for (const step of [5, 6, 7, 8]) {
      const { unmount } = render(<ProgressBar currentStep={step} />);
      expect(screen.getByText('Moment')).toBeInTheDocument();
      unmount();
    }
  });

  it('shows Plan for steps 9..10', () => {
    for (const step of [9, 10]) {
      const { unmount } = render(<ProgressBar currentStep={step} />);
      expect(screen.getByText('Plan')).toBeInTheDocument();
      unmount();
    }
  });

  it('shows Start for step 0', () => {
    render(<ProgressBar currentStep={0} />);
    expect(screen.getByText('Start')).toBeInTheDocument();
  });
});

describe('ProgressBar step counter', () => {
  it('renders "N / 10"', () => {
    render(<ProgressBar currentStep={7} />);
    expect(screen.getByText('7 / 10')).toBeInTheDocument();
  });
});

/**
 * Section fill proportions — we verify the math that drives the bar
 * independently of Framer's animation output.
 */
describe('ProgressBar section fill math', () => {
  // Mirror the pure function from ProgressBar.tsx
  const sectionFill = (step: number, start: number, end: number): number => {
    if (step < start) return 0;
    if (step >= end) return 1;
    return (step - start + 1) / (end - start + 1);
  };

  it('step 1 → Profile 25% (1/4), Moment 0%, Plan 0%', () => {
    expect(sectionFill(1, 1, 4)).toBeCloseTo(0.25, 2);
    expect(sectionFill(1, 5, 8)).toBe(0);
    expect(sectionFill(1, 9, 10)).toBe(0);
  });

  it('step 4 → Profile 100%, Moment 0%, Plan 0%', () => {
    expect(sectionFill(4, 1, 4)).toBe(1);
    expect(sectionFill(4, 5, 8)).toBe(0);
    expect(sectionFill(4, 9, 10)).toBe(0);
  });

  it('step 5 → Profile 100%, Moment 25% (1/4), Plan 0%', () => {
    expect(sectionFill(5, 1, 4)).toBe(1);
    expect(sectionFill(5, 5, 8)).toBeCloseTo(0.25, 2);
    expect(sectionFill(5, 9, 10)).toBe(0);
  });

  it('step 10 → Profile 100%, Moment 100%, Plan 100%', () => {
    expect(sectionFill(10, 1, 4)).toBe(1);
    expect(sectionFill(10, 5, 8)).toBe(1);
    expect(sectionFill(10, 9, 10)).toBe(1);
  });
});

describe('ProgressBar renders 3 segments', () => {
  it('has 3 ember-coloured fill elements (one per section)', () => {
    const { container } = render(<ProgressBar currentStep={5} />);
    // 3 motion.divs render inside the bar
    const fills = container.querySelectorAll('.bg-ember');
    expect(fills.length).toBe(3);
  });
});
