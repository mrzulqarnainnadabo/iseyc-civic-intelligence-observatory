import { useEffect, useMemo, useState } from 'react';
import { useBundle } from '../lib/data';
import { useAdapter } from '../lib/hooks';
import { Section, Card } from '../design/layout';
import { EmptyState, Banner } from '../design/feedback';
import { SourceCitation } from '../design/primitives';
import type { EvidenceVaultRecord } from '../data/types';
import {
  listIndicators,
  fetchViaGateway,
  formatIndicatorValue,
  type IndicatorDefinition,
  type IndicatorObservation,
} from '../lib/indicators';

const VERIFICATION_LABEL: Record<string, string> = {
  unverified: 'Unverified',
  source_confirmed: 'Source confirmed',
  content_corroborated: 'Content corroborated',
  disputed: 'Disputed',
  corrected: 'Corrected',
  superseded: 'Superseded',
  withdrawn: 'Withdrawn',
};
const RELATION_LABEL: Record<string, string> = {
  'not-assessed': 'Relationship not assessed',
  'context-only': 'Context only — not verification',
  corroborates: 'Corroborates linked observation',
  contradicts: 'Contradicts linked observation',
  unrelated: 'Reviewed as unrelated',
};

function EvidenceVaultItem({ record, observations }: { record: EvidenceVaultRecord; observations: ReturnType<typeof useBundle>['communityObservations'] }) {
  const linked = record.linkedCommunityObservationId
    ? observations?.records.find((item) => item.sourceRecordId === record.linkedCommunityObservationId)
    : undefined;
  const value = record.observedValue === null
    ? 'No numeric value stored'
    : record.observedValue.toLocaleString() + (record.unit ? ' ' + record.unit : '');
  const geography = [record.geographicLevel, record.geographicUnit].filter(Boolean).join(' · ') || 'Geography not specified';

  return <details className="record">
    <summary>
      <span className="record__title">{record.title}</span>
      <span className="record__meta">
        <span className="chip chip--real">{record.displayId || record.evidenceScope}</span>
        <span className="chip chip--pilot">{geography}</span>
        <span className="muted">{VERIFICATION_LABEL[record.verificationStatus] || record.verificationStatus}</span>
      </span>
    </summary>
    <dl className="facts">
      <div><dt>Publisher</dt><dd>{record.publisher || 'Not specified'}</dd></div>
      <div><dt>Source ID</dt><dd>{record.sourceId || 'Not specified'}</dd></div>
      <div><dt>Scope</dt><dd>{record.evidenceScope}</dd></div>
      <div><dt>Indicator</dt><dd>{record.indicatorCode || 'Not applicable'}</dd></div>
      <div><dt>Measure</dt><dd>{record.measure || record.sourceTitle || 'Not specified'}</dd></div>
      <div><dt>Value</dt><dd>{value}{record.valueStatus ? ' · ' + record.valueStatus : ''}</dd></div>
      <div><dt>Reference period</dt><dd>{record.referencePeriod || 'Not specified'}</dd></div>
      <div><dt>Retrieved</dt><dd>{record.retrievedAt || 'Not recorded'}</dd></div>
      <div><dt>Data status</dt><dd>{record.dataStatus || 'Not specified'}</dd></div>
      <div><dt>Source review</dt><dd>{record.evidenceLinkReview || 'Not reviewed'}</dd></div>
      <div><dt>Evidence relationship</dt><dd>{RELATION_LABEL[record.evidenceRelation] || record.evidenceRelation}</dd></div>
      {record.linkedCommunityObservationId && <div><dt>Linked observation</dt><dd>{linked?.displayId || record.linkedCommunityObservationId}</dd></div>}
    </dl>
    {record.linkedCommunityObservationId && <p><a href="/observations">View community observations</a></p>}
    <a href={record.sourceUrl} target="_blank" rel="noopener noreferrer">Open original source</a>
    <details className="record">
      <summary>Methodology and limitations</summary>
      {record.methodology && <p>{record.methodology}</p>}
      {record.limitations && <p className="muted">{record.limitations}</p>}
    </details>
    <p className="muted">Source confirmation is not content corroboration. Only an explicit, reviewed relationship can connect this record to a community observation.</p>
  </details>;
}

function IndicatorBlock({ indicator }: { indicator: IndicatorDefinition }) {
  const [observations, setObservations] = useState<IndicatorObservation[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'empty' | 'unavailable'>('loading');
  const [retrievedAt, setRetrievedAt] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchViaGateway(indicator.id).then((result) => {
      if (!active) return;
      setObservations(result.observations);
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
  const { sources, evidence, evidenceVault, communityObservations } = useBundle();
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

  const vault = evidenceVault ?? {
    status: 'unavailable' as const,
    records: [],
    total: null,
    message: 'The Evidence Vault feed is not configured for this adapter.',
  };

  return <>
    <header className="page-heading"><h1>Evidence</h1><span className="page-heading__meta">Public sources, indicators and reviewed evidence</span></header>
    <Section title="Published evidence records" id="evidence-vault" note="Source-linked records approved for publication. A source being reachable does not mean it corroborates a community report.">
      {vault.status === 'not-in-demo' && <Banner tone="demo">Live Evidence Vault records are not included in demonstration data.</Banner>}
      {(vault.status === 'unavailable' || vault.status === 'invalid' || vault.status === 'incomplete') && <Banner tone="warn">{vault.message || 'The Evidence Vault feed could not be validated. Records are withheld.'}</Banner>}
      {vault.status === 'empty' && <EmptyState title="No evidence records have passed the publication gate yet">The private Evidence Vault may contain draft or pending records. No unpublished records are shown here.</EmptyState>}
      {vault.status === 'ready' && <div className="workspace-records">{vault.records.map((record) => <EvidenceVaultItem key={record.id} record={record} observations={communityObservations} />)}</div>}
    </Section>
    <Section title="National indicators" id="indicators" note="National context only; these series do not verify a named state, LGA, ward or facility.">
      <div className="workspace-grid">{indicators.map((indicator) => <IndicatorBlock key={indicator.id} indicator={indicator} />)}</div>
    </Section>
    <Section title="Source registry" id="registry" note="A registered source is not necessarily an ingested dataset.">
      <label className="field"><span className="sr-only">Search sources</span><input className="input" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search sources" aria-label="Search sources" /></label>
      {filtered.length === 0 ? <EmptyState title="No matching sources" /> : <ul className="plain source-list">{filtered.map((source) => <li key={source.id}><SourceCitation s={source} /></li>)}</ul>}
    </Section>
    <Section title={isDemo ? 'Demonstration demand evidence' : 'Civic Mandate evidence references'} id="community-evidence" note="Evidence references attached to published civic demands; separate from the Evidence Vault.">
      {evidence.length === 0 ? <EmptyState title="No demand evidence references in this feed" /> : <ul className="plain">{evidence.slice(0, 40).map((item) => <li key={item.id}><strong>{item.title}</strong><br /><span className="muted">{item.kind} · {item.status} · {item.publisherLabel}</span></li>)}</ul>}
    </Section>
  </>;
}
