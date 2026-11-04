import type { ReactNode } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAdapter, useLite } from '../lib/hooks';
export const NAV = [
  { to: '/', label: 'Overview', end: true },
  { to: '/issues', label: 'Issues' },
  { to: '/geography', label: 'Places' },
  { to: '/evidence', label: 'Evidence' },
  { to: '/accountability', label: 'Accountability' },
  { to: '/briefs', label: 'Briefs' },
];
export function AppShell() {
  const adapter = useAdapter();
  const { lite, setLite } = useLite();
  return <div className="app-shell">
    <a className="skip" href="#main">Skip to main content</a>
    <aside className="app-sidebar">
      <a className="app-brand" href="#/" aria-label="ISEYC Observatory home"><span className="app-brand__mark" aria-hidden="true" /><span className="app-brand__name">Observatory</span></a>
      <nav className="app-nav" aria-label="Main navigation">{NAV.map((item) => <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => 'app-nav__link' + (isActive ? ' app-nav__link--on' : '')}>{item.label}</NavLink>)}</nav>
      <div className="app-sidebar__bottom">
        <div className="app-mode" role="status"><span className={'app-mode__dot' + (adapter.mode === 'demo' ? ' app-mode__dot--demo' : '')} />{adapter.mode === 'demo' ? 'Demonstration data' : 'Civic Mandate feed'}</div>
        <label className="app-lite"><input type="checkbox" checked={lite} onChange={(event) => setLite(event.target.checked)} />Low data</label>
      </div>
    </aside>
    <main id="main" className="app-main" tabIndex={-1}><div className="app-main__inner"><Outlet /></div></main>
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