import type { CivicRecord, EvidenceItem } from '../data/types';
import { STAGE_LABEL } from '../data/types';
import { StageStatusChip, EvidenceBadge } from './primitives';
import { CLAIM_LABEL, claimStrength } from '../lib/rules';

export function LifecycleTimeline({ record, evidence }: { record: CivicRecord; evidence: EvidenceItem[] }) {
  return (
    <ol className="timeline" aria-label={`Lifecycle of ${record.id}`}>
      {record.stages.map(s => {
        const ev = s.evidenceId ? evidence.find(e => e.id === s.evidenceId) : undefined;
        return (
          <li key={s.stage} className={`timeline__item timeline__item--${s.status}`}>
            <span className="timeline__dot" aria-hidden="true" />
            <div>
              <strong>{STAGE_LABEL[s.stage]}</strong> <StageStatusChip status={s.status} />
              {ev && <div className="timeline__ev"><EvidenceBadge kind={ev.kind} small /> <span>{ev.title}</span> <time dateTime={ev.date}>{ev.date}</time></div>}
            </div>
          </li>
        );
      })}
      <li className="timeline__verdict"><strong>{CLAIM_LABEL[claimStrength(record, evidence)]}</strong></li>
    </ol>
  );
}

/** Compact six-cell strip for tables. */
export function StageStrip({ record }: { record: CivicRecord }) {
  return (
    <span className="strip" aria-label={record.stages.map(s => `${STAGE_LABEL[s.stage]}: ${s.status}`).join('; ')}>
      {record.stages.map(s => <i key={s.stage} className={`strip__cell strip__cell--${s.status}`} title={`${STAGE_LABEL[s.stage]}: ${s.status}`} />)}
    </span>
  );
}
