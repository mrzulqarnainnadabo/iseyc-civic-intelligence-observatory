import { useMemo, useState } from 'react';
import { useBundle } from '../lib/data';
import { useAdapter } from '../lib/hooks';
import { PageHeader, Section } from '../design/layout';
import { Banner, EmptyState } from '../design/feedback';
import { Card, SelectField, SyntheticChip } from '../design/primitives';
import { BarChart } from '../design/charts';
import { LifecycleTimeline, StageStrip } from '../design/timeline';
import { SECTOR_LABEL, STAGE_LABEL, STAGES } from '../data/types';
import { CLAIM_LABEL, claimStrength, countBy } from '../lib/rules';

export default function Accountability() {
  const adapter = useAdapter();
  const isDemo = adapter.mode === 'demo';
  const { records, evidence, institutions, states } = useBundle();
  const [inst, setInst] = useState('');
  const [open, setOpen] = useState('');
  const rows = useMemo(() => records.filter(r => !inst || r.institutionIds.includes(inst)), [records, inst]);
  const claims = countBy(rows, r => claimStrength(r, evidence));
  const cur = records.find(r => r.id === open);
  const instName = (id: string) => institutions.find(i => i.id === id)?.name ?? id;
  return (
    <>
      <PageHeader
        title="Accountability"
        lead="Trace the path from a published demand to duty, institution, public commitment, and any evidence of delivery. Announcement is not implementation. Budget is not expenditure. Expenditure is not verified service delivery."
      />
      <p className="hero__meta" style={{marginTop:0,marginBottom:'1rem'}}>
        <span className="chip chip--real">Stages kept distinct</span>
        {isDemo ? <span className="chip chip--synth">Demo records only</span> : <span className="chip chip--real">Published Mandate records</span>}
        <span className="chip chip--pilot">No invented institutional replies</span>
      </p>
      <Banner tone="warn"><strong>Responsibility mappings are unverified.</strong> They are illustrative here. Before any real publication, each mapping needs a legal basis (enabling Act or instrument) and two-reviewer approval.</Banner>
      <Card title="Filter"><SelectField label="Institution" value={inst} onChange={setInst} allLabel="All institutions" options={institutions.map(i => ({ value: i.id, label: `${i.name} (${i.tier})` }))} /></Card>
      <div className="grid2">
        <Section title="What the evidence supports" id="claims" note={<><SyntheticChip /> Invented records. Counts show how the claim check works.</>}>
          {rows.length === 0 ? <EmptyState title="No published records for this filter">Only published records in the current dataset are listed. Empty does not mean the issue is absent on the ground.</EmptyState> :
            <BarChart ariaLabel="Records by claim strength" unit="records" items={Object.entries(CLAIM_LABEL).map(([k, label]) => ({ key: k, label, value: (claims as Record<string, number>)[k] ?? 0 }))} />}
        </Section>
        <Section title="Stage key" id="key">
          <ol className="plain">{STAGES.map(s => <li key={s}><strong>{STAGE_LABEL[s]}</strong></li>)}</ol>
          <p className="muted">Each record shows six cells in this order. Dark = evidenced, outlined = claimed only, pale = unknown, empty = not reached. Only the last cell, backed by independent evidence, establishes delivery.</p>
        </Section>
      </div>
      <Section title={`Records (${rows.length})`} id="tbl">
        {rows.length === 0 ? <EmptyState title="Nothing to show in this dataset">No published records match these filters. That is not a claim about prevalence or resolution.</EmptyState> : (
          <>
            <div className="tablewrap tablewrap--desktop"><table className="table"><caption className="sr-only">Records with lifecycle strip and claim strength</caption>
              <thead><tr><th scope="col">Record</th><th scope="col">State</th><th scope="col">Institutions</th><th scope="col">Stages</th><th scope="col">Evidence says</th></tr></thead>
              <tbody>{rows.map(r => (
                <tr key={r.id} className={open === r.id ? 'row--on' : ''}>
                  <th scope="row"><button type="button" className="linkbtn" onClick={() => setOpen(r.id)}>{r.title.replace('Demonstration: ', '')}</button><br /><span className="muted">{SECTOR_LABEL[r.sector]} · {r.id}</span></th>
                  <td>{states.find(s => s.id === r.stateId)?.name}</td>
                  <td>{r.institutionIds.map(instName).join('; ')}</td>
                  <td><StageStrip record={r} /></td>
                  <td>{CLAIM_LABEL[claimStrength(r, evidence)]}</td>
                </tr>))}</tbody></table></div>
            <ul className="acc-cards" aria-label="Records (mobile layout)">
              {rows.map(r => (
                <li key={`m-${r.id}`} className={`acc-card${open === r.id ? ' acc-card--on' : ''}`}>
                  <button type="button" className="acc-card__btn" onClick={() => setOpen(open === r.id ? '' : r.id)} aria-expanded={open === r.id}>
                    <strong>{r.title.replace('Demonstration: ', '')}</strong>
                    <span className="muted">{SECTOR_LABEL[r.sector]} · {states.find(s => s.id === r.stateId)?.name} · {r.id}</span>
                    <span className="acc-card__claim">{CLAIM_LABEL[claimStrength(r, evidence)]}</span>
                    <StageStrip record={r} />
                  </button>
                  <p className="muted acc-card__inst">{r.institutionIds.map(instName).join('; ')}</p>
                </li>
              ))}
            </ul>
          </>
        )}
      </Section>
      {cur && <Section title={`Lifecycle: ${cur.id}`} id="life"><LifecycleTimeline record={cur} evidence={evidence} />
        <h3>Unknowns</h3><ul className="plain">{cur.unknowns.length ? cur.unknowns.map(u => <li key={u}>{u}</li>) : <li>None recorded.</li>}</ul>
        <h3>Next steps</h3><ul className="plain">{cur.nextSteps.map(u => <li key={u}>{u}</li>)}</ul></Section>}
    </>
  );
}
