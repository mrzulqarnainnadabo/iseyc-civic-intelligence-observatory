import pvc2023 from '../../data/indicators/inec-pvc-2023.json' with { type: 'json' };
import ekiti2026 from '../../data/indicators/inec-ekiti-2026.json' with { type: 'json' };
import osun2026 from '../../data/indicators/inec-osun-2026.json' with { type: 'json' };
import cvr2025_26 from '../../data/indicators/inec-cvr-2025-26.json' with { type: 'json' };

const DATASETS = {
  '2023-pvc': pvc2023,
  'ekiti-2026-register': ekiti2026,
  'osun-2026-pvc': osun2026,
  'cvr-2025-26': cvr2025_26,
};

function send(res, status, body) {
  res.statusCode = status;
  res.end(JSON.stringify(body));
}

/**
 * GET /api/evidence/inec?catalog=1
 * GET /api/evidence/inec?dataset=2023-pvc
 * GET /api/evidence/inec?dataset=2023-pvc&state=Kaduna
 * GET /api/evidence/inec?dataset=all
 *
 * Read-only, allowlisted public INEC snapshots. These are source transcriptions,
 * not a live INEC API and not a current nationwide voter register.
 */
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== 'GET') {
    send(res, 405, { contractVersion: '1.0.0', error: 'METHOD_NOT_ALLOWED' });
    return;
  }

  const url = new URL(req.url || '/', 'http://localhost');
  if (url.searchParams.get('catalog') === '1') {
    send(res, 200, {
      contractVersion: '1.0.0',
      publisher: 'Independent National Electoral Commission (INEC)',
      datasets: Object.values(DATASETS).map((dataset) => ({
        datasetId: dataset.datasetId,
        title: dataset.title,
        sourceReferenceDate: dataset.sourceReferenceDate || dataset.sourcePublicationDate || null,
        retrievedAt: dataset.retrievedAt,
        geographicLevel: dataset.geographicLevel,
        recordCount: dataset.records.length,
        sourceUrl: dataset.sourceUrl,
        limitations: dataset.limitations,
      })),
      note: 'Allowlisted official-source transcriptions. Not a live INEC API or a current national voter register.',
    });
    return;
  }

  const datasetId = url.searchParams.get('dataset') || 'all';
  if (datasetId === 'all') {
    send(res, 200, {
      contractVersion: '1.0.0',
      status: 'ok',
      publisher: 'Independent National Electoral Commission (INEC)',
      datasets: Object.values(DATASETS).map((dataset) => dataset),
      note: 'Historical and state-specific official-source transcriptions. Preserve each dataset reference period and limitation.',
    });
    return;
  }

  const dataset = DATASETS[datasetId];
  if (!dataset) {
    send(res, 404, { contractVersion: '1.0.0', status: 'error', error: 'DATASET_NOT_FOUND', datasets: [] });
    return;
  }

  let records = dataset.records;
  const state = url.searchParams.get('state');
  if (state) {
    if (datasetId !== '2023-pvc' && datasetId !== 'ekiti-2026-register' && datasetId !== 'osun-2026-pvc') {
      send(res, 400, { contractVersion: '1.0.0', status: 'error', error: 'STATE_FILTER_NOT_SUPPORTED', datasets: [] });
      return;
    }
    records = records.filter((record) => String(record.state || '').toLowerCase() === state.trim().toLowerCase());
  }

  send(res, 200, {
    contractVersion: '1.0.0',
    status: records.length ? 'ok' : 'empty',
    datasetId: dataset.datasetId,
    title: dataset.title,
    publisher: dataset.publisher,
    sourceUrl: dataset.sourceUrl,
    sourceReferenceDate: dataset.sourceReferenceDate || dataset.sourcePublicationDate || null,
    retrievedAt: dataset.retrievedAt,
    methodology: dataset.methodology,
    limitations: dataset.limitations,
    reconciliation: dataset.reconciliation || null,
    records,
    recordCount: records.length,
  });
}
