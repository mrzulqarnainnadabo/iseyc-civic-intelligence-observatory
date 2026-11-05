import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useBundle } from '../lib/data';
import { PageHeader, Section } from '../design/layout';
import { DEPARTMENTS, buildDepartmentEvidence, indicatorBelongsToDepartment, type DepartmentEvidence, type DepartmentId } from '../data/departmentEvidence';
import { fetchViaGateway, formatIndicatorValue, listIndicators } from '../lib/indicators';
import type { IndicatorDefinition } from '../lib/indicators';
import type { CivicRecord, SourceRecord } from '../data/types';

const TECHNOLOGY_TERMS = /digital|technology|software|internet|connectivity|telecom|network|broadband/i;

function recordMatchesDepartment(record: CivicRecord, departmentId: DepartmentId): boolean {
  if (departmentId === 'civic') return true;
  if (departmentId === 'education') return record.sector === 'education';
  if (departmentId === 'health') return record.sector === 'health';
  return TECHNOLOGY_TERMS.test([record.title, record.summary, record.sourceDuty || '', record.issueCategory || ''].join(' '));
}

function sourcesForDepartment(sources: SourceRecord[], departmentId: DepartmentId): SourceRecord[] {
  return sources.filter((source) => {
    if (departmentId === 'education') return source.sectors.includes('education');
    if (departmentId === 'health') return source.sectors.includes('health');
    if (departmentId === 'software-technology') return source.sectors.some((sector) => ['infrastructure', 'employment'].includes(sector)) && /digital|technology|telecom|internet|broadband/i.test(source.name + ' ' + source.notes);
    return source.sectors.some((sector) => ['governance', 'public-finance'].includes(sector));
  });
}

function FieldGuidance({ departmentId }: { departmentId: DepartmentId }) {
  const guidance: Record<DepartmentId, { facts: string[]; hypotheses: string[] }> = {
    education: {
      facts: [
        'A registered official source reports a figure for its stated period and geography.',
        'A CommunityRecord was published after human review; publication does not independently verify the underlying condition.',
      ],
      hypotheses: [
        'A national or historical indicator describes current conditions in Kaduna South.',
        'A published demand establishes the prevalence, cause or scale of a school problem.',
      ],
    },
    health: {
      facts: [
        'A dated survey estimate or retrieved indicator may be stated with its source, period, geography and limitations.',
        'A facility registry entry establishes that a facility is listed, not that it is functional, staffed or stocked.',
      ],
      hypotheses: [
        'A national mortality estimate describes a particular Kaduna South facility.',
        'A published community report independently verifies medicines, staffing or service delivery.',
      ],
    },
    'software-technology': {
      facts: [
        'A specific published community record may be described as a published report.',
        'A technology-sector statistic may be stated only after its source, retrieval path, period and geography are integrated.',
      ],
      hypotheses: [
        'Nigeria or Kaduna South has a particular digital-access, broadband or software-sector score without an integrated source.',
        'A reported connectivity problem represents every ward or household.',
      ],
    },
    civic: {
      facts: [
        'A published demand exists in the public Mandate record and carries its stated location and duty.',
        'An official source reports only the measure, period and geography it actually publishes.',
      ],
      hypotheses: [
        'The number of published records measures national prevalence or public opinion.',
        'An announcement proves implementation, delivery or independent verification.',
        'Any candidate or political party is ranked or endorsed by ISEYC.',
      ],
    },
  };
  return <div className="department-guidance">
    <div><h3>May be stated as fact</h3><ul>{guidance[departmentId].facts.map((item) => <li key={item}>{item}</li>)}</ul></div>
    <div><h3>Must remain a hypothesis</h3><ul>{guidance[departmentId].hypotheses.map((item) => <li key={item}>{item}</li>)}</ul></div>
  </div>;
}

export default function Department() {
  const { departmentId: rawDepartmentId } = useParams();
  const department = DEPARTMENTS.find((item) => item.id === rawDepartmentId);
  const { sources, records, communityRecordProvenance } = useBundle();
  const departmentId = department?.id;
  const [evidence, setEvidence] = useState<DepartmentEvidence[]>([]);
  const [loading, setLoading] = useState(false);

  const indicators = useMemo(() => departmentId
    ? listIndicators().filter((indicator) => indicatorBelongsToDepartment(indicator.sector, departmentId))
    : [], [departmentId]);

  useEffect(() => {
    if (!departmentId) return;
    let active = true;
    setLoading(true);
    Promise.all(indicators.map(async (indicator: IndicatorDefinition) => {
      const result = await fetchViaGateway(indicator.id);
      return buildDepartmentEvidence(departmentId, indicator, result, new Date().toISOString());
    })).then((items) => {
      if (active) setEvidence(items.flat());
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [departmentId, indicators]);

  const relatedRecords = useMemo(
    () => departmentId ? records.filter((record) => recordMatchesDepartment(record, departmentId)) : [],
    [records, departmentId],
  );
  const registeredSources = useMemo(
    () => departmentId ? sourcesForDepartment(sources, departmentId) : [],
    [sources, departmentId],
  );
  const availableEvidence = evidence.filter((item) => item.evidenceStatus === 'integrated' || item.evidenceStatus === 'partial');
  const gaps = evidence.filter((item) => item.evidenceStatus === 'not-integrated' || item.evidenceStatus === 'unavailable');

  if (!department || !departmentId) {
    return <div className="page-heading"><h1>Department not found</h1><p className="muted">Choose one of the four official ISEYC departments.</p><a href="#/">Return to overview</a></div>;
  }

  return <>
    <PageHeader title={department.label} lead={<>{department.summary} <span className="muted">· Evidence is shown only when a registered retrieval path returns it.</span></>} />
    <div className="department-location-note" role="note">
      <strong>Geography rule</strong>
      <span>Figures retain their source geography. National or historical values are never presented as current Kaduna South facts.</span>
    </div>

    <Section title="1. Official evidence" id="official-evidence" note="Integrated or partially integrated source observations only">
      {loading && <p className="muted">Checking registered indicator retrieval paths…</p>}
      {availableEvidence.length ? <div className="department-evidence-list">
        {availableEvidence.map((item, index) => <article className="department-evidence-card" key={item.indicatorId + item.referencePeriod + index}>
          <div className="department-evidence-card__top"><strong>{item.indicatorId}</strong><span className={item.evidenceStatus === 'partial' ? 'status status--warning' : 'status'}>{item.evidenceStatus}</span></div>
          <div className="department-evidence-card__value">{item.value === null ? '—' : formatIndicatorValue(item.value, item.unit || '')} <small>{item.unit}</small></div>
          <p>{item.publisher}</p>
          <p className="muted">{item.referencePeriod} · {item.geography.label} · {item.geography.level}</p>
          <p className="muted">Retrieved {item.retrievedAt}</p>
          <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">Open registered source</a>
          {item.limitations.length > 0 && <details><summary>Limitations</summary><ul>{item.limitations.map((note) => <li key={note}>{note}</li>)}</ul></details>}
        </article>)}
      </div> : !loading && <div className="department-empty-state"><strong>No official figure integrated for this geography and indicator yet.</strong><p>This view will not substitute a zero, estimate a local value or convert national historical data into local facts.</p></div>}
    </Section>

    <Section title="2. Related published CommunityRecords" id="published-community-records" note="Civic Mandate · published-only">
      {communityRecordProvenance && <div className="department-feed-provenance" role="status">
        <strong>Feed source: {communityRecordProvenance.source}</strong>
        <span>Status: {communityRecordProvenance.status}{communityRecordProvenance.fallbackReason ? ` · Fallback reason: ${communityRecordProvenance.fallbackReason}` : ''}</span>
        {communityRecordProvenance.limitations.map((note) => <small key={note}>{note}</small>)}
      </div>}
      {relatedRecords.length ? <div className="department-record-list">
        {relatedRecords.slice(0, 20).map((record) => <article className="department-record" key={record.id}>
          <strong>{record.title}</strong>
          <p>{record.summary}</p>
          <p className="muted">{record.lga ? record.lga + ', ' : ''}{record.stateId} · {record.sourceDuty || 'Duty not supplied'} · {record.verificationStatus || 'unverified'}</p>
          <small>Published record. Not independent verification or a prevalence estimate.</small>
        </article>)}
      </div> : <div className="department-empty-state"><strong>No matching published CommunityRecords are available in this feed.</strong><p>This is not evidence that the issue does not exist.</p></div>}
      {relatedRecords.length > 20 && <p className="muted">Showing 20 of {relatedRecords.length} matching published records.</p>}
    </Section>

    <Section title="3. Unknowns and limitations" id="unknowns" note="What the current source stack cannot establish">
      {gaps.map((item) => <article className="department-gap" key={item.indicatorId}>
        <strong>{item.indicatorId}: {item.evidenceStatus === 'unavailable' ? 'Source unavailable' : 'No observation integrated'}</strong>
        <p>{item.limitations[item.limitations.length - 1]}</p>
      </article>)}
      {registeredSources.length > 0 && <div className="department-source-register">
        <h3>Registered source inventory — not proof of retrieved data</h3>
        {registeredSources.map((source) => <article key={source.id}>
          <a href={source.url || undefined} target="_blank" rel="noopener noreferrer">{source.name}</a>
          <p className="muted">{source.publisher} · {source.geoLevel} · last checked {source.lastChecked || 'not recorded'}</p>
          <p>{source.limitations.join(' ')}</p>
        </article>)}
      </div>}
      {departmentId === 'software-technology' && <div className="department-empty-state"><strong>No dedicated Software &amp; Technology indicator is integrated yet.</strong><p>No national digital-access or technology-sector score is inferred from unrelated datasets.</p></div>}
      {departmentId === 'education' && <p className="muted">The registered education indicator is national. No current Kaduna South school-level value is inferred from it.</p>}
      {departmentId === 'health' && <p className="muted">A facility registry listing does not establish functionality, staffing, medicines or service delivery. Any baseline remains tied to its own date and geography.</p>}
      {departmentId === 'civic' && <p className="muted">Published demands, community observations, official statistics and verified implementation evidence are separate evidence classes.</p>}
    </Section>

    <Section title="4. Field guidance" id="field-guidance" note="What an ISEYC member may state responsibly">
      <FieldGuidance departmentId={departmentId} />
    </Section>
  </>;
}
