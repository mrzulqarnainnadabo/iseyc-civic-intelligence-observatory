import '../styles/national-snapshots.css';
import stateBudgetCoverage from '../data/indicators/state-budget-source-coverage.v1.json';
import { useEffect, useMemo, useState } from 'react';

type Snapshot = {
  id: string; title: string; value: number; unit: string; valueQualifier?: string; referencePeriod: string;
  measurementType: string; geoLevel: string; geographicCoverage: string; sourceId: string; sourceUpdateDate?: string;
  sourcePublisher: string; sourceUrl: string; departments: string[]; interpretation: string;
  limitations: string[];
};
type CatalogueSource = { id: string; publisher: string; title: string; url: string; status: string; note: string; departments: string[] };
type ReconciliationNote = { id: string; severity: 'high' | 'medium' | 'low'; title: string; detail: string; action: string };
type SnapshotBundle = { contractVersion: string; status: string; checkedAt: string; observations: Snapshot[]; catalogOnlySources: CatalogueSource[]; reconciliationNotes: ReconciliationNote[]; limitations: string[] };
type FiscalTransparency = { quarter: string; citizensBudget: { score: number; max: number }; quarterlyBir: { score: number; max: number }; eProcurement: { score: number; max: number }; fiscalWebsite: { score: number; max: number }; totalScore: number; sourceId: string };
type BudgetJurisdiction = { name: string; type: 'state' | 'fct'; status: string; officialPortalUrl: string | null; documentsLocated: string[]; note: string; fiscalTransparency?: FiscalTransparency };
const budgetJurisdictions = stateBudgetCoverage.jurisdictions as BudgetJurisdiction[];
const locatedStatePortals = budgetJurisdictions.filter((item) => item.type === 'state' && item.status === 'official_portal_located').length;

const DEPARTMENT_LABEL: Record<string, string> = {
  education: 'Education & Capacity Building', health: 'Health & Well-being',
  'software-technology': 'Software & Technology', civic: 'Civic Department',
};

function valueLabel(value: number, unit: string, qualifier?: string) {
  const formatted = value.toLocaleString('en-NG', { maximumFractionDigits: 2 });
  return (qualifier ? qualifier + ' ' : '') + formatted + (unit.startsWith('%') ? ' ' + unit : ' ' + unit);
}

export default function NationalSnapshots({ departmentId, compact = false }: { departmentId?: string; compact?: boolean }) {
  const [bundle, setBundle] = useState<SnapshotBundle | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [showAllCatalogue, setShowAllCatalogue] = useState(false);
  const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading');
  useEffect(() => {
    let alive = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    fetch('/api/evidence/source-snapshots', { headers: { Accept: 'application/json' }, signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || data?.contractVersion !== '1.0.0' || !Array.isArray(data.observations) || !Array.isArray(data.catalogOnlySources) || !Array.isArray(data.reconciliationNotes)) throw new Error('Snapshot source unavailable');
        if (alive) { setBundle(data); setStatus('ready'); }
      })
      .catch(() => { if (alive) setStatus('unavailable'); })
      .finally(() => clearTimeout(timeout));
    return () => { alive = false; controller.abort(); clearTimeout(timeout); };
  }, []);

  const observations = useMemo(() => (bundle?.observations || []).filter((item) => !departmentId || item.departments.includes(departmentId)), [bundle, departmentId]);
  const catalogOnly = useMemo(() => (bundle?.catalogOnlySources || []).filter((item) => !departmentId || item.departments.includes(departmentId)), [bundle, departmentId]);
  const visibleObservations = showAll ? observations : observations.slice(0, 6);
  const visibleCatalogue = showAllCatalogue ? catalogOnly : catalogOnly.slice(0, 3);

  return (
    <section className={compact ? 'national-snapshots national-snapshots--compact' : 'national-snapshots'} aria-labelledby={departmentId ? 'department-snapshots-title' : 'national-snapshots-title'}>
      <div className="national-snapshots__head">
        <div><span className="national-snapshots__kicker">Source-attributed data</span><h2 id={departmentId ? 'department-snapshots-title' : 'national-snapshots-title'}>{departmentId ? 'Evidence context for this department' : 'National evidence snapshots'}</h2></div>
        <span className="national-snapshots__meta">{status === 'ready' ? observations.length + ' snapshots · checked ' + bundle?.checkedAt : status === 'loading' ? 'Loading source snapshots' : 'Snapshot service unavailable'}</span>
      </div>
      {status === 'loading' ? <p className="national-snapshots__empty">Retrieving curated source snapshots…</p> :
       status === 'unavailable' ? <p className="national-snapshots__empty">Source snapshots could not be loaded. No substitute figures are displayed.</p> :
       observations.length ? (
         <>
           <div className="national-snapshot-grid">{visibleObservations.map((item) => (
             <article className="national-snapshot" key={item.id}>
               <div className="national-snapshot__top"><span>{item.measurementType}</span><span>{item.geographicCoverage}</span></div>
               <h3>{item.title}</h3>
               <strong className="national-snapshot__value">{valueLabel(item.value, item.unit, item.valueQualifier)}</strong>
               <p className="national-snapshot__period">Reference period · {item.referencePeriod}{item.sourceUpdateDate ? ' · Source generated ' + item.sourceUpdateDate : ''}</p>
               <p className="national-snapshot__publisher">{item.sourcePublisher}</p>
               <p className="national-snapshot__interpretation">{item.interpretation}</p>
               <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">Original source ↗</a>
               <details><summary>Limitations</summary><ul>{item.limitations.map((limit) => <li key={limit}>{limit}</li>)}</ul></details>
             </article>
           ))}</div>
           {observations.length > 6 && <button type="button" className="national-snapshots__toggle" onClick={() => setShowAll((value) => !value)}>{showAll ? 'Show fewer snapshots' : 'Show all ' + observations.length + ' snapshots'}</button>}
         </>
       ) : <p className="national-snapshots__empty">No curated snapshot is currently assigned to {departmentId ? DEPARTMENT_LABEL[departmentId] || 'this department' : 'this view'}.</p>}
      {catalogOnly.length > 0 && <div className="national-catalogue">
        <div className="national-catalogue__head"><strong>Sources under assessment</strong><span>Catalogue status is source-specific</span></div>
        <div className="national-catalogue__grid">{visibleCatalogue.map((item) => <article key={item.id}><span>{item.publisher} · {item.status === "partial" ? "Partial integration" : item.status === "under_review" ? "Under review" : "Catalogue only"}</span><strong>{item.title}</strong><details><summary>Coverage & access</summary><p>{item.note}</p></details><a href={item.url} target="_blank" rel="noopener noreferrer">Open source ↗</a></article>)}</div>
      </div>}
      {catalogOnly.length > 3 && <button type="button" className="national-snapshots__toggle" onClick={() => setShowAllCatalogue((value) => !value)}>{showAllCatalogue ? "Show fewer sources" : "View all " + catalogOnly.length + " sources"}</button>}
      {bundle?.reconciliationNotes?.length > 0 && <details className="national-snapshots__reconciliation">
        <summary>Data reconciliation · {bundle.reconciliationNotes.length} documented issues</summary>
        <div>{bundle.reconciliationNotes.map((item) => <article key={item.id}>
          <span className={`national-snapshots__severity national-snapshots__severity--${item.severity}`}>{item.severity} priority</span>
          <strong>{item.title}</strong><p>{item.detail}</p><em>Action: {item.action}</em>
        </article>)}</div>
      </details>}
      {!compact && <details className="state-budget-coverage">
        <summary>State budget source coverage · {locatedStatePortals} of 36 official portals located</summary>
        <p>Portal discovery is not data extraction. Each state still requires its approved budget, appropriation law, MTEF/MTSS, quarterly implementation reports and audited outturn. States marked “not reviewed” are not being described as having no public data.</p>
        <ul>{budgetJurisdictions.map((item) => <li key={item.name}>
          <strong>{item.name}</strong>
          <span>{item.type === 'fct' ? 'FCT · tracked separately' : item.status === 'official_portal_located' ? 'Official portal located · extraction pending' : 'Source discovery not completed'}</span>
          {item.officialPortalUrl ? <a href={item.officialPortalUrl} target="_blank" rel="noopener noreferrer">Official portal ↗</a> : <small>{item.note}</small>}
        </li>)}</ul>
        <section className="state-budget-coverage__score">
          <h3>Fiscal information availability · Q2 2026</h3>
          <p>BudgIT scores all 36 states on citizens' budgets (15), quarterly BIRs (16), e-procurement portals (11) and fiscal-data websites (12). The normalized score is about public fiscal information availability—not service quality or government performance.</p>
          <div className="state-budget-coverage__table-wrap"><table>
            <thead><tr><th>State</th><th>Citizens' budget</th><th>Quarterly BIR</th><th>e-Procurement</th><th>Fiscal website</th><th>Total</th></tr></thead>
            <tbody>{budgetJurisdictions.filter((item) => item.type === 'state').map((item) => <tr key={item.name}>
              <th scope="row">{item.name}</th>
              <td>{item.fiscalTransparency?.citizensBudget.score}/{item.fiscalTransparency?.citizensBudget.max}</td>
              <td>{item.fiscalTransparency?.quarterlyBir.score}/{item.fiscalTransparency?.quarterlyBir.max}</td>
              <td>{item.fiscalTransparency?.eProcurement.score}/{item.fiscalTransparency?.eProcurement.max}</td>
              <td>{item.fiscalTransparency?.fiscalWebsite.score}/{item.fiscalTransparency?.fiscalWebsite.max}</td>
              <td><strong>{item.fiscalTransparency?.totalScore}%</strong></td>
            </tr>)}</tbody>
          </table></div>
          <p className="state-budget-coverage__source">Source: <a href="https://fiscalleague.budgit.org/latest-ranking" target="_blank" rel="noopener noreferrer">BudgIT States Fiscal Transparency League · Q2 2026 ↗</a>. The source spells Nasarawa as “Nassarawa”; the Observatory normalises the state name.</p>
        </section>
        <div className="state-budget-coverage__comparisons">{stateBudgetCoverage.comparativeSources.map((source) => <p key={source.id}><strong>{source.coverage}</strong> — {source.note} <a href={source.url} target="_blank" rel="noopener noreferrer">Source ↗</a></p>)}</div>
      </details>}
      {!compact && <p className="national-snapshots__disclaimer">Curated transcriptions, not live feeds. Source publishers own the original data. A national statistic is not a local service-delivery finding.</p>}
    </section>
  );
}
