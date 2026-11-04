import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useBundle } from '../lib/data';
import { useAdapter } from '../lib/hooks';
import { Section, Card } from '../design/layout';
import { EmptyState } from '../design/feedback';
import { SECTOR_LABEL } from '../data/types';
import { listIndicators, fetchViaGateway, formatIndicatorValue, type IndicatorDefinition, type IndicatorObservation } from '../lib/indicators';

function Indicator({ indicator }: { indicator: IndicatorDefinition }) {
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
  const latest = observations.length ? observations[observations.length - 1] : null;
  return <Card title={indicator.title}>
    {status === 'loading' ? <span className="workspace-loading">Loading</span> : latest ? <>
      <strong className="workspace-stat__value">{formatIndicatorValue(latest.value, indicator.unit)}</strong>
      <span className="workspace-stat__period">{latest.referencePeriod} · National</span>
      <span className="workspace-indicator__source">{indicator.sourcePublisher}</span>
    </> : <><strong className="workspace-stat__value">—</strong><span className="workspace-stat__period">{status === 'unavailable' ? 'Source unavailable' : 'No observation'}</span><span className="workspace-indicator__source">No substitute data is shown</span></>}
  </Card>;
}

export default function Overview() {
  const adapter = useAdapter();
  const isDemo = adapter.mode === 'demo';
  const { records, states } = useBundle();
  const indicators = listIndicators();
  const representedStates = new Set(records.map((record) => record.stateId).filter(Boolean)).size;
  const latestRecords = records.slice(-8).reverse();
  return <>
    <header className="page-heading"><h1>Nigeria</h1><span className="page-heading__meta">{isDemo ? 'Demonstration data' : 'Published Civic Mandate feed'}</span></header>
    <div className="workspace-grid" aria-label={isDemo ? 'Demonstration coverage' : 'Published community record coverage'}>
      <Card title={isDemo ? 'Demonstration records' : 'Published records'}><strong className="workspace-stat__value">{records.length}</strong><span className="workspace-stat__period">{isDemo ? 'Synthetic test set' : 'Current published feed'}</span></Card>
      <Card title={isDemo ? 'Demo states' : 'States represented'}><strong className="workspace-stat__value">{representedStates}</strong><span className="workspace-stat__period">{isDemo ? 'In synthetic test set' : 'In published feed'}</span></Card>
      <Card title="National indicators"><strong className="workspace-stat__value">{indicators.length}</strong><span className="workspace-stat__period">World Bank series</span></Card>
    </div>
    <Section title="Public indicators" id="indicators">
      <div className="workspace-grid">{indicators.map((indicator) => <Indicator key={indicator.id} indicator={indicator} />)}</div>
    </Section>
    <Section title={isDemo ? 'Demonstration records' : 'Community records'} id="records" note={<Link to="/issues">All records</Link>}>
      {latestRecords.length === 0 ? <EmptyState title={isDemo ? 'No demonstration records' : 'No published records in the current feed'} /> : <div className="workspace-records">
        {latestRecords.map((record) => <Link className="workspace-record" key={record.id} to="/issues">
          <span><span className="workspace-record__title">{record.title}</span><span className="workspace-record__meta">{states.find((state) => state.id === record.stateId)?.name || record.stateId} · {record.sector ? SECTOR_LABEL[record.sector] : 'Unclassified'} · {isDemo ? 'Demonstration' : 'Published'}</span></span>
          <span className="workspace-record__date">{record.publishedMonth === 'unknown' ? '' : record.publishedMonth}</span>
        </Link>)}
      </div>}
    </Section>
  </>;
}