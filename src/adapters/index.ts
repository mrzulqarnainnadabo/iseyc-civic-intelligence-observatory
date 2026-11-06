import type { ObservatoryAdapter } from '../data/types';
import { createDemoAdapter, type DemoBehaviour } from './demoAdapter';
import { createMandatePulseAdapter } from './mandatePulseAdapter';

/**
 * Default: published Civic Mandate CommunityRecord v0.1 feed.
 * Synthetic demonstration fixtures are selected only by an explicit ?demo= flag.
 * A CommunityRecord outage or invalid response is surfaced as unavailable; no pulse fallback.
 */
export function selectAdapter(
  search: string = typeof location !== 'undefined'
    ? location.search + (location.hash.split('?')[1] ? '&' + location.hash.split('?')[1] : '')
    : '',
): ObservatoryAdapter {
  const p = new URLSearchParams(search.replace(/^\?/, ''));
  const demo = (p.get('demo') || '').toLowerCase();
  if (demo === '1' || demo === 'true' || demo === 'normal' || demo === 'empty' || demo === 'error' || demo === 'slow') {
    const behaviour: DemoBehaviour =
      demo === 'empty' || demo === 'error' || demo === 'slow' ? demo : 'normal';
    return createDemoAdapter({ behaviour });
  }
  return createMandatePulseAdapter();
}
