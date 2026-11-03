import type { ReactNode } from 'react';

export interface BarItem { key: string; label: string; value: number; hint?: ReactNode }

/** Horizontal bars as a real list: works without JS charts, screen readers and low bandwidth. */
export function BarChart({ items, unit, max, ariaLabel }: { items: BarItem[]; unit: string; max?: number; ariaLabel: string }) {
  const top = max ?? Math.max(1, ...items.map(i => i.value));
  return (
    <ul className="bars" aria-label={ariaLabel}>
      {items.map(i => (
        <li key={i.key} className="bars__row">
          <span className="bars__label">{i.label}</span>
          <span className="bars__track" aria-hidden="true"><span className="bars__fill" style={{ width: `${Math.round((i.value / top) * 100)}%` }} /></span>
          <span className="bars__value">{i.value}<span className="sr-only"> {unit}</span></span>
          {i.hint && <span className="bars__hint">{i.hint}</span>}
        </li>
      ))}
    </ul>
  );
}

export function Funnel({ steps, total, unit }: { steps: { key: string; label: string; value: number; note?: string }[]; total: number; unit: string }) {
  return (
    <ol className="funnel">
      {steps.map(s => (
        <li key={s.key} className="funnel__row">
          <div className="funnel__bar" style={{ width: `${total ? Math.max(4, Math.round((s.value / total) * 100)) : 4}%` }}><span>{s.value}</span></div>
          <div className="funnel__text"><strong>{s.label}</strong><span className="muted"> {s.value} of {total} {unit}</span>{s.note && <em>{s.note}</em>}</div>
        </li>
      ))}
    </ol>
  );
}
