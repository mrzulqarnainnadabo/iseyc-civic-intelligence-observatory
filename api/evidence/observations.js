import { retrieveObservations, listPilotCatalog, resolvePilotRequest } from '../_lib/gateway.js';

/**
 * GET /api/evidence/observations?indicatorId=wb-nga-sp-pop-totl
 * GET /api/evidence/observations?catalog=1
 */
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-ISEYC-Evidence-Gateway', 'v1');

  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'METHOD_NOT_ALLOWED' }));
    return;
  }

  const url = new URL(req.url || '/', 'http://localhost');
  if (url.searchParams.get('catalog') === '1') {
    res.statusCode = 200;
    res.end(
      JSON.stringify({
        contractVersion: '1.0.0',
        indicators: listPilotCatalog(),
        note: 'Pilot allowlist only. Arbitrary indicators are rejected.',
      }),
    );
    return;
  }

  const indicatorId = url.searchParams.get('indicatorId');
  const resolved = resolvePilotRequest(indicatorId);
  if (!resolved.ok) {
    res.statusCode = 400;
    res.end(
      JSON.stringify({
        contractVersion: '1.0.0',
        status: 'error',
        errorClass: resolved.errorClass,
        message: resolved.message,
        observations: [],
      }),
    );
    return;
  }

  const body = await retrieveObservations({ indicatorId });
  const code = body.status === 'ok' || body.status === 'empty' ? 200 : body.errorClass === 'NOT_ALLOWED' ? 403 : 502;
  res.statusCode = code;
  res.end(JSON.stringify(body));
}
