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
  'wb-nga-eg-elc-accs-zs': {
    id: 'wb-nga-eg-elc-accs-zs',
    worldBankIndicator: 'EG.ELC.ACCS.ZS',
    datasetId: 'world-bank-wdi',
    unit: 'percent of population',
    measurementType: 'estimated',
    title: 'Access to electricity (% of population)',
    definition: 'Share of the population with access to electricity, as defined by the World Bank indicator metadata.',
    methodologyNotes: 'World Bank World Development Indicators. National series compiled from nationally reported and internationally harmonised sources; consult the original metadata for the observation-specific source and method.',
    limitations: [
      'National aggregate only; not state, LGA or household-level evidence.',
      'Access does not establish reliability, affordability, hours of supply or quality.',
      'Missing years are not zero; estimates may be revised by the source.',
    ],
    sourcePublisher: 'World Bank — World Development Indicators',
    sourceUrl: 'https://data.worldbank.org/indicator/EG.ELC.ACCS.ZS?locations=NG',
    geoLevel: 'national',
    geoCode: 'NGA',
  },
  'wb-nga-it-net-user-zs': {
    id: 'wb-nga-it-net-user-zs',
    worldBankIndicator: 'IT.NET.USER.ZS',
    datasetId: 'world-bank-wdi',
    unit: 'percent of population',
    measurementType: 'estimated',
    title: 'Individuals using the Internet (% of population)',
    definition: 'Percentage of individuals who used the Internet from any location and for any purpose, using the source definition.',
    methodologyNotes: 'World Bank World Development Indicators. The series is based on source-reported estimates and harmonised telecommunications statistics; see the indicator metadata for source details and revisions.',
    limitations: [
      'National aggregate only; does not show state, LGA, gender or age-group differences.',
      'Internet use does not measure connection quality, affordability, device ownership or digital skills.',
      'Missing years are not zero; estimates may be revised by the source.',
    ],
    sourcePublisher: 'World Bank — World Development Indicators',
    sourceUrl: 'https://data.worldbank.org/indicator/IT.NET.USER.ZS?locations=NG',
    geoLevel: 'national',
    geoCode: 'NGA',
  },
  'wb-nga-sl-uem-totl-zs': {
    id: 'wb-nga-sl-uem-totl-zs',
    worldBankIndicator: 'SL.UEM.TOTL.ZS',
    datasetId: 'world-bank-wdi',
    unit: 'percent of total labour force',
    measurementType: 'modelled',
    title: 'Unemployment, total (% of total labour force)',
    definition: 'Share of the labour force without work but available for and seeking employment, following the ILO modelled estimate definition.',
    methodologyNotes: 'World Bank World Development Indicators, ILO modelled estimates. This is a modelled labour-market series; it is not a count of registered unemployed people or a measure of job quality.',
    limitations: [
      'National aggregate only; do not infer state or LGA unemployment from this series.',
      'Modelled estimates depend on harmonised labour-force concepts and may differ from NBS national labour-force survey measures.',
      'Not directly interchangeable with Nigeria Labour Force Survey estimates under different methods or reference periods.',
    ],
    sourcePublisher: 'World Bank — World Development Indicators (ILO modelled estimates)',
    sourceUrl: 'https://data.worldbank.org/indicator/SL.UEM.TOTL.ZS?locations=NG',
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
