import type { ReactNode } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAdapter, useLite } from '../lib/hooks';
import { Banner } from './feedback';

export const NAV = [
  { to: '/', label: 'Overview', end: true },
  { to: '/issues', label: 'Sectors' },
  { to: '/geography', label: 'Geography' },
  { to: '/evidence', label: 'Evidence' },
  { to: '/accountability', label: 'Accountability' },
  { to: '/briefs', label: 'Briefs' },
];

export function AppShell() {
  const adapter = useAdapter();
  const { lite, setLite } = useLite();
  return (
    <div className="shell">
      <a className="skip" href="#main">Skip to main content</a>
      <header className="topbar">
        <div className="topbar__inner">
          <div className="brand">
            <span className="brand__mark" aria-hidden="true" />
            <div>
              <strong>ISEYC Civic Intelligence Observatory</strong>
              <span className="brand__sub">National civic intelligence · Non-partisan · Operated by ISEYC</span>
            </div>
          </div>
          <label className="lite">
            <input type="checkbox" checked={lite} onChange={(e) => setLite(e.target.checked)} />
            Low-data mode
          </label>
        </div>
        <nav className="nav" aria-label="Main">
          <ul>
            {NAV.map((n) => (
              <li key={n.to}>
                <NavLink
                  to={n.to}
                  end={n.end}
                  className={({ isActive }) => `nav__link${isActive ? ' nav__link--on' : ''}`}
                >
                  {n.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      {adapter.mode === 'demo' ? (
        <Banner tone="demo">
          <strong>Demonstration mode.</strong> Records and evidence items are synthetic. Open without{' '}
          <code>?demo=</code> to load published Civic Mandate records.
        </Banner>
      ) : (
        <Banner tone="info">
          <strong>Published community records</strong> from Civic Mandate (human-reviewed for publication).
          Not a national survey. Publication is not independent verification of delivery.
        </Banner>
      )}
      <main id="main" className="main" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="footer" role="contentinfo">
        <div className="footer__grid">
          <div>
            <h2 className="footer__title">How to read this product</h2>
            <ul className="plain">
              <li>Registered sources are catalogued research targets — not automatically verified findings.</li>
              <li>Community submissions show what was reported after review rules elsewhere, not how common a problem is.</li>
              <li>Referral, announcement, funding, implementation and independent verification stay separate stages.</li>
              <li>Institution links in this build are illustrative until a legal basis is attached and dual-reviewed.</li>
            </ul>
          </div>
          <div>
            <h2 className="footer__title">Boundaries</h2>
            <p>
              <strong>Not</strong> a poll, ranking, endorsement, campaign tool or election forecast.
              Published means human-reviewed for public display, not that a claim is proven.
            </p>
            <p className="muted footer__mode">
              Data mode: <strong>{adapter.mode === 'demo' ? 'demonstration' : adapter.mode}</strong>
              {' · '}
              <span>{adapter.label}</span>
            </p>
            <p className="muted">
              Initiative for Sustainable Evolution for Youth and Community (ISEYC) · Non-partisan civic intelligence
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function PageHeader({ title, lead, children }: { title: string; lead: ReactNode; children?: ReactNode }) {
  return (
    <div className="pagehead">
      <h1>{title}</h1>
      <p className="lead">{lead}</p>
      {children}
    </div>
  );
}

export function Section({
  title,
  id,
  note,
  children,
}: {
  title: string;
  id?: string;
  note?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="section" id={id} aria-labelledby={id ? `${id}-title` : undefined}>
      <div className="section__head">
        <h2 id={id ? `${id}-title` : undefined}>{title}</h2>
        {note ? <p className="section__note">{note}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function Card({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="card">
      {title ? <h3>{title}</h3> : null}
      {children}
    </div>
  );
}
