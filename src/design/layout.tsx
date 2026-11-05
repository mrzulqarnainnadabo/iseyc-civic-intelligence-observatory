import type { ReactNode } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAdapter, useLite } from '../lib/hooks';
import { useBundle } from '../lib/data';
export const NAV = [
  { to: '/', label: 'Overview', end: true },
  { to: '/issues', label: 'Issues' },
  { to: '/observations', label: 'Observations' },
  { to: '/geography', label: 'Places' },
  { to: '/evidence', label: 'Evidence' },
  { to: '/accountability', label: 'Accountability' },
  { to: '/briefs', label: 'Briefs' },
];
export function AppShell() {
  const adapter = useAdapter();
  const { lite, setLite } = useLite();
  const { communityRecordProvenance } = useBundle();
  return <div className="app-shell">
    <a className="skip" href="#main">Skip to main content</a>
    <aside className="app-sidebar">
      <a className="app-brand" href="#/" aria-label="ISEYC Observatory home"><img className="app-brand__mark" src="/iseyc-seal.svg" alt="ISEYC official seal" width="36" height="36" /><span className="app-brand__text"><strong>ISEYC</strong><span>Civic Intelligence Observatory</span></span></a>
      <nav className="app-nav" aria-label="Main navigation">{NAV.map((item) => <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => 'app-nav__link' + (isActive ? ' app-nav__link--on' : '')}>{item.label}</NavLink>)}</nav>
      <div className="app-nav-section">
        <p className="app-nav-section__label">ISEYC products</p>
        <a className="app-nav__link" href="https://2027-street-mandate.vercel.app" target="_blank" rel="noopener noreferrer">Civic Mandate</a>
        <a className="app-nav__link" href="https://iseyc-civic-brain.vercel.app" target="_blank" rel="noopener noreferrer">Civic Brain</a>
        <a className="app-nav__link" href="https://iseyc-civic-intelligence-observator.vercel.app" aria-current="page">Observatory</a>
      </div>
      <div className="app-nav-section">
        <p className="app-nav-section__label">Departments</p>
        <NavLink className="app-nav__link" to="/departments/education">Education &amp; Capacity Building</NavLink>
        <NavLink className="app-nav__link" to="/departments/health">Health &amp; Well-being</NavLink>
        <NavLink className="app-nav__link" to="/departments/software-technology">Software &amp; Technology</NavLink>
        <NavLink className="app-nav__link" to="/departments/civic">Civic Department</NavLink>
      </div>
      <div className="app-sidebar__bottom">
        <div className="app-mode" role="status"><span className={'app-mode__dot' + (adapter.mode === 'demo' ? ' app-mode__dot--demo' : '')} />{adapter.label}</div>
        {communityRecordProvenance && <div className="app-feed-status" role="status">
          <strong>Community feed: {communityRecordProvenance.status}</strong>
          {communityRecordProvenance.fallbackReason && <span>Reason: {communityRecordProvenance.fallbackReason}</span>}
        </div>}
        <label className="app-lite"><input type="checkbox" checked={lite} onChange={(event) => setLite(event.target.checked)} />Low data</label>
      </div>
    </aside>
    <main id="main" className="app-main" tabIndex={-1}><div className="app-main__inner"><Outlet /></div></main>
    <footer className="app-footer">
      <div><strong>ISEYC · Strictly non-partisan</strong><span>Understanding Public Needs. Interpreting Evidence. Strengthening Accountability.</span></div>
      <nav aria-label="Institutional links">
        <a href="https://2027-street-mandate.vercel.app/methodology" target="_blank" rel="noopener noreferrer">Methodology</a>
        <a href="https://2027-street-mandate.vercel.app/about" target="_blank" rel="noopener noreferrer">Non-partisan charter</a>
        <a href="mailto:iseycglobal@gmail.com">Contact ISEYC</a>
      </nav>
    </footer>
  </div>;
}
export function PageHeader({ title, lead, children }: { title: string; lead?: ReactNode; children?: ReactNode }) {
  return <header className="page-heading"><h1>{title}</h1>{lead ? <div className="page-heading__meta">{lead}</div> : null}{children}</header>;
}
export function Section({ title, id, note, children }: { title: string; id?: string; note?: ReactNode; children: ReactNode }) {
  return <section className="workspace-section" id={id} aria-labelledby={id ? id + '-title' : undefined}>
    <div className="workspace-section__head"><h2 id={id ? id + '-title' : undefined}>{title}</h2>{note ? <div className="page-heading__meta">{note}</div> : null}</div>{children}
  </section>;
}
export function Card({ title, children }: { title?: string; children: ReactNode }) {
  return <div className="workspace-stat">{title ? <span className="workspace-stat__label">{title}</span> : null}{children}</div>;
}