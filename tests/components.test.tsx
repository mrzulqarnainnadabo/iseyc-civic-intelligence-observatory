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
    expect(screen.getByText('Demonstration records')).toBeInTheDocument();
    expect(screen.getByText('National indicators')).toBeInTheDocument();
    expect(screen.queryByText(/Three evidence streams/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Operated by ISEYC/i)).not.toBeInTheDocument();
  });
  it('Overview remains useful with no community records', () => {
    render(wrap(<Overview />, { ...bundle, records: [], evidence: [] }));
    expect(screen.getByText('No demonstration records')).toBeInTheDocument();
    expect(screen.getByText('National indicators')).toBeInTheDocument();
    expect(screen.getByText(/Population, total/)).toBeInTheDocument();
  });
  it('Issues filters by sector and reports empty results without implying no need', () => {
    render(wrap(<Issues />));
    fireEvent.change(screen.getByLabelText('Search records'), { target: { value: 'zzzz-no-match' } });
    expect(screen.getByText(/absence of a match is not absence of need/)).toBeInTheDocument();
  });
  it('Geography selects a state from the table view and lists registered sub-national sources', () => {
    render(wrap(<Geography />));
    fireEvent.click(screen.getByRole('button', { name: 'Table' }));
    fireEvent.click(screen.getByRole('button', { name: 'Select Kaduna' }));
    expect(screen.getByRole('heading', { name: 'Kaduna' })).toBeInTheDocument();
    expect(screen.getByText(/Registered sources that can report at state level or below/)).toBeInTheDocument();
  });
  it('Evidence library shows registry and indicator pilots', () => {
    render(wrap(<Evidence />));
    expect(screen.getByRole('heading', { name: 'Evidence library' })).toBeInTheDocument();
    expect(screen.getAllByText(/National indicator pilots/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Registered sources/i).length).toBeGreaterThan(0);
  });
  it('Evidence shows community evidence items when present', () => {
    render(wrap(<Evidence />));
    expect(screen.getByText(/Demonstration evidence items|Published community evidence items/i)).toBeInTheDocument();
  });
  it('Accountability warns that responsibility mappings are unverified', () => {
    render(wrap(<Accountability />));
    expect(screen.getByText(/Responsibility mappings are unverified/)).toBeInTheDocument();
    expect(screen.getAllByText('Delivery independently verified').length).toBeGreaterThan(0);
  });
  it('Briefs build from scope and carry the caveats', () => {
    render(wrap(<Briefs />));
    expect(screen.getByRole('heading', { name: /Civic Intelligence Brief: All sectors, All states/ })).toBeInTheDocument();
    expect(screen.getByText(/Interface draft/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('State'), { target: { value: 'kaduna' } });
    expect(screen.getByRole('heading', { name: /Civic Intelligence Brief: All sectors, Kaduna/ })).toBeInTheDocument();
    expect(screen.getByText(/Community submissions are not a representative survey/)).toBeInTheDocument();
  });
});