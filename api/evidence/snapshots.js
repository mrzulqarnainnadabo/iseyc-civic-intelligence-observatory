import snapshotData from '../../data/indicators/national-source-snapshots.json' with { type: 'json' };
import sourceRegistry from '../../data/source-registry.json' with { type: 'json' };

const sourceById = new Map(sourceRegistry.map((source) => [source.id, source]));
const allowedDepartments = new Set(['education', 'health', 'software-technology', 'civic']);

function validObservation(item) {
  const source = sourceById.get(item?.sourceId);
  let sourceHost = '';
  let registryHost = '';
  try {
    sourceHost = new URL(item?.sourceUrl).hostname;
    registryHost = new URL(source?.url).hostname;
  } catch { return false; }
  return Boolean(
    item && typeof item.id === 'string' && item.id &&
    typeof item.title === 'string' && item.title &&
    typeof item.value === 'number' && Number.isFinite(item.value) &&
    typeof item.unit === 'string' && item.unit &&
    typeof item.referencePeriod === 'string' && item.referencePeriod &&
    typeof item.sourceId === 'string' && source &&
    ['official_source', 'published_research'].includes(item.sourceType) &&
    typeof item.sourcePublisher === 'string' && item.sourcePublisher &&
    item.sourceUrl.startsWith('https://') && sourceHost === registryHost &&
    ['national', 'state', 'varies'].includes(item.geoLevel) &&
    Array.isArray(item.departments) && item.departments.length > 0 &&
    item.departments.every((department) => allowedDepartments.has(department)) &&
    Array.isArray(item.limitations) && item.limitations.length > 0 &&
    item.limitations.every((limitation) => typeof limitation === 'string' && limitation.length > 0) &&
    (item.sourceUpdateDate === undefined || /^\\d{4}-\\d{2}-\\d{2}$/.test(item.sourceUpdateDate))
  );
}
/**
 * GET /api/evidence/snapshots
 * Curated source transcriptions only; never presented as a live upstream feed.
 */
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-ISEYC-Evidence-Snapshots', 'v1');

  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.end(JSON.stringify({ contractVersion: '1.0.0', error: 'METHOD_NOT_ALLOWED' }));
    return;
  }

  const observations = Array.isArray(snapshotData.observations) ? snapshotData.observations : [];
  if (snapshotData.schemaVersion !== '1.0.0' || !observations.every(validObservation)) {
    res.statusCode = 500;
    res.end(JSON.stringify({ contractVersion: '1.0.0', status: 'invalid', error: 'SNAPSHOT_CONTRACT_INVALID', observations: [] }));
    return;
  }

  res.statusCode = 200;
  res.end(JSON.stringify({
    contractVersion: '1.0.0',
    status: observations.length ? 'curated' : 'empty',
    title: snapshotData.title,
    description: snapshotData.description,
    checkedAt: snapshotData.checkedAt,
    observations,
    catalogOnlySources: Array.isArray(snapshotData.catalogOnlySources) ? snapshotData.catalogOnlySources : [],
    limitations: [
      'These are manually transcribed source snapshots, not live feeds. Each record keeps its source reference period and checked date.',
      'The source publisher owns the original data; ISEYC does not produce or independently certify these statistics.',
      'National values do not establish state, LGA, ward or facility conditions unless the source explicitly supplies that geography.',
      'A source catalogue entry does not mean its dataset has been ingested or validated.',
    ],
  }));
}
