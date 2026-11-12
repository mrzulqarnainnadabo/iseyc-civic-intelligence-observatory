import snapshotData from '../../data/indicators/national-source-snapshots.json' with { type: 'json' };
import legacySnapshotData from '../../src/data/indicators/national-department-snapshots.v1.json' with { type: 'json' };
import sourceRegistry from '../../data/source-registry.json' with { type: 'json' };

const MAX_RECORDS = 20;
const SOURCE_ID = 'iseyc-observatory-national-snapshots-v1';
const sourceById = new Map(sourceRegistry.map((source) => [source.id, source]));
const allowedDepartments = new Set(['education', 'health', 'software-technology', 'civic']);
const TO_INTERNAL_DEPARTMENT_ID = { 'digital-systems': 'software-technology', 'civic-affairs': 'civic' };
const TO_PUBLIC_DEPARTMENT_ID = { 'software-technology': 'digital-systems', civic: 'civic-affairs' };

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
    (item.sourceUpdateDate === undefined || /^\d{4}-\d{2}-\d{2}$/.test(item.sourceUpdateDate))
  );
}

export function selectSnapshotRecords(records, departmentId) {
  const internalDepartmentId = TO_INTERNAL_DEPARTMENT_ID[departmentId] || departmentId;
  const matching = records.filter((record) => {
    if (!internalDepartmentId) return true;
    return record.departmentId === internalDepartmentId || record.departmentIds?.includes(internalDepartmentId);
  });
  return matching.slice(0, MAX_RECORDS);
}

function publicDepartmentRecord(record) {
  return {
    ...record,
    ...(record.departmentId ? { departmentId: TO_PUBLIC_DEPARTMENT_ID[record.departmentId] || record.departmentId } : {}),
    ...(Array.isArray(record.departmentIds) ? { departmentIds: record.departmentIds.map((id) => TO_PUBLIC_DEPARTMENT_ID[id] || id) } : {}),
  };
}

function selectObservations(observations, departmentId) {
  const internalDepartmentId = TO_INTERNAL_DEPARTMENT_ID[departmentId] || departmentId;
  if (!internalDepartmentId) return observations;
  return observations.filter((item) => item.departments.includes(internalDepartmentId));
}

function send(res, status, body) {
  res.statusCode = status;
  res.end(JSON.stringify(body));
}

/**
 * GET /api/evidence/snapshots
 * One versioned endpoint serving both legacy department records and curated numeric observations.
 * The two arrays retain their distinct schemas and are never silently merged.
 */
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('X-ISEYC-Evidence-Snapshots', 'v1');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== 'GET') {
    send(res, 405, { contractVersion: '1.0.0', status: 'error', error: 'METHOD_NOT_ALLOWED', records: [], observations: [] });
    return;
  }

  const url = new URL(req.url || '/', 'http://localhost');
  const departmentId = url.searchParams.get('departmentId');
  const allowedPublicDepartments = new Set(['education', 'health', 'digital-systems', 'civic-affairs', 'software-technology', 'civic']);
  if (departmentId && !allowedPublicDepartments.has(departmentId)) {
    send(res, 400, { contractVersion: '1.0.0', status: 'error', error: 'DEPARTMENT_NOT_ALLOWED', records: [], observations: [] });
    return;
  }

  const observations = Array.isArray(snapshotData.observations) ? snapshotData.observations : [];
  if (snapshotData.schemaVersion !== '1.0.0' || !observations.every(validObservation)) {
    send(res, 500, { contractVersion: '1.0.0', status: 'invalid', error: 'SNAPSHOT_CONTRACT_INVALID', records: [], observations: [] });
    return;
  }

  const records = selectSnapshotRecords(legacySnapshotData.records || [], departmentId).map(publicDepartmentRecord);
  const selectedObservations = selectObservations(observations, departmentId);

  if (url.searchParams.get('catalog') === '1') {
    send(res, 200, {
      contractVersion: '1.0.0',
      source: SOURCE_ID,
      retrievedAt: legacySnapshotData.retrievedAt,
      checkedAt: snapshotData.checkedAt,
      recordCount: records.length,
      records: records.map((record) => ({
        id: record.id,
        title: record.title,
        publisher: record.publisher,
        sourceId: record.sourceId,
        sourceUrl: record.sourceUrl,
        referencePeriod: record.referencePeriod,
        geography: record.geography,
        evidenceType: record.evidenceType,
      })),
      observationCount: selectedObservations.length,
      observations: selectedObservations,
      catalogOnlySources: Array.isArray(snapshotData.catalogOnlySources) ? snapshotData.catalogOnlySources : [],
      note: 'Curated, dated publisher-source transcriptions. This is not a live feed from the listed institutions.',
    });
    return;
  }

  send(res, 200, {
    contractVersion: '1.0.0',
    status: records.length || selectedObservations.length ? 'ok' : 'empty',
    source: SOURCE_ID,
    retrievedAt: legacySnapshotData.retrievedAt,
    checkedAt: snapshotData.checkedAt,
    recordCount: records.length,
    records,
    observations: selectedObservations,
    observationCount: selectedObservations.length,
    title: snapshotData.title,
    description: snapshotData.description,
    catalogOnlySources: Array.isArray(snapshotData.catalogOnlySources) ? snapshotData.catalogOnlySources : [],
    note: legacySnapshotData.note || snapshotData.description,
    limitations: [
      'Manually transcribed source snapshots, not live feeds from publishers.',
      'Snapshots are manually curated source transcriptions, not continuously refreshed publisher feeds.',
      'Legacy department records and numeric observations are separate evidence schemas; do not combine their counts.',
      'Each item retains its own source, reference period, geography, measurement type and limitations.',
      'The source publisher owns the original data; ISEYC does not produce or independently certify these statistics.',
      'National values do not establish state, LGA, ward, facility or household conditions unless the source explicitly supplies that geography.',
      'A source catalogue entry does not mean its dataset has been ingested or validated.',
    ],
  });
}
