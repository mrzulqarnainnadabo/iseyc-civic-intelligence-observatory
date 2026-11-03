import { createContext, useContext, useEffect, useState } from 'react';
import type { ObservatoryAdapter } from '../data/types';

export const AdapterContext = createContext<ObservatoryAdapter | null>(null);
export function useAdapter(): ObservatoryAdapter { const a = useContext(AdapterContext); if (!a) throw new Error('AdapterContext missing'); return a; }

export type Async<T> = { status: 'loading' } | { status: 'error'; message: string } | { status: 'ready'; data: T };

export function useAsync<T>(load: () => Promise<T>, deps: unknown[]): Async<T> & { reload: () => void } {
  const [state, setState] = useState<Async<T>>({ status: 'loading' });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let live = true; setState({ status: 'loading' });
    load().then(d => { if (live) setState({ status: 'ready', data: d }); },
      e => { if (live) setState({ status: 'error', message: e instanceof Error ? e.message : String(e) }); });
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);
  return { ...state, reload: () => setTick(t => t + 1) };
}

export interface LiteCtx { lite: boolean; setLite: (v: boolean) => void }
export const LiteContext = createContext<LiteCtx>({ lite: false, setLite: () => {} });
export const useLite = () => useContext(LiteContext);

export function initialLite(): boolean {
  try {
    const saved = localStorage.getItem('iseyc-obs-lite'); if (saved !== null) return saved === '1';
  } catch { /* storage unavailable */ }
  const c = (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return !!c && (c.saveData === true || c.effectiveType === '2g' || c.effectiveType === 'slow-2g');
}
export function persistLite(v: boolean) { try { localStorage.setItem('iseyc-obs-lite', v ? '1' : '0'); } catch { /* ignore */ } }
