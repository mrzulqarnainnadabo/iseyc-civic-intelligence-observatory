import { useMemo, useState } from 'react';
import { useBundle } from '../lib/data';
import { useAdapter } from '../lib/hooks';
import { Section } from '../design/layout';
import { EmptyState } from '../design/feedback';
import { Button, SyntheticChip } from '../design/primitives';
import { LifecycleTimeline } from '../design/timeline';
import { SECTOR_LABEL } from '../data/types';
import { CLAIM_LABEL, claimStrength } from '../lib/rules';

export default function Accountability() {
  const adapter = useAdapter();
  const isDemo = adapter.mode === 'demo';
  const { records, evidence, states, institutions } = useBundle();
  const [open, setOpen] = useState('');
  const rows = useMemo(() => records, [records]);
  const current = rows.find((record) => record.id === open);

  return <>
    <header className="page-heading"><h1>Accountability</h1><span className="page-heading__meta">{isDemo ? 'Demonstration workflow' : 'Published community records'}</span></header>
    {isDemo && <p><SyntheticChip /></p>}
    <p className="muted">No verified institutional responses are connected to this feed yet.</p>
    <Section title={`Records · ${rows.length}`} id="accountability-records">
      {rows.length === 0 ? <EmptyState title="No records available" /> : <div className="tablewrap"><table className="table">
        <caption className="sr-only">Community records and current evidence status</caption>
        <thead><tr><th scope="col">Record</th><th scope="col">Place</th><th scope="col">Evidence status</th><th scope="col"> </th></tr></thead>
        <tbody>{rows.map((record) => <tr key={record.id} className={open === record.id ? 'row--on' : ''}>
          <th scope="row">{record.title}<br /><span className="muted">{record.sector ? SECTOR_LABEL[record.sector] : 'Unclassified'}</span></th>
          <td>{states.find((state) => state.id === record.stateId)?.name ?? record.stateId}</td>
          <td>{CLAIM_LABEL[claimStrength(record, evidence)]}</td>
          <td><Button variant="ghost" aria-expanded={open === record.id} onClick={() => setOpen(open === record.id ? '' : record.id)}> {open === record.id ? 'Close' : 'Review'} </Button></td>
        </tr>)}</tbody>
      </table></div>}
    </Section>
    {current && <Section title={current.title} id="record-review">
      <p>{current.summary}</p>
      <p className="muted">{states.find((state) => state.id === current.stateId)?.name ?? current.stateId} · {current.sector ? SECTOR_LABEL[current.sector] : 'Unclassified'} · {isDemo ? 'Demonstration' : 'Published'}</p>
      <p><strong>Evidence status:</strong> {CLAIM_LABEL[claimStrength(current, evidence)]}</p>
      {current.institutionIds.length > 0 && <p className="muted">Institution references require legal-basis review: {current.institutionIds.map((id) => institutions.find((institution) => institution.id === id)?.name ?? id).join(', ')}</p>}
      <LifecycleTimeline record={current} evidence={evidence} />
      <h3>Unknowns</h3>
      {current.unknowns.length ? <ul className="plain">{current.unknowns.map((item) => <li key={item}>{item}</li>)}</ul> : <p className="muted">No unknowns recorded.</p>}
      <h3>Next checks</h3>
      <ul className="plain">{current.nextSteps.map((item) => <li key={item}>{item}</li>)}</ul>
    </Section>}
  </>;
}