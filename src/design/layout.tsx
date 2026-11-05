import type { ReactNode } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAdapter, useLite } from '../lib/hooks';
export const NAV = [
  { to: '/', label: 'Overview', end: true },
  { to: '/issues', label: 'Issues' },
  { to: '/observations', label: 'Observations' },
  { to: '/geography', label: 'Places' },
  { to: '/evidence', label: 'Evidence' },
  { to: '/accountability', label: 'Accountability' },
  { to: '/briefs', label: 'Briefs' },
  { to: '/departments', label: 'Departments' },
];
export function AppShell() {
  const adapter = useAdapter();
  const { lite, setLite } = useLite();
  return <div className="app-shell">
    <a className="skip" href="#main">Skip to main content</a>
    <aside className="app-sidebar">
      <a className="app-brand" href="#/" aria-label="ISEYC Observatory home"><img className="app-brand__mark" src="/iseyc-seal.svg" alt="ISEYC official seal" width="36" height="36" /><span className="app-brand__text"><strong>ISEYC</strong><span>Civic Intelligence Observatory</span></span></a>
      <nav className="app-nav" aria-label="Main navigation">{NAV.map((item) => <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => 'app-nav__link' + (isActive ? ' app-nav__link--on' : '')}>{item.label}</NavLink>)}</nav>
      <div className="app-departments" aria-label="Department entry points">
        <span>DEPARTMENTS</span>
        <NavLink to="/departments/education">Education</NavLink>
        <NavLink to="/departments/health">Health</NavLink>
        <NavLink to="/departments/software-technology">Software &amp; Technology</NavLink>
        <NavLink to="/departments/civic">Civic</NavLink>
      </div>
      <div className="app-sidebar__bottom">
        <div className="app-mode" role="status"><span className={'app-mode__dot' + (adapter.mode === 'demo' ? ' app-mode__dot--demo' : '')} />{adapter.label}</div>
        <label className="app-lite"><input type="checkbox" checked={lite} onChange={(event) => setLite(event.target.checked)} />Low data</label>
        <div className="app-products" aria-label="ISEYC public products">
          <a href="https://2027-street-mandate.vercel.app" target="_blank" rel="noopener noreferrer">Mandate ↗</a>
          <a href="https://iseyc-civic-brain.vercel.app" target="_blank" rel="noopener noreferrer">Brain ↗</a>
          <a href="https://iseyc-civic-intelligence-observator.vercel.app" aria-current="page">Observatory</a>
        </div>
      </div>
    </aside>
    <main id="main" className="app-main" tabIndex={-1}><div className="app-main__inner"><Outlet /></div><footer className="app-footer"><p><strong>ISEYC · Understanding Public Needs. Interpreting Evidence. Strengthening Accountability.</strong></p><p>Non-partisan civic intelligence. Published community records are not prevalence estimates; publication is not independent verification.</p><div><a href="https://github.com/mrzulqarnainnadabo/iseyc-civic-intelligence-observatory/blob/main/docs/EVIDENCE-GATEWAY.md" target="_blank" rel="noopener noreferrer">Methodology</a><a href="https://github.com/mrzulqarnainnadabo/iseyc-civic-intelligence-observatory/blob/main/docs/PRODUCT-OPERATING-MODEL-v1.md" target="_blank" rel="noopener noreferrer">Non-partisan operating principles</a></div></footer></main>
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