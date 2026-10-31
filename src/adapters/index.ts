import type { ObservatoryAdapter } from '../data/types';
import { createDemoAdapter, type DemoBehaviour } from './demoAdapter';

/** Chooses the adapter. Only the demo adapter is wired by default; see docs/INTEGRATION_GUIDE.md. */
export function selectAdapter(search: string = typeof location !== 'undefined' ? location.search + (location.hash.split('?')[1] ? '&' + location.hash.split('?')[1] : '') : ''): ObservatoryAdapter {
  const p = new URLSearchParams(search.replace(/^\?/, ''));
  const b = p.get('demo');
  const behaviour: DemoBehaviour = b === 'empty' || b === 'error' || b === 'slow' ? b : 'normal';
  return createDemoAdapter({ behaviour });
}
