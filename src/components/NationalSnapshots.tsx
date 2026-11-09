import '../styles/national-snapshots.css';
import { useEffect, useMemo, useState } from 'react';

type Snapshot = {
  id: string; title: string; value: number; unit: string; valueQualifier?: string; referencePeriod: string;
  measurementType: string; geoLevel: string; geographicCoverage: string; sourceId: string;
  sourcePublisher: string; sourceUrl: string; departments: string[]; interpretation: string;
  limitations: string[];
};
type CatalogueSource = { id: string; publisher: string; title: string; url: string; status: string; note: string; departments: string[] };
type SnapshotBundle = { contractVersion: string; status: string; checkedAt: string; observations: Snapshot[]; catalogOnlySources: CatalogueSource[]; limitations: string[] };

const DEPARTMENT_LABEL: Record<string, string> = {
  education: 'Education & Capacity Building', health: 'Health & Well-being',
  'software-technology': 'Software & Technology', civic: 'Civic Department',
};

function valueLabel(value: number, unit: string, qualifier?: string) {
  const formatted = value >= 1_000_000
    ? (value / 1_000_000).toLocaleString('en-NG', { maximumFractionDigits: 2 }) + ' million'
    : value.toLocaleString('en-NG', { maximumFractionDigits: 1 });
  return (qualifier ? qualifier + ' ' : '') + formatted + (unit.startsWith('%') ? ' ' + unit : ' ' + unit);
}

export default function NationalSnapshots({ departmentId, compact = false }: { departmentId?: string; compact?: boolean }) {
  const [bundle, setBundle] = useState<SnapshotBundle | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading');
  useEffect(() => {
    let alive = true;
    fetch('/api/evidence/snapshots', { headers: { Accept: 'application/json' } })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || data?.contractVersion !== '1.0.0' || !Array.isArray(data.observations)) throw new Error('Snapshot source unavailable');
        if (alive) { setBundle(data); setStatus('ready'); }
      })
      .catch(() => { if (alive) setStatus('unavailable'); });
    return () => { alive = false; };
  }, []);

  const observations = useMemo(() => (bundle?.observations || []).filter((item) => !departmentId || item.departments.includes(departmentId)), [bundle, departmentId]);
  const catalogOnly = useMemo(() => (bundle?.catalogOnlySources || []).filter((item) => !departmentId || item.departments.includes(departmentId)), [bundle, departmentId]);

  return (
    <section className={compact ? 'national-snapshots national-snapshots--compact' : 'national-snapshots'} aria-labelledby={departmentId ? 'department-snapshots-title' : 'national-snapshots-title'}>
      <div className="national-snapshots__head">
        <div><span className="national-snapshots__kicker">Source-attributed data</span><h2 id={departmentId ? 'department-snapshots-title' : 'national-snapshots-title'}>{departmentId ? 'National context for this department' : 'National evidence snapshots'}</h2></div>
        <span className="national-snapshots__meta">{status === 'ready' ? 'Checked ' + bundle?.checkedAt : status === 'loading' ? 'Loading source snapshots' : 'Snapshot service unavailable'}</span>
      </div>
      {status === 'loading' ? <p className="national-snapshots__empty">Retrieving curated source snapshots…</p> :
       status === 'unavailable' ? <p className="national-snapshots__empty">Source snapshots could not be loaded. No substitute figures are displayed.</p> :
       observations.length ? <div className="national-snapshot-grid">{observations.map((item) => (
         <article className="national-snapshot" key={item.id}>
           <div className="national-snapshot__top"><span>{item.measurementType}</span><span>{item.geoLevel === 'national' ? 'National' : item.geoLevel === 'varies' ? 'Multi-level' : item.geoLevel}</span></div>
           <h3>{item.title}</h3>
           <strong className="national-snapshot__value">{valueLabel(item.value, item.unit, item.valueQualifier)}</strong>
           <p className="national-snapshot__period">Reference period · {item.referencePeriod}</p>
           <p className="national-snapshot__publisher">{item.sourcePublisher}</p>
           <p className="national-snapshot__interpretation">{item.interpretation}</p>
           <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">Original source ↗</a>
           <details><summary>Limitations</summary><ul>{item.limitations.map((limit) => <li key={limit}>{limit}</li>)}</ul></details>
         </article>
       ))}</div> : <p className="national-snapshots__empty">No curated snapshot is currently assigned to {departmentId ? DEPARTMENT_LABEL[departmentId] || 'this department' : 'this view'}.</p>}
      {catalogOnly.length > 0 && <div className="national-catalogue">
        <div className="national-catalogue__head"><strong>Sources under assessment</strong><span>Catalogue status is source-specific</span></div>
        <div className="national-catalogue__grid">{catalogOnly.map((item) => <article key={item.id}><span>{item.publisher} · {item.status === "partial" ? "Partial integration" : "Catalogue only"}</span><strong>{item.title}</strong><p>{item.note}</p><a href={item.url} target="_blank" rel="noopener noreferrer">Open source ↗</a></article>)}</div>
      </div>}
      {!compact && <p className="national-snapshots__disclaimer">Curated transcriptions, not live feeds. Source publishers own the original data. A national statistic is not a local service-delivery finding.</p>}
    </section>
  );
}
