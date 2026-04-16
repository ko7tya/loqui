import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Q8Coach } from './Q8Coach';
import { useFunnelStore } from '@/lib/state';
import { COACHES, COACHES_ORDER } from '@/content/coaches';

/**
 * Q8Coach coach-selection screen.
 *
 * Verifies: 4 cards render with names + accents, clicking updates the store,
 * CTA gates on selection, CTA fires onNext on click.
 */

describe('Q8Coach', () => {
  beforeEach(() => {
    useFunnelStore.getState().reset();
    // A segment is required for the subcopy lookup.
    useFunnelStore.getState().setQ3('career');
    // Silence analytics console noise during renders.
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('renders 4 coach cards with correct names and accents', () => {
    render(<Q8Coach direction={1} onNext={() => {}} onBack={() => {}} />);
    for (const id of COACHES_ORDER) {
      const coach = COACHES[id];
      expect(screen.getByText(coach.name)).toBeInTheDocument();
      expect(screen.getAllByText(coach.accent).length).toBeGreaterThan(0);
    }
  });

  it('clicking a coach card updates the store', async () => {
    const user = userEvent.setup();
    render(<Q8Coach direction={1} onNext={() => {}} onBack={() => {}} />);
    const helenCard = screen.getByRole('radio', {
      name: /helen/i,
    });
    await user.click(helenCard);
    expect(useFunnelStore.getState().answers.q8_coach).toBe('helen');
    expect(useFunnelStore.getState().answers.q8_style).toBe(COACHES.helen.style);
  });

  it('Build my plan CTA is disabled until a coach is selected', () => {
    render(<Q8Coach direction={1} onNext={() => {}} onBack={() => {}} />);
    const cta = screen.getByRole('button', { name: /build my plan/i });
    expect(cta).toBeDisabled();
  });

  it('Build my plan CTA enables after selection', async () => {
    const user = userEvent.setup();
    render(<Q8Coach direction={1} onNext={() => {}} onBack={() => {}} />);
    await user.click(screen.getByRole('radio', { name: /aiko/i }));
    const cta = screen.getByRole('button', { name: /build my plan/i });
    expect(cta).toBeEnabled();
  });

  it('clicking Build my plan calls onNext', async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();
    render(<Q8Coach direction={1} onNext={onNext} onBack={() => {}} />);
    await user.click(screen.getByRole('radio', { name: /marcus/i }));
    await user.click(screen.getByRole('button', { name: /build my plan/i }));
    expect(onNext).toHaveBeenCalledOnce();
  });
});
