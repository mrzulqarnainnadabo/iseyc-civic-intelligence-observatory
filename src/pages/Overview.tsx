import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useBundle } from '../lib/data';
import { useAdapter } from '../lib/hooks';
import { SECTOR_LABEL, SECTORS, type Sector } from '../data/types';
import { listIndicators, fetchViaGateway, formatIndicatorValue, type IndicatorDefinition, type IndicatorObservation } from '../lib/indicators';

function IndicatorCard({ indicator }: { indicator: IndicatorDefinition }) {
  const [observations, setObservations] = useState<IndicatorObservation[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable' | 'empty'>('loading');
  useEffect(() => {
    let active = true;
    fetchViaGateway(indicator.id).then((result) => {
      if (!active) return;
      setObservations(result.observations);
      setStatus(result.status === 'error' ? 'unavailable' : result.status === 'empty' || !result.observations.length ? 'empty' : 'ready');
    });
    return () => { active = false; };
  }, [indicator.id]);
  const latest = observations.at(-1) ?? null;
  const points = observations.slice(-8);
  const values = points.map((item) => item.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const polyline = points.map((item, index) => {
    const x = points.length < 2 ? 50 : 6 + (index / (points.length - 1)) * 88;
    const y = 34 - ((item.value - min) / range) * 26;
    return `${x},${y}`;
  }).join(' ');

  return <article className="indicator-tile">
    <div className="indicator-tile__top"><span className="indicator-tile__sector">{SECTOR_LABEL[indicator.sector as Sector] || indicator.sector}</span><span className={`indicator-tile__state indicator-tile__state--${status}`}>{status === 'loading' ? 'Retrieving' : status === 'ready' ? 'Source returned data' : status === 'empty' ? 'No observation' : 'Source unavailable'}</span></div>
    <h3>{indicator.title}</h3>
    {latest ? <div className="indicator-tile__value"><strong>{formatIndicatorValue(latest.value, indicator.unit)}</strong><span>{latest.referencePeriod} · Nigeria</span></div> : <div className="indicator-tile__value"><strong>—</strong><span>{status === 'loading' ? 'Retrieving source series' : status === 'unavailable' ? 'No substitute data shown' : 'No published observation returned'}</span></div>}
    <div className="indicator-tile__chart" aria-label={latest ? `Recent values for ${indicator.title}` : 'Trend unavailable'}>
      {points.length > 1 ? <svg viewBox="0 0 100 40" role="img" aria-label={`Recent ${points.length} observations, from ${points[0].referencePeriod} to ${points[points.length-1].referencePeriod}`}><polyline points={polyline} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /><circle cx={polyline.split(' ').at(-1)?.split(',')[0]} cy={polyline.split(' ').at(-1)?.split(',')[1]} r="2.8" fill="currentColor" /></svg> : <span>{status === 'loading' ? 'Loading source series…' : 'Trend unavailable until multiple periods are returned'}</span>}
    </div>
    <p className="indicator-tile__source">{indicator.sourcePublisher}</p>
    <div className="indicator-tile__foot"><span>{indicator.geoLevel === 'national' ? 'National aggregate' : indicator.geoLevel}</span><a href={indicator.sourceUrl} target="_blank" rel="noopener noreferrer">Original source ↗</a></div>
  </article>;
}

export default function Overview() {
  const adapter = useAdapter();
  const isDemo = adapter.mode === 'demo';
  const { records, states } = useBundle();
  const [sector, setSector] = useState<Sector | 'all'>('all');
  const indicators = listIndicators();
  const visibleIndicators = useMemo(() => indicators.filter((item) => sector === 'all' || item.sector === sector), [indicators, sector]);
  const representedStates = new Set(records.map((record) => record.stateId).filter(Boolean)).size;
  const latestRecords = records.slice(-6).reverse();

  return <>
    <section className="observatory-hero">
      <div className="observatory-hero__copy"><span className="observatory-kicker">ISEYC · Civic intelligence</span><h1>Nigeria, understood through evidence.</h1><p>Explore public records, national indicators and source material. Every figure keeps its publisher, reference period and limitations attached.</p><div className="observatory-hero__actions"><Link to="/evidence">Explore evidence <span aria-hidden="true">↗</span></Link><Link to="/geography">Open national map</Link></div></div>
      <div className="observatory-hero__seal" aria-hidden="true"><span>ISEYC</span><strong>Evidence<br/>before<br/>conclusion</strong><i>National observatory</i></div>
    </section>

    <div className="workspace-grid observatory-kpis" aria-label={isDemo ? 'Demonstration coverage' : 'Published civic record coverage'}>
      <div className="workspace-stat"><span className="workspace-stat__label">{isDemo ? 'Demonstration records' : 'Published records'}</span><strong className="workspace-stat__value">{records.length}</strong><span className="workspace-stat__period">{isDemo ? 'Synthetic test set' : 'Current published feed'}</span></div>
      <div className="workspace-stat"><span className="workspace-stat__label">States represented</span><strong className="workspace-stat__value">{representedStates} <small>/ {states.length}</small></strong><span className="workspace-stat__period">{isDemo ? 'In synthetic test set' : 'In published community feed'}</span></div>
      <div className="workspace-stat"><span className="workspace-stat__label">National indicators</span><strong className="workspace-stat__value">{indicators.length}</strong><span className="workspace-stat__period">Allowlisted World Bank series · national only</span></div>
    </div>

    {isDemo && <p className="observatory-demo-note">Demonstration mode: synthetic records are not real community submissions or national statistics.</p>}

    <section className="observatory-section" aria-labelledby="indicators-heading">
      <div className="observatory-section__head"><div><span className="observatory-kicker observatory-kicker--dark">National data</span><h2 id="indicators-heading">Indicators that help explain the picture</h2><p>Source-retrieved series. Values are not ISEYC-produced statistics.</p></div><Link to="/evidence">Evidence library ↗</Link></div>
      <div className="sector-filter" role="group" aria-label="Filter indicators by sector">
        <button type="button" className={sector === 'all' ? 'is-active' : ''} aria-pressed={sector === 'all'} onClick={() => setSector('all')}>All indicators</button>
        {SECTORS.filter((item) => indicators.some((indicator) => indicator.sector === item)).map((item) => <button type="button" key={item} className={sector === item ? 'is-active' : ''} aria-pressed={sector === item} onClick={() => setSector(item)}>{SECTOR_LABEL[item]}</button>)}
      </div>
      <div className="indicator-grid">{visibleIndicators.map((indicator) => <IndicatorCard key={indicator.id} indicator={indicator} />)}</div>
      <p className="observatory-caveat"><strong>Read carefully.</strong> These indicators are national aggregates. They cannot establish differences between states or LGAs, facility-level service quality, programme delivery or causal impact. Missing observations are not zero.</p>
    </section>

    <section className="observatory-lower-grid">
      <div className="observatory-panel"><div className="observatory-panel__head"><div><span className="observatory-kicker observatory-kicker--dark">Public voice</span><h2>{isDemo ? 'Demonstration records' : 'Latest published community records'}</h2></div><Link to="/issues">All records →</Link></div>
        {latestRecords.length === 0 ? <p className="workspace-empty">No published records are available in this feed.</p> : <div className="workspace-records">{latestRecords.map((record) => <Link className="workspace-record" key={record.id} to="/issues"><span><span className="workspace-record__title">{record.title}</span><span className="workspace-record__meta">{states.find((state) => state.id === record.stateId)?.name || record.stateId} · {record.sector ? SECTOR_LABEL[record.sector] : 'Unclassified'} · {isDemo ? 'Demonstration' : 'Published'}</span></span><span className="workspace-record__date">{record.publishedMonth === 'unknown' ? '' : record.publishedMonth}</span></Link>)}</div>}
        <p className="observatory-small-note">Community submissions are published voices, not a representative survey or prevalence estimate.</p>
      </div>
      <aside className="observatory-panel observatory-panel--dark"><span className="observatory-kicker">Explore the system</span><h2>From a public question to accountable evidence.</h2><div className="observatory-shortcuts"><Link to="/geography"><span>01</span><strong>Places & geography</strong><i>Explore coverage →</i></Link><Link to="/accountability"><span>02</span><strong>Institutional responsibility</strong><i>Trace the mandate →</i></Link><Link to="/briefs"><span>03</span><strong>Evidence briefs</strong><i>Build a draft →</i></Link></div></aside>
    </section>
  </>;
}
