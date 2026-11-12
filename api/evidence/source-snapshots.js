import snapshotData from '../../data/indicators/national-source-snapshots.json' with { type: 'json' };
import sourceRegistry from '../../data/source-registry.json' with { type: 'json' };

const sourceById = new Map(sourceRegistry.map((source) => [source.id, source]));
const allowedDepartments = new Set(['education', 'health', 'software-technology', 'civic']);
const allowedCatalogueStatuses = new Set(['catalogue', 'partial', 'under_review']);

function sameHost(url, registeredUrl) {
  try {
    return new URL(url).hostname === new URL(registeredUrl).hostname;
  } catch {
    return false;
  }
}

function validIsoDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(value + 'T00:00:00Z');
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function validObservation(item) {
  const source = sourceById.get(item?.sourceId);
  const expectedType = source?.kind === 'official-data'
    ? 'official_source'
    : source?.kind === 'published-research'
      ? 'published_research'
      : null;

  return Boolean(
    item && typeof item.id === 'string' && item.id.trim() &&
    typeof item.title === 'string' && item.title.trim() &&
    typeof item.value === 'number' && Number.isFinite(item.value) &&
    typeof item.unit === 'string' && item.unit.trim() &&
    typeof item.referencePeriod === 'string' && item.referencePeriod.trim() &&
    typeof item.measurementType === 'string' && item.measurementType.trim() &&
    typeof item.sourceId === 'string' && source &&
    expectedType && item.sourceType === expectedType &&
    typeof item.sourcePublisher === 'string' && item.sourcePublisher.trim() &&
    typeof item.sourceUrl === 'string' && item.sourceUrl.startsWith('https://') &&
    typeof source.url === 'string' && sameHost(item.sourceUrl, source.url) &&
    ['national', 'state', 'varies'].includes(item.geoLevel) &&
    typeof item.geographicCoverage === 'string' && item.geographicCoverage.trim() &&
    Array.isArray(item.departments) && item.departments.length > 0 &&
    item.departments.every((department) => allowedDepartments.has(department)) &&
    Array.isArray(item.limitations) && item.limitations.length > 0 &&
    item.limitations.every((limitation) => typeof limitation === 'string' && limitation.trim()) &&
    (item.sourceUpdateDate === undefined || validIsoDate(item.sourceUpdateDate))
  );
}

function validCatalogueSource(item) {
  const source = sourceById.get(item?.id);
  return Boolean(
    item && source &&
    typeof item.title === 'string' && item.title.trim() &&
    typeof item.publisher === 'string' && item.publisher.trim() &&
    typeof item.url === 'string' && item.url.startsWith('https://') &&
    typeof source.url === 'string' && sameHost(item.url, source.url) &&
    allowedCatalogueStatuses.has(item.status) &&
    typeof item.note === 'string' && item.note.trim() &&
    Array.isArray(item.departments) && item.departments.length > 0 &&
    item.departments.every((department) => allowedDepartments.has(department))
  );
}

function validReconciliationNote(item) {
  return Boolean(
    item && typeof item.id === 'string' && item.id.trim() &&
    ['high', 'medium', 'low'].includes(item.severity) &&
    typeof item.title === 'string' && item.title.trim() &&
    typeof item.detail === 'string' && item.detail.trim() &&
    typeof item.action === 'string' && item.action.trim()
  );
}

function validBundle() {
  const observations = Array.isArray(snapshotData.observations) ? snapshotData.observations : [];
  const catalogue = Array.isArray(snapshotData.catalogOnlySources) ? snapshotData.catalogOnlySources : [];
  const notes = Array.isArray(snapshotData.reconciliationNotes) ? snapshotData.reconciliationNotes : [];
  const observationIds = observations.map((item) => item?.id);
  const noteIds = notes.map((item) => item?.id);
  return snapshotData.schemaVersion === '1.0.0' &&
    validIsoDate(snapshotData.checkedAt) &&
    new Set(observationIds).size === observationIds.length &&
    new Set(noteIds).size === noteIds.length &&
    observations.every(validObservation) &&
    catalogue.every(validCatalogueSource) &&
    notes.every(validReconciliationNote) &&
    Array.isArray(snapshotData.limitations) &&
    snapshotData.limitations.length > 0;
}

function send(res, status, body) {
  res.statusCode = status;
  res.end(JSON.stringify(body));
}

/**
 * GET /api/evidence/source-snapshots
 * GET /api/evidence/source-snapshots?departmentId=health
 * GET /api/evidence/source-snapshots?catalog=1
 *
 * Public, curated transcriptions. The existing /api/evidence/snapshots contract
 * remains untouched for its current consumers.
 */
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-ISEYC-Evidence-Snapshots', 'v1');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== 'GET') {
    send(res, 405, { contractVersion: '1.0.0', status: 'error', error: 'METHOD_NOT_ALLOWED' });
    return;
  }

  if (!validBundle()) {
    send(res, 500, {
      contractVersion: '1.0.0',
      status: 'invalid',
      error: 'SNAPSHOT_CONTRACT_INVALID',
      observations: [],
      catalogOnlySources: [],
      reconciliationNotes: []
    });
    return;
  }

  const url = new URL(req.url || '/', 'http://localhost');
  const departmentId = url.searchParams.get('departmentId');
  if (departmentId && !allowedDepartments.has(departmentId)) {
    send(res, 400, { contractVersion: '1.0.0', status: 'error', error: 'DEPARTMENT_NOT_ALLOWED' });
    return;
  }

  const observations = snapshotData.observations.filter((item) => !departmentId || item.departments.includes(departmentId));
  const catalogue = snapshotData.catalogOnlySources.filter((item) => !departmentId || item.departments.includes(departmentId));
  const common = {
    contractVersion: '1.0.0',
    source: 'iseyc-observatory-curated-source-snapshots-v1',
    checkedAt: snapshotData.checkedAt,
    reconciliationNotes: snapshotData.reconciliationNotes,
    limitations: snapshotData.limitations
  };

  if (url.searchParams.get('catalog') === '1') {
    send(res, 200, { ...common, status: 'curated', recordCount: observations.length, catalogOnlySources: catalogue });
    return;
  }

  send(res, 200, {
    ...common,
    status: observations.length ? 'curated' : 'empty',
    title: snapshotData.title,
    description: snapshotData.description,
    recordCount: observations.length,
    observations,
    catalogOnlySources: catalogue
  });
}
