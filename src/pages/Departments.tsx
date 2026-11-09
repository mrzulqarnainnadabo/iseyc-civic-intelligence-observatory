import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useBundle } from '../lib/data';
import { fetchViaGateway, type IndicatorObservation } from '../lib/indicators';
import { fetchDepartmentCommunityRecords, departmentMatchesRecord, stateRecordScope, type DepartmentCommunityFeed, type PublishedDepartmentRecord } from '../adapters/departmentCommunityRecords';
import { DEPARTMENT_EMPTY_STATE, type DepartmentId, type DepartmentEvidence, validateDepartmentEvidence } from '../data/departmentEvidence';
import NationalSnapshotGrid from '../components/NationalSnapshotGrid';
import { PageHeader, Section } from '../design/layout';
import inecPvc2023 from '../data/indicators/inec-pvc-2023.json';
import inecCvr2025 from '../data/indicators/inec-cvr-2025-26.json';
import stateReference from '../../contracts/states-ng.v1.json';

type DepartmentConfig = {
  id: DepartmentId; title: string; summary: string; sources: string[];
  indicators: { id: string; sourceId: string; label: string }[];
  unknowns: string[]; facts: string[]; hypotheses: string[];
};
const DEPARTMENTS: DepartmentConfig[] = [
  { id:'education', title:'Education & Capacity Building', summary:'Schooling, education access, capacity and learning evidence.',
    sources:['ubec-digest-2019-20','ubec-npa-2022-23','ubec-reports-digests','worldbank-wdi-primary-enrolment','nbs-microdata-catalog'],
    indicators:[{id:'wb-nga-se-prm-enrr',sourceId:'worldbank-wdi-primary-enrolment',label:'Primary school gross enrolment ratio'}],
    unknowns:['Current Kaduna South school-level enrolment, attendance and completion are not integrated.','Current teacher availability and learning outcomes for Kaduna South are not established by the registered national series.'],
    facts:['A source may be described by its publisher, dataset, reference period and stated geographic coverage.','A national gross enrolment ratio is not a Kaduna South school attendance rate.'],
    hypotheses:['A community report about a school may indicate a question for field inquiry; it does not establish how widespread the condition is.'] },
  { id:'health', title:'Health & Well-being', summary:'Population health evidence, health-system sources and published community concerns.',
    sources:['ndhs-2024','kaduna-ksphcb-recruitment-plan-2025','hfr','kaduna-hefa','nphcda-data-requisition','worldbank-wdi-under5-mortality','who-gho-nigeria'],
    indicators:[{id:'wb-nga-sh-dyn-mort',sourceId:'worldbank-wdi-under5-mortality',label:'Under-five mortality rate'}],
    unknowns:['Current Kaduna South facility staffing, medicine availability and service continuity are not integrated.','The Kaduna PHC recruitment plan is a March 2025 planning baseline, not a current headcount or proof of deployment.','HFR access requires an approved API key; HEFA raw data and public bulk export are not currently integrated.'],
    facts:['A registered facility is not proof that it is staffed, stocked or operational.','A national modelled mortality estimate cannot establish performance at a named PHC.'],
    hypotheses:['A published report about a facility can guide a follow-up question; it is not proof of a system-wide condition.'] },
  { id:'software-technology', title:'Software & Technology', summary:'Digital systems, software capacity and technology access — without unsupported indicators.',
    sources:[], indicators:[],
    unknowns:['No dedicated Software & Technology indicator or retrievable official dataset is integrated in the current Observatory registry.','No Kaduna South digital-access, software-sector or technology-employment figure is available in this department pack.'],
    facts:['The Observatory currently has no integrated official figure for this department.'],
    hypotheses:['Anecdotes about connectivity, device access or digital skills are leads for structured research, not population estimates.'] },
  { id:'civic', title:'Civic Department', summary:'Civic participation, published public concerns and official electoral evidence.',
    sources:['inec-voter-register-pvc','inec-cvr-2025-26','nimc-enrolment-oct-2025'],
    indicators:[],
    unknowns:['A final validated post-CVR national register and Kaduna South breakdown are not integrated.','Published community records do not establish how common a civic concern is.'],
    facts:['The CommunityRecord feed contains published records only.','INEC reference periods and measure definitions must be preserved; registration, PVC collection and turnout are different measures.'],
    hypotheses:['A concentration of published submissions may indicate where further investigation is useful, but not prevalence or public consensus.'] },
];
const PILOT_LOCATION = 'Kaduna South, Kaduna State';
const STATE_OPTIONS = stateReference.states;
const ALL_STATES = 'All states + FCT';

function RecordList({ records, scopeLabel }: { records: PublishedDepartmentRecord[]; scopeLabel: string }) {
  if (records.length === 0) return null;
  return (
    <div className="dept-records">
      <p className="dept-note">{scopeLabel}</p>
      {records.map((record) => (
        <article className="dept-record" key={record.id}>
          <strong>{record.text}</strong>
          <p>{record.duty || 'Duty not specified'} · {record.state || 'State not specified'}{record.lga ? ' · ' + record.lga : ' · LGA not specified'}</p>
          <span>Published · {record.verificationStatus} · not a prevalence measure</span>
          <a href={record.publicUrl} target="_blank" rel="noopener noreferrer">Read published record ↗</a>
        </article>
      ))}
    </div>
  );
}

export default function Departments() {
  const { departmentId } = useParams();
  const { sources } = useBundle();
  const [feed, setFeed] = useState<DepartmentCommunityFeed | null>(null);
  const [selectedState, setSelectedState] = useState('Kaduna');
  const [observations, setObservations] = useState<Record<string, { status: string; observations: IndicatorObservation[] }>>({});
  const [loadingEvidence, setLoadingEvidence] = useState(true);
  const config = DEPARTMENTS.find((item) => item.id === departmentId);
  useEffect(() => {
    let alive = true;
    fetchDepartmentCommunityRecords().then((result) => { if (alive) setFeed(result); });
    return () => { alive = false; };
  }, []);
  useEffect(() => {
    let alive = true;
    if (!config || config.indicators.length === 0) { setLoadingEvidence(false); return () => { alive = false; }; }
    setLoadingEvidence(true);
    Promise.all(config.indicators.map(async (indicator) => [indicator.id, await fetchViaGateway(indicator.id)] as const))
      .then((results) => {
        if (!alive) return;
        setObservations((previous) => ({ ...previous, ...Object.fromEntries(results.map(([id, result]) => [id, { status: result.status, observations: result.observations }])) }));
        setLoadingEvidence(false);
      });
    return () => { alive = false; };
  }, [departmentId]);
  const registeredSources = useMemo(() => config ? sources.filter((source) => config.sources.includes(source.id)) : [], [sources, departmentId]);
  const { localRecords, stateContextRecords } = useMemo(() => {
    const local: PublishedDepartmentRecord[] = [];
    const stateOnly: PublishedDepartmentRecord[] = [];
    if (!config || !feed) return { localRecords: local, stateContextRecords: stateOnly };
    for (const record of feed.records) {
      if (!departmentMatchesRecord(config.id, record)) continue;
      const scope = stateRecordScope(record, selectedState);
      if (scope === 'local') local.push(record);
      else if (scope === 'state-context' || scope === 'national-context') stateOnly.push(record);
    }
    return { localRecords: local, stateContextRecords: stateOnly };
  }, [feed, departmentId, config, selectedState]);
  if (!departmentId) return <>
    <PageHeader title="Department intelligence" lead="Four departmental entry points. Evidence, published community records and explicit unknowns." />
    <div className="dept-grid">{DEPARTMENTS.map((item) => <Link className="dept-card" key={item.id} to={'/departments/' + item.id}><span className="dept-card__kicker">ISEYC department</span><strong>{item.title}</strong><span>{item.summary}</span><span className="dept-card__action">Open intelligence →</span></Link>)}</div>
    <p className="dept-note">Nigeria · pilot focus: Kaduna South where local figures are shown. CommunityRecords are published submissions, not a census or prevalence estimate.</p>
  </>;
  if (!config) return <><PageHeader title="Department not found" /><Link to="/departments">Return to departments</Link></>;
  return <>
    <PageHeader title={config.title} lead={config.summary}>
      <p className="dept-location">Nigeria · pilot focus: Kaduna South where local figures are shown.</p>
      <Link to="/departments" className="dept-back">← All departments</Link>
    </PageHeader>
    <Section title="A. Official evidence" id="official-evidence">
      <p className="dept-note">Only registered publisher sources and dated evidence snapshots are shown. A source listing is not an integrated dataset.</p>\n      <NationalSnapshotGrid departmentId={config.id} />
      {registeredSources.length === 0 ? <div className="dept-empty">{DEPARTMENT_EMPTY_STATE}</div> : registeredSources.map((source) => {
        const indicator = config.indicators.find((item) => item.sourceId === source.id);
        const result = indicator ? observations[indicator.id] : undefined;
        const localObservation = result?.observations.find((obs) =>
          obs.geoLevel === 'lga' && /kaduna south/i.test((obs.geoCode || '').replace(/[-_]/g, ' ')));
        const mapped: DepartmentEvidence = {
          departmentId: config.id, indicatorId: indicator?.id || 'not-integrated', sourceId: source.id,
          publisher: source.publisher, sourceUrl: source.url || '', referencePeriod: localObservation?.referencePeriod || 'Not available for Kaduna South',
          retrievedAt: localObservation?.retrievedAt || 'not-retrieved',
          geography: { level:'lga', code:'kaduna-south', label:PILOT_LOCATION },
          value: localObservation?.value ?? null, unit: localObservation?.unit || null,
          evidenceStatus: localObservation ? 'integrated' : (indicator && result?.status === 'error' ? 'unavailable' : 'not-integrated'),
          limitations: [...source.limitations, 'No Kaduna South figure is displayed unless the retrieved observation explicitly identifies this LGA.'],
        };
        if (!validateDepartmentEvidence(mapped)) return <article className="dept-source" key={source.id}><strong>{source.name}</strong><p>Evidence metadata did not pass the DepartmentEvidence contract.</p></article>;
        return <article className="dept-source" key={source.id}>
          <div className="dept-source__head"><strong>{source.name}</strong><span className={'dept-status dept-status--' + mapped.evidenceStatus}>{mapped.evidenceStatus}</span></div>
          <p className="dept-source__publisher">{source.publisher} · registered coverage: {source.geographicCoverage}</p>
          {indicator && loadingEvidence ? <p>Checking the registered Evidence Gateway…</p> :
            <p className="dept-source__empty">{result?.status === 'error' ? 'Evidence Gateway unavailable. No substitute figure is shown.' : mapped.value === null ? DEPARTMENT_EMPTY_STATE : mapped.value.toLocaleString() + ' ' + (mapped.unit || '') + ' · ' + mapped.referencePeriod}</p>}
          {result?.observations.find((obs) => obs.geoLevel === 'national') && <p className="dept-note">National context only: {result.observations.find((obs) => obs.geoLevel === 'national')!.value.toLocaleString()} {result.observations.find((obs) => obs.geoLevel === 'national')!.unit || ''} · {result.observations.find((obs) => obs.geoLevel === 'national')!.referencePeriod}. This is not a Kaduna South figure.</p>}
          {source.url && <a href={source.url} target="_blank" rel="noopener noreferrer">Open registered source ↗</a>}
          <details><summary>Limitations and interpretation</summary><ul>{mapped.limitations.map((limit) => <li key={limit}>{limit}</li>)}</ul></details>
        </article>;
      })}
      {config.id === 'civic' && <>
        <article className="dept-source">
          <div className="dept-source__head"><strong>INEC 2023 validated register · Kaduna State</strong><span className="dept-status dept-status--integrated">integrated</span></div>
          <p className="dept-source__publisher">Independent National Electoral Commission · state-level administrative snapshot · reference date 5 February 2023</p>
          <div className="dept-civic-metrics">
            <div><strong>{inecPvc2023.records.find((row) => row.state === 'Kaduna')?.registeredVoters.toLocaleString('en-NG')}</strong><span>Registered voters</span></div>
            <div><strong>{inecPvc2023.records.find((row) => row.state === 'Kaduna')?.collectedPVCs.toLocaleString('en-NG')}</strong><span>PVCs collected</span></div>
          </div>
          <p className="dept-note">Kaduna State figures, not Kaduna South. This is a historical 2023 election snapshot, not a current voter register or turnout measure.</p>
          <a href={inecPvc2023.sourceUrl} target="_blank" rel="noopener noreferrer">Open INEC source PDF ↗</a>
          <details><summary>Source limitations</summary><ul>{inecPvc2023.limitations.map((limit) => <li key={limit}>{limit}</li>)}</ul></details>
        </article>
        <article className="dept-source">
          <div className="dept-source__head"><strong>INEC Continuous Voter Registration · phase-one statements</strong><span className="dept-status dept-status--partial">partial</span></div>
          <p className="dept-source__publisher">Independent National Electoral Commission · national · statements published 4 and 5 February 2026</p>
          <div className="dept-civic-metrics">
            {inecCvr2025.records.map((record) => <div key={record.statementId}><strong>{record.newEligibleVotersReported.toLocaleString('en-NG')}</strong><a href={record.sourceUrl} target="_blank" rel="noopener noreferrer">{record.publicationDate} official statement ↗</a></div>)}
          </div>
          <p className="dept-note">The two official statements differ by two registrations. No final validated post-CVR national register or Kaduna South breakdown is integrated.</p>
          <details><summary>Source limitations</summary><ul>{inecCvr2025.limitations.map((limit) => <li key={limit}>{limit}</li>)}</ul></details>
        </article>
      </>}
    </Section>
    <Section title="B. Related published CommunityRecords" id="community-records">
      <div className="dept-feed-meta"><span>Source: {feed?.source || 'Loading Mandate CommunityRecord v0.1'}</span><span>{feed?.fallbackReason ? 'Fallback reason: ' + feed.fallbackReason : feed?.status === 'ready' ? 'Primary contract · v0.1.0' : ''}</span></div>
      <div className="dept-state-filter">
        <label htmlFor="department-state-filter">Filter published submissions by state</label>
        <select id="department-state-filter" value={selectedState} onChange={(event) => setSelectedState(event.target.value)}>
          <option value="All states + FCT">All Nigeria · 36 states + FCT</option>
          {STATE_OPTIONS.map((state) => <option key={state} value={state}>{state}</option>)}
        </select>
      </div>
      <p className="dept-note">This filter applies to published CommunityRecords only. Official indicators retain their source geography; national figures remain national context.</p>
      {!feed ? <p>Loading published records…</p> :
       feed.status === 'unavailable' || feed.status === 'invalid' ? <div className="dept-empty">{feed.message} <small>Reason: {feed.fallbackReason}</small></div> :
       localRecords.length === 0 && stateContextRecords.length === 0 ? <div className="dept-empty">No related published CommunityRecords are currently available for this department in {selectedState === ALL_STATES ? 'Nigeria across the selected national feed' : selectedState}. This does not mean the need is absent.</div> :
       <>
         {selectedState === 'Kaduna' && <RecordList records={localRecords} scopeLabel="Kaduna South, Kaduna State · LGA-matched published records only." />}
         <RecordList records={stateContextRecords} scopeLabel={selectedState === ALL_STATES ? 'Nigeria · published submissions across all available states and FCT. These records are not a census or prevalence measure.' : selectedState === 'Kaduna' ? 'Kaduna State context · statewide or other-LGA submissions. Not claimed as Kaduna South local records.' : selectedState + ' · published submissions with state-level matching; no LGA-level dataset is inferred.'} />
       </>}
      {feed?.limitations.map((limit) => <p className="dept-note" key={limit}>{limit}</p>)}
    </Section>
    <Section title="C. Unknowns and limitations" id="unknowns">
      <ul className="dept-list">{config.unknowns.map((item) => <li key={item}>{item}</li>)}</ul>
      <p className="dept-note">Official announcement ≠ implementation ≠ independent verification. Each stage requires its own evidence.</p>
    </Section>
    <Section title="D. Field guidance" id="field-guidance">
      <div className="dept-guidance">
        <div><h3>What you may state as fact</h3><ul>{config.facts.map((item) => <li key={item}>{item}</li>)}</ul></div>
        <div><h3>What remains a hypothesis</h3><ul>{config.hypotheses.map((item) => <li key={item}>{item}</li>)}</ul></div>
      </div>
      <p className="dept-note">Do not claim that a programme has been implemented or a condition independently verified unless the corresponding evidence is available.</p>
    </Section>
  </>;
}
