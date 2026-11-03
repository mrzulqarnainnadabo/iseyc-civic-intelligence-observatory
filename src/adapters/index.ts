import type { ObservatoryAdapter } from '../data/types';
import { createDemoAdapter, type DemoBehaviour } from './demoAdapter';
import { createMandatePulseAdapter, DEFAULT_PULSE_URL } from './mandatePulseAdapter';

const ALLOWED_PULSE_HOSTS = new Set([
  '2027-street-mandate.vercel.app',
]);

function resolvePulseUrl(raw: string | null): string {
  if (!raw) return DEFAULT_PULSE_URL;
  try {
    const u = new URL(raw);
    if (u.protocol !== 'https:') return DEFAULT_PULSE_URL;
    if (!ALLOWED_PULSE_HOSTS.has(u.hostname)) return DEFAULT_PULSE_URL;
    if (!u.pathname.includes('/api/pulse')) return DEFAULT_PULSE_URL;
    return u.toString();
  } catch {
    return DEFAULT_PULSE_URL;
  }
}

/**
 * Default: published Civic Mandate pulse (real moderated public records).
 * Demo synthetic set: ?demo=1|true|normal|empty|error|slow
 * Optional ?pulse= only if https host is allowlisted Mandate production host.
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
  return createMandatePulseAdapter({ pulseUrl: resolvePulseUrl(p.get('pulse')) });
}
