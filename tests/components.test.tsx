import { describe, expect, it, beforeAll } from 'vitest';
import { fireEvent, render, screen} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { loadBundle } from './helpers';
import { BundleProvider, type Bundle } from '../src/lib/data';
import { AdapterContext } from '../src/lib/hooks';
import { createDemoAdapter } from '../src/adapters/demoAdapter';
import { EvidenceBadge, SyntheticChip } from '../src/design/primitives';
import { NigeriaMap } from '../src/design/map';
import { EmptyState, ErrorState } from '../src/design/feedback';
import Overview from '../src/pages/Overview';
import Geography from '../src/pages/Geography';
import Evidence from '../src/pages/Evidence';
import Accountability from '../src/pages/Accountability';
import Briefs from '../src/pages/Briefs';
import Issues from '../src/pages/Issues';

let bundle: Bundle;
beforeAll(async () => { bundle = await loadBundle(); });
const wrap = (ui: ReactNode, b?: Bundle) => (
  <MemoryRouter><AdapterContext.Provider value={createDemoAdapter({ latencyMs: 0 })}><BundleProvider value={b ?? bundle}>{ui}</BundleProvider></AdapterContext.Provider></MemoryRouter>
);

describe('design system', () => {
  it('badges state the class in words', () => { render(<EvidenceBadge kind="independently-verified" />); expect(screen.getByText(/Independently verified/)).toBeInTheDocument(); });
  it('synthetic chip is explicit', () => { render(<SyntheticChip />); expect(screen.getByText('DEMONSTRATION DATA')).toBeInTheDocument(); });
  it('error state offers a retry and is announced', () => {
    let n = 0; render(<ErrorState message="boom" onRetry={() => { n++; }} />);
    expect(screen.getByRole('alert')).toHaveTextContent('boom'); fireEvent.click(screen.getByRole('button', { name: /try again/i })); expect(n).toBe(1);
  });
  it('empty state renders its explanation', () => { render(<EmptyState title="Nothing here">Because.</EmptyState>); expect(screen.getByText('Because.')).toBeInTheDocument(); });
  it('map exposes every state as a keyboard-operable button', () => {
    let picked = ''; render(<NigeriaMap values={{ kaduna: 3 }} onSelect={id => { picked = id; }} unit="records" ariaLabel="map" />);
    const buttons = screen.getAllByRole('button'); expect(buttons.length).toBe(37);
    const k = screen.getByRole('button', { name: 'Kaduna: 3 records' }); fireEvent.keyDown(k, { key: 'Enter' }); expect(picked).toBe('kaduna');
  });
});

describe('pages', () => {
  it('Overview is a compact national workspace and labels demonstration data', () => {
    render(wrap(<Overview />));
    expect(screen.getByRole('heading', { name: 'Nigeria' })).toBeInTheDocument();
    expect(screen.getByText('Demonstration data')).toBeInTheDocument();
    expect(screen.getAllByText('Demonstration records').length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: 'Indicators that help explain the picture' })).toBeInTheDocument();
    expect(screen.queryByText(/Three evidence streams/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Operated by ISEYC/i)).not.toBeInTheDocument();
  });
  it('Overview remains useful with no community records', () => {
    render(wrap(<Overview />, { ...bundle, records: [], evidence: [] }));
    expect(screen.getByText('No demonstration records')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Indicators that help explain the picture' })).toBeInTheDocument();
    expect(screen.getByText(/Population, total/)).toBeInTheDocument();
  });
  it('Issues filters by sector and reports empty results without implying no need', () => {
    render(wrap(<Issues />));
    fireEvent.change(screen.getByLabelText('Search'), { target: { value: 'zzzz-no-match' } });
    expect(screen.getByText(/A missing match is not evidence that a need is absent/)).toBeInTheDocument();
  });
  it('Places selects a state from the table view and lists source coverage without claiming state observations', () => {
    render(wrap(<Geography />));
    fireEvent.click(screen.getByRole('button', { name: 'Table' }));
    fireEvent.click(screen.getByRole('button', { name: 'Select Kaduna' }));
    expect(screen.getByRole('heading', { name: 'Kaduna' })).toBeInTheDocument();
    expect(screen.getByText(/Registered subnational sources/)).toBeInTheDocument();
    expect(screen.getByText(/does not confirm observations for Kaduna/)).toBeInTheDocument();
  });
  it('Evidence shows national indicators and registered sources', () => {
    render(wrap(<Evidence />));
    expect(screen.getByRole('heading', { name: 'Evidence' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'National indicators' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Source registry' })).toBeInTheDocument();
  });
  it('Evidence shows community evidence items when present', () => {
    render(wrap(<Evidence />));
    expect(screen.getByText(/Demonstration evidence|Community evidence/i)).toBeInTheDocument();
  });
  it('Accountability makes the missing response integration explicit', () => {
    render(wrap(<Accountability />));
    expect(screen.getByText(/No verified institutional responses are connected/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Records ·/ })).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Review' })[0]);
    expect(screen.getByRole('heading', { name: /Demonstration:/ })).toBeInTheDocument();
  });
  it('Briefs builds a draft from scope and carries the caveats', () => {
    render(wrap(<Briefs />));
    expect(screen.getByRole('heading', { name: /Civic Intelligence Brief: All sectors, All states/ })).toBeInTheDocument();
    expect(screen.getByText(/Draft · not approved for publication/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('State'), { target: { value: 'kaduna' } });
    expect(screen.getByRole('heading', { name: /Civic Intelligence Brief: All sectors, Kaduna/ })).toBeInTheDocument();
    expect(screen.getByText(/Community submissions are not a representative survey/)).toBeInTheDocument();
  });
});