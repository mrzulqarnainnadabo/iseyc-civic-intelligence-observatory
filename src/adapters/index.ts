import type { ObservatoryAdapter } from '../data/types';
import { createDemoAdapter, type DemoBehaviour } from './demoAdapter';
import { createMandatePulseAdapter, DEFAULT_PULSE_URL } from './mandatePulseAdapter';

/**
 * Default: published Civic Mandate pulse (real moderated public records).
 * Demo synthetic set: add ?demo=normal|empty|error|slow (for tests and offline review).
 * Optional override: ?pulse=<url> (https only, host allowlisted to Mandate production/preview later if needed).
 */
export function selectAdapter(
  search: string = typeof location !== 'undefined'
    ? location.search + (location.hash.split('?')[1] ? '&' + location.hash.split('?')[1] : '')
    : '',
): ObservatoryAdapter {
  const p = new URLSearchParams(search.replace(/^\?/, ''));
  const demo = p.get('demo');
  if (demo === 'empty' || demo === 'error' || demo === 'slow' || demo === 'normal') {
    const behaviour: DemoBehaviour = demo === 'normal' ? 'normal' : demo;
    return createDemoAdapter({ behaviour });
  }
  const pulse = p.get('pulse');
  const pulseUrl =
    pulse && pulse.startsWith('https://') && pulse.includes('2027-street-mandate')
      ? pulse
      : DEFAULT_PULSE_URL;
  return createMandatePulseAdapter({ pulseUrl });
}
