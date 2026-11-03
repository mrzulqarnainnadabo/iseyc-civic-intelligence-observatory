import type { ReactNode } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAdapter, useLite } from '../lib/hooks';
import { Banner } from './feedback';

export const NAV = [
  { to: '/', label: 'Overview', end: true },
  { to: '/issues', label: 'Issues and sectors' },
  { to: '/geography', label: 'Geography' },
  { to: '/evidence', label: 'Evidence' },
  { to: '/accountability', label: 'Accountability' },
  { to: '/briefs', label: 'Briefs' },
];

export function AppShell() {
  const adapter = useAdapter(); const { lite, setLite } = useLite();
  return (
    <div className="shell">
      <a className="skip" href="#main">Skip to main content</a>
      <header className="topbar">
        <div className="topbar__inner">
          <div className="brand"><span className="brand__mark" aria-hidden="true" /><div><strong>ISEYC Civic Intelligence Observatory</strong><span className="brand__sub">Evidence-led public intelligence. Non-partisan.</span></div></div>
          <label className="lite"><input type="checkbox" checked={lite} onChange={e => setLite(e.target.checked)} /> Low-data mode</label>
        </div>
        <nav className="nav" aria-label="Main">
          <ul>{NAV.map(n => <li key={n.to}><NavLink to={n.to} end={n.end} className={({ isActive }) => `nav__link${isActive ? ' nav__link--on' : ''}`}>{n.label}</NavLink></li>)}</ul>
        </nav>
      </header>
      {adapter.mode === 'demo' && <Banner tone="demo"><strong>Demonstration build.</strong> The source registry and map are real project data. All civic records, evidence items and institution links are <strong>synthetic</strong> and say nothing about any real place.</Banner>}
      <main id="main" className="main" tabIndex={-1}><Outlet /></main>
      <footer className="footer">
        <p><strong>What this is not:</strong> a poll, a ranking, an endorsement, a campaign tool or an election forecast. Community submissions are not a representative survey. Published means reviewed, not proven.</p>
        <p className="muted">ISEYC, Initiative for Sustainable Evolution for Youth and Community, Abuja. Prototype v0.1. Not connected to the live Civic Mandate or Civic Brain deployments.</p>
      </footer>
    </div>
  );
}

export function PageHeader({ title, lead, children }: { title: string; lead: ReactNode; children?: ReactNode }) {
  return <div className="pagehead"><h1>{title}</h1><p className="lead">{lead}</p>{children}</div>;
}
export function Section({ title, id, children, note }: { title: string; id?: string; children: ReactNode; note?: ReactNode }) {
  return <section className="section" aria-labelledby={id}><h2 id={id}>{title}</h2>{note && <p className="muted section__note">{note}</p>}{children}</section>;
}
