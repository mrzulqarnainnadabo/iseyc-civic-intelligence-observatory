import '../styles/national-snapshots.css';
import { useEffect, useMemo, useState } from 'react';

type Snapshot = {
  id: string; title: string; value: number; unit: string; valueQualifier?: string; referencePeriod: string;
  measurementType: string; geoLevel: string; geographicCoverage: string; sourceId: string; sourceUpdateDate?: string;
  sourcePublisher: string; sourceUrl: string; departments: string[]; interpretation: string;
  limitations: string[]; verificationStatus?: string; recordStatus?: 'current' | 'superseded'; supersededBy?: string;
};
type CatalogueSource = { id: string; publisher: string; title: string; url: string; status: string; note: string; departments: string[] };
type SnapshotBundle = { contractVersion: string; status: string; checkedAt: string; observations: Snapshot[]; catalogOnlySources: CatalogueSource[]; limitations: string[]; reconciliationNotes?: { id: string; severity: string; title: string; detail: string }[]; stateBudgetCoverage?: { officialStateSourceRoutesLocated: number; totalStates: number; budgitHealthActualExpenditureStates: number; budgitHealthActualExpenditureMissingStates: string[] } };

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
    fetch('/api/evidence/source-snapshots', { headers: { Accept: 'application/json' } })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || data?.contractVersion !== '1.0.0' || !Array.isArray(data.observations)) throw new Error('Snapshot source unavailable');
        if (alive) { setBundle(data); setStatus('ready'); }
      })
      .catch(() => { if (alive) setStatus('unavailable'); });
    return () => { alive = false; };
  }, []);

  const observations = useMemo(() => (bundle?.observations || []).filter((item) => item.recordStatus !== "superseded" && (!departmentId || item.departments.includes(departmentId))), [bundle, departmentId]);
  const catalogOnly = useMemo(() => (bundle?.catalogOnlySources || []).filter((item) => !departmentId || item.departments.includes(departmentId)), [bundle, departmentId]);
  const visibleObservations = showAll ? observations : observations.slice(0, 6);
  const visibleCatalogue = showAllCatalogue ? catalogOnly : catalogOnly.slice(0, 3);

  return (
    <section className={compact ? 'national-snapshots national-snapshots--compact' : 'national-snapshots'} aria-labelledby={departmentId ? 'department-snapshots-title' : 'national-snapshots-title'}>
      <div className="national-snapshots__head">
        <div><span className="national-snapshots__kicker">Source-attributed data</span><h2 id={departmentId ? 'department-snapshots-title' : 'national-snapshots-title'}>{departmentId ? 'Evidence context for this department' : 'National evidence snapshots'}</h2></div>
      {status === 'ready' && bundle?.stateBudgetCoverage && <p className="national-snapshots__coverage">State budget portals located · {bundle.stateBudgetCoverage.officialStateSourceRoutesLocated}/{bundle.stateBudgetCoverage.totalStates} · H1 2026 health expenditure report · {bundle.stateBudgetCoverage.budgitHealthActualExpenditureStates}/36 states</p>}
      {status === 'ready' && (bundle?.reconciliationNotes?.length || 0) > 0 && <details className="national-snapshots__quality"><summary>Data quality notes · {bundle?.reconciliationNotes?.length}</summary><ul>{bundle?.reconciliationNotes?.map((note) => <li key={note.id}><strong>{note.title}.</strong> {note.detail}</li>)}</ul></details>}
        <span className="national-snapshots__meta">{status === 'ready' ? observations.length + ' snapshots · checked ' + bundle?.checkedAt : status === 'loading' ? 'Loading source snapshots' : 'Snapshot service unavailable'}</span>
      </div>
      {status === 'loading' ? <p className="national-snapshots__empty">Retrieving curated source snapshots…</p> :
       status === 'unavailable' ? <p className="national-snapshots__empty">Source snapshots could not be loaded. No substitute figures are displayed.</p> :
       observations.length ? (
         <>
           <div className="national-snapshot-grid">{visibleObservations.map((item) => (
             <article className="national-snapshot" key={item.id}>
               <div className="national-snapshot__top"><span>{item.measurementType}</span><span>{item.geographicCoverage}</span></div>
               {item.verificationStatus === "reconciliation_required" && <p className="national-snapshot__status national-snapshot__status--warning">Published figure · reconciliation required</p>}
               {item.verificationStatus === "published_secondary_report" && <p className="national-snapshot__status">Secondary report · not independently verified by ISEYC</p>}
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
        <div className="national-catalogue__grid">{visibleCatalogue.map((item) => <article key={item.id}><span>{item.publisher} · {item.status === "partial" ? "Partial integration" : item.status === "reconciliation_required" ? "Reconciliation required" : item.status === "superseded" ? "Superseded source" : "Catalogue only"}</span><strong>{item.title}</strong><details><summary>Coverage & access</summary><p>{item.note}</p></details><a href={item.url} target="_blank" rel="noopener noreferrer">Open source ↗</a></article>)}</div>
      </div>}
      {catalogOnly.length > 3 && <button type="button" className="national-snapshots__toggle" onClick={() => setShowAllCatalogue((value) => !value)}>{showAllCatalogue ? "Show fewer sources" : "View all " + catalogOnly.length + " sources"}</button>}
      {!compact && <p className="national-snapshots__disclaimer">Curated transcriptions, not live feeds. Source publishers own the original data. A national statistic is not a local service-delivery finding.</p>}
    </section>
  );
}
