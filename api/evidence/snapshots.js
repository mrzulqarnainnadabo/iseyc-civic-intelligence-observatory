import snapshotData from '../../data/indicators/national-source-snapshots.json' with { type: 'json' };

function validObservation(item) {
  return Boolean(
    item && typeof item.id === 'string' && item.id &&
    typeof item.title === 'string' && item.title &&
    typeof item.value === 'number' && Number.isFinite(item.value) &&
    typeof item.unit === 'string' && item.unit &&
    typeof item.referencePeriod === 'string' && item.referencePeriod &&
    typeof item.sourceId === 'string' && item.sourceId &&
    typeof item.sourcePublisher === 'string' && item.sourcePublisher &&
    typeof item.sourceUrl === 'string' && item.sourceUrl.startsWith('https://') &&
    Array.isArray(item.departments) && Array.isArray(item.limitations)
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
