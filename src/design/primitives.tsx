import type { ReactNode, ButtonHTMLAttributes } from 'react';
import type { EvidenceKind, EvidenceStatus, SourceRecord, StageStatus } from '../data/types';
import { KIND_LABEL, STATUS_LABEL, STAGE_STATUS_LABEL } from '../data/types';

const KIND_GLYPH: Record<EvidenceKind, string> = {
  'official-data': '\u25A0', 'published-research': '\u25B2', 'media-report': '\u25CF', 'community-submission': '\u25C6', 'independently-verified': '\u2713',
};

/** Evidence class badge. Shape glyph + text, never colour alone. */
export function EvidenceBadge({ kind, small }: { kind: EvidenceKind; small?: boolean }) {
  return <span className={`badge badge--${kind}${small ? ' badge--sm' : ''}`} title={KIND_LABEL[kind]}><span aria-hidden="true">{KIND_GLYPH[kind]}</span> {KIND_LABEL[kind]}</span>;
}
export function StatusBadge({ status }: { status: EvidenceStatus }) {
  return <span className={`status status--${status}`}>{STATUS_LABEL[status]}</span>;
}
export function StageStatusChip({ status }: { status: StageStatus }) {
  return <span className={`stagechip stagechip--${status}`}>{STAGE_STATUS_LABEL[status]}</span>;
}
export function SyntheticChip({ block }: { block?: boolean }) {
  return <span className={`synthetic${block ? ' synthetic--block' : ''}`} title="Invented data used only to demonstrate the interface">DEMONSTRATION DATA</span>;
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' };
export function Button({ variant = 'secondary', className = '', ...rest }: BtnProps) {
  return <button type="button" className={`btn btn--${variant} ${className}`} {...rest} />;
}

export function Card({ title, children, actions, className = '', as: Tag = 'section' }: { title?: ReactNode; children: ReactNode; actions?: ReactNode; className?: string; as?: 'section' | 'article' | 'div' }) {
  return (
    <Tag className={`card ${className}`}>
      {(title || actions) && <header className="card__head">{title && <h3 className="card__title">{title}</h3>}{actions}</header>}
      {children}
    </Tag>
  );
}

export function ChipGroup<T extends string>({ label, value, options, onChange, allLabel = 'All' }: { label: string; value: T | ''; options: { value: T; label: string }[]; onChange: (v: T | '') => void; allLabel?: string }) {
  return (
    <div role="group" aria-label={label} className="chips">
      <span className="chips__label">{label}</span>
      <button type="button" className={`chip${value === '' ? ' chip--on' : ''}`} aria-pressed={value === ''} onClick={() => onChange('')}>{allLabel}</button>
      {options.map(o => (
        <button key={o.value} type="button" className={`chip${value === o.value ? ' chip--on' : ''}`} aria-pressed={value === o.value} onClick={() => onChange(o.value)}>{o.label}</button>
      ))}
    </div>
  );
}

export function SearchBox({ value, onChange, label, placeholder }: { value: string; onChange: (v: string) => void; label: string; placeholder?: string }) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <input className="input" type="search" value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} />
    </label>
  );
}

export function SelectField({ label, value, onChange, options, allLabel }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; allLabel: string }) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <select className="input" value={value} onChange={e => onChange(e.target.value)}>
        <option value="">{allLabel}</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

const URL_TEXT: Record<SourceRecord['urlStatus'], string> = {
  confirmed: 'Link confirmed in research', 'domain-confirmed': 'Domain confirmed; page not located',
  'documented-not-reconfirmed': 'Link documented, not re-confirmed', 'not-applicable': 'No link: not yet operating',
};

/** Source citation block, reused in the registry and evidence views. */
export function SourceCitation({ s, compact }: { s: SourceRecord; compact?: boolean }) {
  return (
    <div className="citation">
      <div className="citation__top"><EvidenceBadge kind={s.kind} small /><span className={`urlstat urlstat--${s.urlStatus}`}>{URL_TEXT[s.urlStatus]}</span></div>
      <p className="citation__name">{s.url ? <a href={s.url} target="_blank" rel="noreferrer noopener">{s.name}</a> : s.name}</p>
      <p className="citation__pub">{s.publisher}</p>
      {!compact && (
        <dl className="facts">
          <div><dt>Coverage</dt><dd>{s.geographicCoverage}</dd></div>
          <div><dt>Data type</dt><dd>{s.dataType}</dd></div>
          <div><dt>Updates</dt><dd>{s.updateFrequency}</dd></div>
          <div><dt>Licence / reuse</dt><dd>{s.licence}</dd></div>
          <div><dt>Last checked</dt><dd>{s.lastChecked ?? 'Not checked yet'}{s.checkedHow ? ` (${s.checkedHow})` : ''}</dd></div>
        </dl>
      )}
      {!compact && <div className="limits"><strong>Known limitations</strong><ul>{s.limitations.map((l, i) => <li key={i}>{l}</li>)}</ul>{s.notes && <p className="muted">{s.notes}</p>}</div>}
    </div>
  );
}
