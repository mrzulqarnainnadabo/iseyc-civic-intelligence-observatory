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
  api?: { provider: string; urlTemplate: string };
  methodologyNotes: string;
  licence: string;
  limitations: string[];
  updateFrequency: string;
  lastVerifiedAccess: string;
}

export interface IndicatorObservation {
  indicatorId: string;
  date: string;
  value: number;
  sourcePublisher: string;
  retrievedAt: string;
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

/** Fetch observations for a World Bank-backed indicator. Fails soft with empty series. */
export async function fetchIndicatorObservations(
  indicator: IndicatorDefinition,
  fetchImpl: typeof fetch = fetch,
): Promise<{ observations: IndicatorObservation[]; error?: string }> {
  if (!indicator.api?.urlTemplate) {
    return { observations: [], error: 'NO_API' };
  }
  try {
    const res = await fetchImpl(indicator.api.urlTemplate, { headers: { Accept: 'application/json' } });
    if (!res.ok) return { observations: [], error: `HTTP_${res.status}` };
    const body = (await res.json()) as unknown;
    if (!Array.isArray(body) || body.length < 2 || !Array.isArray(body[1])) {
      return { observations: [], error: 'MALFORMED' };
    }
    const retrievedAt = new Date().toISOString();
    const observations: IndicatorObservation[] = [];
    for (const row of body[1] as { date?: string; value?: number | null }[]) {
      if (!row || row.value == null || typeof row.value !== 'number' || !row.date) continue;
      observations.push({
        indicatorId: indicator.id,
        date: String(row.date),
        value: row.value,
        sourcePublisher: indicator.sourcePublisher,
        retrievedAt,
      });
    }
    observations.sort((a, b) => a.date.localeCompare(b.date));
    return { observations };
  } catch {
    return { observations: [], error: 'FETCH_FAILED' };
  }
}

export function formatIndicatorValue(value: number, unit: string): string {
  if (unit.includes('percent')) return `${value.toFixed(1)}%`;
  if (unit.includes('1,000')) return value.toFixed(1);
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)} million`;
  return new Intl.NumberFormat('en-NG').format(Math.round(value));
}
