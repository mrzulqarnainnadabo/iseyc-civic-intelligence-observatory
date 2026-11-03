import catalog from '../data/indicators/nga-pilot-indicators.json';

export type MeasurementType = 'measured' | 'estimated' | 'modelled' | 'derived';

export interface IndicatorDefinition {
  id: string;
  title: string;
  definition: string;
  unit: string;
  measurementType: MeasurementType;
  sector: string;
  geoLevel: string;
  geographicCoverage: string;
  sourceDatasetId: string;
  sourcePublisher: string;
  sourceUrl: string;
  methodologyNotes: string;
  licence: string;
  limitations: string[];
  updateFrequency: string;
  lastVerifiedAccess: string;
}

export interface IndicatorObservation {
  observationId?: string;
  indicatorId: string;
  datasetId?: string;
  geoCode?: string;
  geoLevel?: string;
  referencePeriod: string;
  value: number;
  unit?: string;
  sourceAttribution?: string;
  sourcePublisher: string;
  sourceUrl?: string;
  retrievedAt: string;
  qualityFlags?: string[];
}

export interface GatewayResult {
  status: 'ok' | 'empty' | 'error';
  errorClass?: string;
  message?: string;
  cache?: string;
  indicator?: Record<string, unknown> | null;
  observations: IndicatorObservation[];
  receipt?: Record<string, unknown> | null;
  persistence?: { mode: string; note: string };
}

export interface IndicatorCatalog {
  schemaVersion: string;
  title: string;
  description: string;
  operator: string;
  indicators: IndicatorDefinition[];
  datasets: { id: string; title: string; publisher: string; sourceUrl: string; licence: string }[];
}

export function getIndicatorCatalog(): IndicatorCatalog {
  return catalog as IndicatorCatalog;
}

export function listIndicators(): IndicatorDefinition[] {
  return getIndicatorCatalog().indicators;
}

/**
 * Prefer Evidence Gateway. Never call arbitrary upstream URLs from the client.
 * Optional fetchImpl for tests.
 */
export async function fetchViaGateway(
  indicatorId: string,
  fetchImpl: typeof fetch = fetch,
  base = '',
): Promise<GatewayResult> {
  const url = `${base}/api/evidence/observations?indicatorId=${encodeURIComponent(indicatorId)}`;
  try {
    const res = await fetchImpl(url, { headers: { Accept: 'application/json' } });
    const body = (await res.json()) as Record<string, unknown>;
    if (!body || typeof body !== 'object') {
      return { status: 'error', errorClass: 'MALFORMED_GATEWAY', observations: [] };
    }
    const rawObs = Array.isArray(body.observations) ? (body.observations as Record<string, unknown>[]) : [];
    const observations: IndicatorObservation[] = rawObs
      .filter((o) => o && typeof o.value === 'number' && (o.referencePeriod || o.date))
      .map((o) => ({
        observationId: typeof o.observationId === 'string' ? o.observationId : undefined,
        indicatorId: String(o.indicatorId || indicatorId),
        datasetId: typeof o.datasetId === 'string' ? o.datasetId : undefined,
        geoCode: typeof o.geoCode === 'string' ? o.geoCode : undefined,
        geoLevel: typeof o.geoLevel === 'string' ? o.geoLevel : undefined,
        referencePeriod: String(o.referencePeriod || o.date),
        value: o.value as number,
        unit: typeof o.unit === 'string' ? o.unit : undefined,
        sourceAttribution: typeof o.sourceAttribution === 'string' ? o.sourceAttribution : undefined,
        sourcePublisher:
          (typeof o.sourceAttribution === 'string' && o.sourceAttribution) ||
          (typeof o.sourcePublisher === 'string' && o.sourcePublisher) ||
          'Unknown source',
        sourceUrl: typeof o.sourceUrl === 'string' ? o.sourceUrl : undefined,
        retrievedAt: typeof o.retrievedAt === 'string' ? o.retrievedAt : new Date().toISOString(),
        qualityFlags: Array.isArray(o.qualityFlags) ? (o.qualityFlags as string[]) : undefined,
      }));
    return {
      status: (body.status as GatewayResult['status']) || (res.ok ? 'ok' : 'error'),
      errorClass: typeof body.errorClass === 'string' ? body.errorClass : undefined,
      message: typeof body.message === 'string' ? body.message : undefined,
      cache: typeof body.cache === 'string' ? body.cache : undefined,
      indicator: (body.indicator as Record<string, unknown> | null) ?? null,
      observations,
      receipt: (body.receipt as Record<string, unknown> | null) ?? null,
      persistence: body.persistence as GatewayResult['persistence'],
    };
  } catch {
    return { status: 'error', errorClass: 'GATEWAY_UNREACHABLE', observations: [] };
  }
}

/** @deprecated Prefer fetchViaGateway — kept for tests that inject mock series */
export async function fetchIndicatorObservations(
  indicator: IndicatorDefinition,
  fetchImpl: typeof fetch = fetch,
): Promise<{ observations: IndicatorObservation[]; error?: string; receipt?: unknown }> {
  const result = await fetchViaGateway(indicator.id, fetchImpl);
  if (result.status === 'error') {
    return { observations: [], error: result.errorClass || 'ERROR', receipt: result.receipt };
  }
  return {
    observations: result.observations,
    error: result.status === 'empty' ? 'EMPTY' : undefined,
    receipt: result.receipt,
  };
}

export function formatIndicatorValue(value: number, unit: string): string {
  if (unit.includes('percent')) return `${value.toFixed(1)}%`;
  if (unit.includes('1,000')) return value.toFixed(1);
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)} million`;
  return new Intl.NumberFormat('en-NG').format(Math.round(value));
}
