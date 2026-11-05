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
];
const PRODUCTS = [
  ['Civic Mandate', 'https://2027-street-mandate.vercel.app'],
  ['Civic Brain', 'https://iseyc-civic-brain.vercel.app'],
  ['Observatory', 'https://iseyc-civic-intelligence-observator.vercel.app'],
];
const DEPARTMENTS = [
  ['Education & Capacity Building', 'education'],
  ['Health & Well-being', 'health'],
  ['Software & Technology', 'software-technology'],
  ['Civic Department', 'civic'],
];

export function AppShell() {
  const adapter = useAdapter();
  const { lite, setLite } = useLite();
  return <div className="app-shell">
    <a className="skip" href="#main">Skip to main content</a>
    <aside className="app-sidebar">
      <a className="app-brand" href="#/" aria-label="ISEYC Observatory home">
        <img className="app-brand__mark" src="/iseyc-seal.svg" alt="ISEYC official seal" width="36" height="36" />
        <span className="app-brand__text"><strong>ISEYC</strong><span>Civic Intelligence Observatory</span></span>
      </a>
      <nav className="app-nav" aria-label="Observatory navigation">
        {NAV.map((item) => <NavLink key={item.to} to={item.to} end={item.end}
          className={({ isActive }) => 'app-nav__link' + (isActive ? ' app-nav__link--on' : '')}>{item.label}</NavLink>)}
      </nav>
      <div className="app-ecosystem">
        <span className="app-ecosystem__label">ISEYC digital systems</span>
        {PRODUCTS.map(([label, href], index) => <a key={label} href={href} target="_blank" rel="noopener noreferrer"
          aria-current={index === 2 ? 'page' : undefined}>{label}{index === 2 ? ' · current' : ' ↗'}</a>)}
      </div>
      <nav className="app-departments" aria-label="Institutional departments">
        <span className="app-ecosystem__label">Departments</span>
        {DEPARTMENTS.map(([label, id]) => <NavLink key={id} to={'/departments/' + id}
          className={({ isActive }) => 'app-department-link' + (isActive ? ' app-department-link--on' : '')}>{label}</NavLink>)}
      </nav>
      <div className="app-sidebar__bottom">
        <div className="app-mode" role="status"><span className={'app-mode__dot' + (adapter.mode === 'demo' ? ' app-mode__dot--demo' : '')} />{adapter.label}</div>
        <label className="app-lite"><input type="checkbox" checked={lite} onChange={(event) => setLite(event.target.checked)} />Low data</label>
      </div>
    </aside>
    <main id="main" className="app-main" tabIndex={-1}><div className="app-main__inner"><Outlet /></div></main>
    <footer className="app-footer">
      <div className="app-footer__inner">
        <div className="app-footer__identity"><img src="/iseyc-seal.svg" alt="ISEYC official seal" width="34" height="34" /><span><strong>ISEYC Civic Intelligence Observatory</strong><small>Understanding Public Needs. Interpreting Evidence. Strengthening Accountability.</small></span></div>
        <p>Non-partisan institutional evidence workspace. Published community records are not a representative survey; publication is not independent verification.</p>
        <nav aria-label="Methodology, charter and contact">
          <a href="https://2027-street-mandate.vercel.app/methodology" target="_blank" rel="noopener noreferrer">Methodology</a>
          <a href="https://2027-street-mandate.vercel.app/about" target="_blank" rel="noopener noreferrer">Non-partisan charter</a>
          <a href="https://www.iseyc.com.ng" target="_blank" rel="noopener noreferrer">ISEYC website</a>
          <a href="mailto:iseycglobal@gmail.com">Contact</a>
        </nav>
      </div>
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
