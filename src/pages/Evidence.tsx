import { useEffect, useMemo, useState } from 'react';
import { useBundle } from '../lib/data';
import { useAdapter } from '../lib/hooks';
import { Section, Card } from '../design/layout';
import { EmptyState } from '../design/feedback';
import { SourceCitation } from '../design/primitives';
import inecPvc2023 from '../data/indicators/inec-pvc-2023.json';
import inecEkiti2026 from '../data/indicators/inec-ekiti-2026.json';
import {
  listIndicators,
  fetchViaGateway,
  formatIndicatorValue,
  type IndicatorDefinition,
  type IndicatorObservation,
  type GatewayResult,
} from '../lib/indicators';

type PvcRow = typeof inecPvc2023.records[number];
const numberFormat = new Intl.NumberFormat('en-NG');

function ElectoralParticipation() {
  const [stateQuery, setStateQuery] = useState('');
  const rows = useMemo(() => {
    const term = stateQuery.trim().toLowerCase();
    return (inecPvc2023.records as PvcRow[]).filter((row) => !term || row.state.toLowerCase().includes(term));
  }, [stateQuery]);
  return <Section title="Electoral participation" id="electoral-participation" note="INEC official releases · different reference periods">
    <div className="workspace-grid">
      <Card title="Registered voters"><strong className="workspace-stat__value">{numberFormat.format(inecPvc2023.sourceReportedNationalTotals.registeredVoters)}</strong><span className="workspace-stat__period">2023 validated register</span></Card>
      <Card title="PVCs collected"><strong className="workspace-stat__value">{numberFormat.format(inecPvc2023.sourceReportedNationalTotals.collectedPVCs)}</strong><span className="workspace-stat__period">As at 5 February 2023</span></Card>
      <Card title="Collection rate"><strong className="workspace-stat__value">{inecPvc2023.sourceReportedNationalTotals.collectionRate.toFixed(1)}%</strong><span className="workspace-stat__period">Reported by INEC</span></Card>
    </div>
    <p className="muted">These are historical nationwide figures for the 2023 General Election. Registered voters, PVC collection and actual turnout are different measures.</p>
    <p><a href={inecPvc2023.sourceUrl} target="_blank" rel="noopener noreferrer">Open INEC's certified 2023 summary (PDF)</a></p>
    <details className="record">
      <summary>Explore state and FCT figures ({inecPvc2023.records.length} geographies)</summary>
      <label className="field"><span>Find a state or FCT</span><input className="input" type="search" value={stateQuery} onChange={(event) => setStateQuery(event.target.value)} placeholder="Search geography" /></label>
      <div className="data-table-wrap"><table className="data-table"><thead><tr><th scope="col">State / FCT</th><th scope="col">Registered</th><th scope="col">PVCs collected</th><th scope="col">Collection</th></tr></thead><tbody>{rows.map((row) => <tr key={row.state}><th scope="row">{row.state}</th><td>{numberFormat.format(row.registeredVoters)}</td><td>{numberFormat.format(row.collectedPVCs)}</td><td>{row.collectionRateReported.toFixed(1)}%</td></tr>)}</tbody></table></div>
      {rows.length === 0 && <p className="muted">No matching geography.</p>}
    </details>
    <details className="record"><summary>Source quality and interpretation notes</summary>
      <p>INEC's 2023 General Election Report contains an additional unresolved PVC collection discrepancy: the Section 8.4 narrative states 87,394,106 PVCs collected, while Table 8.13 and INEC's 5 February 2023 summary report 87,209,007. The difference is 185,099. Both official statements are preserved as published; ISEYC does not choose or reconcile one without an authoritative clarification. <a href="https://www.inecnigeria.org/wp-content/uploads/2024/02/2023-GENERAL-ELECTION-REPORT-1.pdf" target="_blank" rel="noopener noreferrer">Open INEC's 2023 General Election Report (Section 8.4 and Table 8.13)</a>.</p>
      <p>The registered-voter and collected-PVC state rows sum to INEC's printed national totals. The published uncollected-PVC figures do not reconcile: 16 state rows differ from registered minus collected; the published state-row sum is 6,259,231, the printed national total is 6,259,229, and the arithmetic difference is 6,260,001. ISEYC retains the reported and calculated values separately and does not use the uncollected total as a settled figure.</p>
      <p className="muted">Source reference date: {inecPvc2023.sourceReferenceDate}. Retrieved: {inecPvc2023.retrievedAt}. This is a transcription of an INEC PDF, not an independently audited voter register.</p>
      <p>For the 2025–2026 Continuous Voter Registration, INEC’s February 2026 Chairman’s remarks report 2,782,587 eligible voters registered in phase one; a separate INEC press release reports 2,782,589. The CVR portal now states that registration has ended and that INEC is completing administrative processing of applications. That status does not itself establish the final validated count. A consolidated post-CVR national register and state/LGA breakdown have not yet been located in the official sources reviewed for this pilot. The two February 2026 official statements also differ by two in their phase-one count (2,782,587 vs 2,782,589); this discrepancy remains unresolved. <a href="https://cvr.inecnigeria.org/Home/cvrEnded" target="_blank" rel="noopener noreferrer">INEC CVR ended notice</a> · <a href="https://wp1.inecnigeria.org/remarks-by-the-honourable-chairman-independent-national-electoral-commission-inec-prof-joash-amupitan-san-at-the-first-regular-consultative-meeting-with-political-parties-held-at-the-inec-confe/" target="_blank" rel="noopener noreferrer">INEC Chairman’s remarks</a> · <a href="https://wp1.inecnigeria.org/news-all/inec-to-revalidate-and-clean-up-voters-register-nationwide-schedules-mock-accreditation-ahead-of-fct-area-council-elections/" target="_blank" rel="noopener noreferrer">INEC press release</a>.</p>
    </details>
  </Section>;
}

function StateElectionSnapshots() {
  const ekiti = inecEkiti2026.records[0];
  return <Section title="Recent state election snapshots" id="state-election-snapshots" note="State-specific figures · not a national CVR total">
    <div className="workspace-grid">
      <Card title="Ekiti voter register · 2026"><strong className="workspace-stat__value">{numberFormat.format(ekiti.registeredVotersForElection)}</strong><span className="workspace-stat__period">20 June 2026 election · 16 LGAs · 2,445 polling units</span><a href={inecEkiti2026.sourceUrl} target="_blank" rel="noopener noreferrer">INEC bulletin · 9 June 2026</a></Card>
      <Card title="Osun PVCs collected · 2026"><strong className="workspace-stat__value">1,518,485</strong><span className="workspace-stat__period">30 LGAs · certified polling-unit breakdown</span><a href="https://www.inecnigeria.org/press/final-figures-of-collected-permanent-voter-cards-ahead-of-osun-governorship-election" target="_blank" rel="noopener noreferrer">INEC final Osun PVC release · 13 August 2026</a></Card>
    </div>
    <details className="record"><summary>Ekiti register reconciliation</summary>
      <p>INEC reports a 2023 base register of {numberFormat.format(ekiti.baseRegister2023)} plus {numberFormat.format(ekiti.newRegistrantsReported)} new registrants, which totals {numberFormat.format(ekiti.calculatedBasePlusNew)}. The stated election register is {numberFormat.format(ekiti.registeredVotersForElection)}, leaving {numberFormat.format(ekiti.unreconciledDifference)} voters unexplained in the bulletin. INEC also reports {numberFormat.format(ekiti.doubleRegistrationsInvalidatedReported)} double registrations invalidated. The source does not provide a full reconciliation, so ISEYC does not infer the missing components.</p>
      <p className="muted">This is a state election register, not a national register. It is stored as a dated official statement with the arithmetic gap visible.</p>
    </details>
    <p className="muted">INEC's CVR timetable scheduled Phase 3 registration for 4 May–17 August 2026 and display of the register for claims and objections from 24–30 August 2026. A final consolidated nationwide post-CVR register and state/LGA table has not been located in the official sources reviewed for this pilot.</p>
  </Section>;
}

function IndicatorBlock({ indicator }: { indicator: IndicatorDefinition }) {
  const [observations, setObservations] = useState<IndicatorObservation[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'empty' | 'unavailable'>('loading');
  const [retrievedAt, setRetrievedAt] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<GatewayResult['receipt']>(null);
  const [persistence, setPersistence] = useState<GatewayResult['persistence']>(undefined);

  useEffect(() => {
    let active = true;
    fetchViaGateway(indicator.id).then((result) => {
      if (!active) return;
      setObservations(result.observations);
      setReceipt(result.receipt ?? null);
      setPersistence(result.persistence);
      setStatus(result.status === 'error' ? 'unavailable' : result.status === 'empty' || !result.observations.length ? 'empty' : 'ready');
      setRetrievedAt(result.observations[0]?.retrievedAt || (result.receipt as { retrievedAt?: string } | null)?.retrievedAt || null);
    });
    return () => { active = false; };
  }, [indicator.id]);

  const recent = observations.slice(-5).reverse();
  const latest = recent[0];

  return <Card title={indicator.title}>
    {status === 'loading' ? <p className="workspace-loading">Loading</p> : latest ? <>
      <strong className="workspace-stat__value">{formatIndicatorValue(latest.value, indicator.unit)}</strong>
      <span className="workspace-stat__period">{latest.referencePeriod} · National</span>
    </> : <><strong className="workspace-stat__value">—</strong><span className="workspace-stat__period">{status === 'unavailable' ? 'Source unavailable' : 'No observation'}</span></>}
    <span className="workspace-indicator__source">{indicator.sourcePublisher}</span>
    {retrievedAt && <span className="workspace-indicator__source">Retrieved {retrievedAt}</span>}
    {receipt && <details className="record">
      <summary>Retrieval receipt · {persistence?.mode === 'ephemeral' ? 'not retained' : 'receipt details'}</summary>
      <p className="muted">{persistence?.note || 'Receipt retention status is not reported by this source.'}</p>
      {typeof receipt.receiptId === 'string' && <p>Receipt ID: <code>{receipt.receiptId}</code></p>}
      {typeof receipt.contentHash === 'string' && <><p>SHA-256 source-response hash: <code>{receipt.contentHash}</code></p><p className="muted">This hash fingerprints the fetched response; it is not an independent verification of the publisher or source authenticity.</p></>}
      {typeof receipt.httpStatus === 'number' && <p>Upstream HTTP status: {receipt.httpStatus}</p>}
    </details>}
    <details className="record">
      <summary>Method and limitations</summary>
      <p>{indicator.definition}</p>
      <p className="muted">{indicator.methodologyNotes}</p>
      <p className="muted">{indicator.limitations.join(' ')}</p>
      <p className="muted">Unit: {indicator.unit} · {indicator.measurementType} · {indicator.geographicCoverage}</p>
      <p className="muted">Licence: {indicator.licence} · Update: {indicator.updateFrequency}</p>
      <a href={indicator.sourceUrl} target="_blank" rel="noopener noreferrer">Open source</a>
    </details>
    {recent.length > 1 && <details className="record"><summary>Recent observations ({recent.length})</summary><ul className="plain">{recent.map((observation) => <li key={observation.referencePeriod}>{observation.referencePeriod}: {formatIndicatorValue(observation.value, indicator.unit)}</li>)}</ul></details>}
  </Card>;
}

export default function Evidence() {
  const { sources, evidence } = useBundle();
  const { mode } = useAdapter();
  const isDemo = mode === 'demo';
  const indicators = listIndicators();
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return sources;
    return sources.filter((source) =>
      source.name.toLowerCase().includes(term) ||
      source.publisher.toLowerCase().includes(term) ||
      source.sectors.join(' ').toLowerCase().includes(term)
    );
  }, [sources, query]);

  return <>
    <header className="page-heading"><h1>Evidence</h1><span className="page-heading__meta">Public sources and observations</span></header>
    <ElectoralParticipation />
    <StateElectionSnapshots />
    <Section title="National indicators" id="indicators">
      <div className="workspace-grid">{indicators.map((indicator) => <IndicatorBlock key={indicator.id} indicator={indicator} />)}</div>
    </Section>
    <Section title="Source registry" id="registry" note="A registered source is not necessarily an ingested dataset.">
      <label className="field"><span className="sr-only">Search sources</span><input className="input" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search sources" aria-label="Search sources" /></label>
      {filtered.length === 0 ? <EmptyState title="No matching sources" /> : <ul className="plain source-list">{filtered.map((source) => <li key={source.id}><SourceCitation s={source} /></li>)}</ul>}
    </Section>
    <Section title={isDemo ? 'Demonstration evidence' : 'Community evidence'} id="community-evidence">
      {evidence.length === 0 ? <EmptyState title="No community evidence in this feed" /> : <ul className="plain">{evidence.slice(0, 40).map((item) => <li key={item.id}><strong>{item.title}</strong><br /><span className="muted">{item.kind} · {item.status} · {item.publisherLabel}</span></li>)}</ul>}
    </Section>
  </>;
}