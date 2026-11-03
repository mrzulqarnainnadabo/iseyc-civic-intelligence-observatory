import type { ReactNode } from 'react';
import { Button } from './primitives';

export function Loading({ label = 'Loading' }: { label?: string }) {
  return <div className="state state--loading" role="status" aria-live="polite"><span className="spinner" aria-hidden="true" />{label}…</div>;
}
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="state state--error" role="alert">
      <h3>We could not load this</h3><p>{message}</p>
      <p className="muted">Nothing has been lost. Check your connection and try again; the rest of the site still works.</p>
      {onRetry && <Button variant="primary" onClick={onRetry}>Try again</Button>}
    </div>
  );
}
export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return <div className="empty state state--empty"><strong>{title}</strong>{children && <p>{children}</p>}{action}</div>;
}
export function Banner({ tone = 'info', children }: { tone?: 'info' | 'warn' | 'demo'; children: ReactNode }) {
  return <div className={`banner banner--${tone}`} role="note">{children}</div>;
}
