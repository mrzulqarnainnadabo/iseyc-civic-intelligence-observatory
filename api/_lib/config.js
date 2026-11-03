/** @typedef {{ id: string, worldBankIndicator: string, datasetId: string, unit: string, measurementType: string, title: string, definition: string, methodologyNotes: string, limitations: string[], sourcePublisher: string, sourceUrl: string, geoLevel: 'national', geoCode: string }} PilotIndicator */

/** Strict host allowlist for upstream fetches */
export const ALLOWED_HOSTS = Object.freeze(['api.worldbank.org']);

/** Only these ISEYC pilot indicator IDs may be requested */
export const PILOT_INDICATORS = Object.freeze({
  'wb-nga-sp-pop-totl': {
    id: 'wb-nga-sp-pop-totl',
    worldBankIndicator: 'SP.POP.TOTL',
    datasetId: 'world-bank-wdi',
    unit: 'persons',
    measurementType: 'estimated',
    title: 'Population, total',
    definition:
      'Total population counts all residents regardless of legal status or citizenship. Values are mid-year estimates.',
    methodologyNotes:
      'World Bank WDI; aggregates and estimates from national sources and UN Population Division where applicable.',
    limitations: [
      'National aggregate only — not state or LGA resolution.',
      'Estimates may be revised when new censuses or surveys are released.',
      'ISEYC does not produce this series.',
    ],
    sourcePublisher: 'World Bank — World Development Indicators',
    sourceUrl: 'https://data.worldbank.org/indicator/SP.POP.TOTL?locations=NG',
    geoLevel: 'national',
    geoCode: 'NGA',
  },
  'wb-nga-se-prm-enrr': {
    id: 'wb-nga-se-prm-enrr',
    worldBankIndicator: 'SE.PRM.ENRR',
    datasetId: 'world-bank-wdi',
    unit: 'percent (gross)',
    measurementType: 'estimated',
    title: 'School enrollment, primary (% gross)',
    definition:
      'Gross enrollment ratio: total enrollment regardless of age relative to the official age group for the level.',
    methodologyNotes: 'WDI series typically draws on UNESCO UIS / national education data. Gross ratios can exceed 100%.',
    limitations: [
      'National aggregate only.',
      'Does not measure learning outcomes or facility quality.',
      'Missing years are absent data, not zero enrollment.',
    ],
    sourcePublisher: 'World Bank — World Development Indicators',
    sourceUrl: 'https://data.worldbank.org/indicator/SE.PRM.ENRR?locations=NG',
    geoLevel: 'national',
    geoCode: 'NGA',
  },
  'wb-nga-sh-dyn-mort': {
    id: 'wb-nga-sh-dyn-mort',
    worldBankIndicator: 'SH.DYN.MORT',
    datasetId: 'world-bank-wdi',
    unit: 'per 1,000 live births',
    measurementType: 'estimated',
    title: 'Mortality rate, under-5 (per 1,000 live births)',
    definition:
      'Probability per 1,000 that a newborn dies before age five if subject to age-specific mortality rates of that year.',
    methodologyNotes: 'Often based on UN IGME modelled estimates underlying WDI.',
    limitations: [
      'National estimate — not a state league table.',
      'Modelled estimates carry uncertainty.',
      'Not a measure of any single health programme.',
    ],
    sourcePublisher: 'World Bank — World Development Indicators',
    sourceUrl: 'https://data.worldbank.org/indicator/SH.DYN.MORT?locations=NG',
    geoLevel: 'national',
    geoCode: 'NGA',
  },
});

export const ALLOWED_COUNTRY = 'NGA';
export const CONTRACT_VERSION = '1.0.0';
export const DEFAULT_TIMEOUT_MS = 8000;
export const MAX_RESPONSE_BYTES = 512_000;
export const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours in-memory
export const DATE_RANGE = '2015:2024';

export function isAllowedHost(hostname) {
  return ALLOWED_HOSTS.includes(hostname);
}

export function getPilot(indicatorId) {
  return PILOT_INDICATORS[indicatorId] || null;
}

export function buildWorldBankUrl(worldBankIndicator) {
  const u = new URL(
    `https://api.worldbank.org/v2/country/${ALLOWED_COUNTRY}/indicator/${encodeURIComponent(worldBankIndicator)}`,
  );
  u.searchParams.set('format', 'json');
  u.searchParams.set('per_page', '30');
  u.searchParams.set('date', DATE_RANGE);
  return u.toString();
}
