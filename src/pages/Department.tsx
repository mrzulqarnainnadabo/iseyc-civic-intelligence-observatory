import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useBundle } from '../lib/data';
import { useAdapter } from '../lib/hooks';
import { fetchViaGateway, formatIndicatorValue, listIndicators } from '../lib/indicators';
import { DEPARTMENTS, isDepartmentId, type DepartmentEvidence, type DepartmentId } from '../data/department-evidence';
import type { CommunityFeedStatus, EvidenceVaultRecord } from '../data/types';

function geoLevel(value?: string | null): DepartmentEvidence['geography']['level'] | null {
  const v = (value || '').toLowerCase();
  if (v === 'national' || v === 'country') return 'national';
  if (v === 'state') return 'state';
  if (v === 'lga' || v === 'local government area') return 'lga';
  if (v === 'ward') return 'ward';
  if (v === 'facility' || v === 'health facility') return 'facility';
  return null;
}

function fromVault(record: EvidenceVaultRecord, departmentId: DepartmentId): DepartmentEvidence | null {
  if (record.publicationStatus !== 'published') return null;
  const level = geoLevel(record.geographicLevel);
  if (!level) return null;
  const value = typeof record.observedValue === 'number' && Number.isFinite(record.observedValue) ? record.observedValue : null;
  return {
    departmentId,
    indicatorId: record.indicatorCode || record.id,
    sourceId: record.sourceId || 'evidence-vault',
    publisher: record.publisher || record.sourceTitle || 'Publisher not recorded',
    sourceUrl: record.sourceUrl || 'Source URL not supplied',
    referencePeriod: record.referencePeriod || 'Not specified in published record',
    retrievedAt: record.retrievedAt || record.createdAt || 'Not recorded',
    geography: {
      level,
      code: null,
      label: record.geographicUnit || (level === 'national' ? 'Nigeria (national)' : level),
    },
    value,
    unit: record.unit || null,
    evidenceStatus: value === null ? 'partial' : 'integrated',
    limitations: [
      ...(record.limitations ? [record.limitations] : []),
      'Evidence Vault publication is not, by itself, independent verification.',
      record.verificationStatus ? 'Evidence Vault status: ' + record.verificationStatus + '.' : 'Verification status not supplied.',
    ],
  };
}

function EvidenceCard({ item }: { item: DepartmentEvidence }) {
  return <article className="dept-evidence-card">
    <div className="dept-evidence-card__top">
      <span className={'dept-status dept-status--' + item.evidenceStatus}>{item.evidenceStatus}</span>
      <span className="dept-evidence-card__period">{item.referencePeriod}</span>
    </div>
    <h3>{item.indicatorId}</h3>
    <p className="dept-evidence-card__publisher">{item.publisher}</p>
    <div className="dept-evidence-card__value">
      {item.value === null ? 'Value not supplied' : formatIndicatorValue(item.value, item.unit || '')}
      {item.unit ? <small> {item.unit}</small> : null}
    </div>
    <p className="dept-evidence-card__geo">{item.geography.label} · {item.geography.level}</p>
    <p className="dept-evidence-card__geo">Source ID: {item.sourceId} · Retrieved: {item.retrievedAt}</p>
    <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">Open source ↗</a>
    {item.limitations.length ? <ul className="dept-limitations">{item.limitations.map((v, i) => <li key={i}>{v}</li>)}</ul> : null}
  </article>;
}

export default function DepartmentPage() {
  const { departmentId: rawId } = useParams();
  const departmentId = isDepartmentId(rawId) ? rawId : null;
  const department = departmentId ? DEPARTMENTS[departmentId] : null;
  const { sources, records, evidenceVault } = useBundle();
  const adapter = useAdapter();
  const [gatewayEvidence, setGatewayEvidence] = useState<DepartmentEvidence[]>([]);
  const [gatewayStates, setGatewayStates] = useState<Array<{ id: string; status: string; message?: string }>>([]);
  const [gatewayLoading, setGatewayLoading] = useState(false);
  const [feedStatus, setFeedStatus] = useState<CommunityFeedStatus | null>(adapter.getCommunityFeedStatus?.() || null);

  useEffect(() => {
    setFeedStatus(adapter.getCommunityFeedStatus?.() || null);
  }, [adapter, records.length]);

  useEffect(() => {
    if (!department) return;
    const definitions = listIndicators().filter((indicator) => department.indicatorSectors.includes(indicator.sector));
    let active = true;
    setGatewayLoading(definitions.length > 0);
    Promise.all(definitions.map(async (indicator) => {
      const result = await fetchViaGateway(indicator.id);
      return { indicator, result };
    })).then((results) => {
      if (!active) return;
      const evidence: DepartmentEvidence[] = [];
      const states = results.map(({ indicator, result }) => ({
        id: indicator.id,
        status: result.status,
        message: result.message || result.errorClass,
      }));
      for (const { indicator, result } of results) {
        for (const observation of result.observations) {
          const level = geoLevel(observation.geoLevel || indicator.geoLevel) || 'national';
          evidence.push({
            departmentId: department.id,
            indicatorId: indicator.id,
            sourceId: observation.datasetId || indicator.sourceDatasetId,
            publisher: observation.sourcePublisher || indicator.sourcePublisher,
            sourceUrl: observation.sourceUrl || indicator.sourceUrl,
            referencePeriod: observation.referencePeriod,
            retrievedAt: observation.retrievedAt,
            geography: {
              level,
              code: observation.geoCode || null,
              label: observation.geoCode || (level === 'national' ? 'Nigeria (national)' : level),
            },
            value: observation.value,
            unit: observation.unit || indicator.unit || null,
            evidenceStatus: observation.qualityFlags?.length ? 'partial' : 'integrated',
            limitations: [
              ...indicator.limitations,
              ...(observation.qualityFlags || []),
              'Retrieved through the Observatory Evidence Gateway. This does not establish local service delivery or independent verification.',
            ],
          });
        }
      }
      setGatewayEvidence(evidence);
      setGatewayStates(states);
      setGatewayLoading(false);
    }).catch(() => {
      if (!active) return;
      setGatewayStates(definitions.map((indicator) => ({ id: indicator.id, status: 'error', message: 'Gateway request failed' })));
      setGatewayLoading(false);
    });
    return () => { active = false; };
  }, [departmentId]);

  const vaultEvidence = useMemo(() => {
    if (!department) return [];
    const allowed = new Set(department.sourceIds);
    return (evidenceVault?.records || [])
      .filter((record) => record.sourceId && allowed.has(record.sourceId))
      .map((record) => fromVault(record, department.id))
      .filter((item): item is DepartmentEvidence => Boolean(item));
  }, [departmentId, evidenceVault]);

  const officialEvidence = useMemo(() => [...gatewayEvidence, ...vaultEvidence]
    .filter((item) => item.evidenceStatus === 'integrated' || item.evidenceStatus === 'partial'), [gatewayEvidence, vaultEvidence]);

  const communityRecords = useMemo(() => department
    ? records.filter((record) => !record.synthetic && record.reviewStatus === 'published' && record.sector && department.recordSectors.includes(record.sector))
    : [], [records, departmentId]);

  const integratedSourceIds = useMemo(() => new Set([
    ...gatewayEvidence.map((item) => item.sourceId),
    ...vaultEvidence.map((item) => item.sourceId),
  ]), [gatewayEvidence, vaultEvidence]);

  const registeredSources = useMemo(() => department
    ? sources.filter((source) => department.sourceIds.includes(source.id))
    : [], [sources, departmentId]);

  if (!department || !departmentId) {
    return <div className="page-heading"><h1>Department not found</h1><Link to="/">Return to Observatory</Link></div>;
  }

  const hasLocalEvidence = officialEvidence.some((item) => ['lga', 'ward', 'facility'].includes(item.geography.level) &&
    /kaduna south|kaduna/i.test(item.geography.label));
  const feedUnavailable = feedStatus?.status === 'unavailable' || adapter.mode === 'demo';

  return <div className="department-page">
    <header className="page-heading">
      <div>
        <Link className="dept-back" to="/">← Observatory overview</Link>
        <p className="dept-kicker">ISEYC · Department intelligence</p>
        <h1>{department.name}</h1>
        <p className="lead">{department.summary}</p>
      </div>
      <span className="dept-location">Geography check: Kaduna South, Kaduna State</span>
    </header>

    <section className="dept-panel" aria-labelledby="official-evidence-title">
      <div className="dept-panel__head">
        <div><p className="dept-kicker">01 · Official evidence</p><h2 id="official-evidence-title">What the registered sources establish</h2></div>
        <span className="dept-count">{officialEvidence.length} integrated item{officialEvidence.length === 1 ? '' : 's'}</span>
      </div>
      {gatewayLoading ? <p className="muted">Checking the Evidence Gateway…</p> : null}
      {officialEvidence.length ? <div className="dept-evidence-grid">{officialEvidence.map((item, index) => <EvidenceCard key={item.indicatorId + item.referencePeriod + index} item={item} />)}</div> :
        <div className="dept-empty" role="status">No official figure integrated for this geography and indicator yet.</div>}
      {officialEvidence.some((item) => item.geography.level === 'national') && !hasLocalEvidence ?
        <p className="dept-local-limit">National observations are context only. They are not current Kaduna South, LGA, ward or facility figures.</p> : null}
      {gatewayStates.length ? <details className="dept-gateway-details"><summary>Indicator retrieval status</summary>
        {gatewayStates.map((item) => <p key={item.id}><strong>{item.id}</strong>: {item.status}{item.message ? ' — ' + item.message : ''}</p>)}
      </details> : null}
    </section>

    <section className="dept-panel" aria-labelledby="community-records-title">
      <div className="dept-panel__head">
        <div><p className="dept-kicker">02 · Published community records</p><h2 id="community-records-title">What people have submitted</h2></div>
        <span className="dept-count">{communityRecords.length} matching record{communityRecords.length === 1 ? '' : 's'}</span>
      </div>
      {feedUnavailable ? <div className="dept-empty" role="status">Published CommunityRecord feed is unavailable in this view. No substitute records are shown.</div> :
        communityRecords.length ? <div className="dept-record-list">{communityRecords.map((record) => <article className="dept-record" key={record.id}>
          <p>{record.summary}</p>
          <div>{[record.lga, record.stateId, record.sourceDuty].filter(Boolean).join(' · ')}</div>
          <small>Published · {record.verificationStatus || 'unverified'} · {record.publishedMonth === 'unknown' ? 'date not supplied' : record.publishedMonth}</small>
        </article>)}</div> :
        <div className="dept-empty">No matching published CommunityRecords in the current feed. This is not evidence that the issue does not exist.</div>}
      {feedStatus ? <p className="dept-feed-note">Feed: {feedStatus.source || 'not yet established'}{feedStatus.fallbackReason ? ' · Fallback reason: ' + feedStatus.fallbackReason : ''}</p> : null}
    </section>

    <section className="dept-panel" aria-labelledby="unknowns-title">
      <div className="dept-panel__head"><div><p className="dept-kicker">03 · Unknowns and limitations</p><h2 id="unknowns-title">What remains unknown</h2></div></div>
      {!hasLocalEvidence ? <p className="dept-local-limit">No current Kaduna South local figure is integrated for this department. National and historical values must not be presented as local current conditions.</p> : null}
      {registeredSources.length ? <ul className="dept-source-list">{registeredSources.map((source) => {
        const integrated = integratedSourceIds.has(source.id) || officialEvidence.some((item) => item.publisher.toLowerCase().includes(source.publisher.toLowerCase()));
        return <li key={source.id}>
          <span><strong>{source.name}</strong><small>{source.publisher} · {source.geographicCoverage} · Last checked: {source.lastChecked || 'not recorded'}</small></span>
          <span className={'dept-status dept-status--' + (integrated ? 'integrated' : 'not-integrated')}>{integrated ? 'integrated' : 'registered, not integrated here'}</span>
          {source.url ? <a href={source.url} target="_blank" rel="noopener noreferrer">Source ↗</a> : null}
          {source.limitations.slice(0, 2).map((limitation, index) => <p className="dept-source-limit" key={index}>{limitation}</p>)}
        </li>;
      })}</ul> : <div className="dept-empty">No department-specific official source is registered in the Observatory source registry yet.</div>}
      {evidenceVault?.status === 'unavailable' ? <p className="dept-source-limit">Published Evidence Vault retrieval is unavailable. The source registry alone is not treated as integrated evidence.</p> : null}
    </section>

    <section className="dept-panel" aria-labelledby="field-guidance-title">
      <div className="dept-panel__head"><div><p className="dept-kicker">04 · Field guidance</p><h2 id="field-guidance-title">What members may say</h2></div></div>
      <div className="dept-guidance-grid">
        <div><h3>May state as fact</h3><ul>{department.factsGuidance.map((item) => <li key={item}>{item}</li>)}</ul></div>
        <div><h3>Must label as hypothesis</h3><ul>{department.hypothesisGuidance.map((item) => <li key={item}>{item}</li>)}</ul></div>
      </div>
    </section>
  </div>;
}
