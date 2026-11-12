import snapshotData from '../../data/indicators/national-source-snapshots.json' with { type: 'json' };
import sourceRegistry from '../../data/source-registry.json' with { type: 'json' };

const CONTRACT_VERSION = '1.0.0';
const SOURCE = 'iseyc-observatory-curated-source-snapshots-v1';
const sourceById = new Map(sourceRegistry.map((source) => [source.id, source]));

function validObservation(item) {
  const source = sourceById.get(item?.sourceId);
  let sourceHost = '';
  let registryHost = '';
  try {
    sourceHost = new URL(item?.sourceUrl).hostname;
    registryHost = new URL(source?.url).hostname;
  } catch { return false; }
  return Boolean(
    item && typeof item.id === 'string' && item.id.trim() &&
    typeof item.title === 'string' && item.title.trim() &&
    typeof item.value === 'number' && Number.isFinite(item.value) &&
    typeof item.unit === 'string' && item.unit.trim() &&
    typeof item.referencePeriod === 'string' && item.referencePeriod.trim() &&
    typeof item.measurementType === 'string' && item.measurementType.trim() &&
    typeof item.sourceId === 'string' && source &&
    typeof item.sourcePublisher === 'string' && item.sourcePublisher.trim() &&
    item.sourceUrl.startsWith('https://') && sourceHost === registryHost &&
    ['official_source', 'published_research'].includes(item.sourceType) &&
    ['national', 'state', 'varies'].includes(item.geoLevel) &&
    typeof item.geographicCoverage === 'string' && item.geographicCoverage.trim() &&
    Array.isArray(item.departments) && item.departments.length > 0 &&
    item.departments.every((department) => ['education', 'health', 'software-technology', 'civic'].includes(department)) &&
    Array.isArray(item.limitations) && item.limitations.length > 0 &&
    item.limitations.every((limitation) => typeof limitation === 'string' && limitation.trim()) &&
    typeof item.interpretation === 'string' && item.interpretation.trim() &&
    (item.sourceUpdateDate === undefined || /^\d{4}-\d{2}-\d{2}$/.test(item.sourceUpdateDate)) &&
    (item.verificationStatus === undefined || ['official_announcement', 'published_secondary_report', 'reconciliation_required'].includes(item.verificationStatus))
  );
}

function send(res, status, body) {
  res.statusCode = status;
  res.end(JSON.stringify(body));
}

/**
 * GET /api/evidence/source-snapshots
 * Versioned numeric-observation contract for department intelligence and Civic Brain.
 * This is separate from /api/evidence/snapshots, which preserves legacy department records.
 */
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('X-ISEYC-Source-Snapshots', CONTRACT_VERSION);

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== 'GET') {
    send(res, 405, { contractVersion: CONTRACT_VERSION, source: SOURCE, status: 'error', observations: [], error: 'METHOD_NOT_ALLOWED' });
    return;
  }

  const observations = Array.isArray(snapshotData.observations) ? snapshotData.observations : [];
  if (snapshotData.schemaVersion !== CONTRACT_VERSION || !observations.every(validObservation)) {
    send(res, 500, { contractVersion: CONTRACT_VERSION, source: SOURCE, status: 'invalid', observations: [], error: 'SOURCE_SNAPSHOT_CONTRACT_INVALID' });
    return;
  }

  const catalogOnlySources = Array.isArray(snapshotData.catalogOnlySources)
    ? snapshotData.catalogOnlySources.filter((item) => sourceById.has(item.id))
    : [];
  send(res, 200, {
    contractVersion: CONTRACT_VERSION,
    source: SOURCE,
    status: observations.length ? 'curated' : 'empty',
    checkedAt: snapshotData.checkedAt,
    observations,
    catalogOnlySources,
    limitations: [
      'Curated, dated source transcriptions; not live publisher feeds.',
      'Published secondary figures marked reconciliation_required are not independently verified by ISEYC.',
      'A catalogue entry does not mean its underlying data has been ingested or validated.',
      'National aggregates do not establish state, LGA, ward, facility or household conditions unless the source explicitly supplies that geography.'
    ],
    reconciliationNotes: Array.isArray(snapshotData.reconciliationNotes) ? snapshotData.reconciliationNotes : [],
    stateBudgetCoverage: snapshotData.stateBudgetCoverage || null
  });
}
