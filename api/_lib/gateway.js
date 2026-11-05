import { createHash } from 'node:crypto';
import {
  CONTRACT_VERSION,
  DEFAULT_TIMEOUT_MS,
  MAX_RESPONSE_BYTES,
  CACHE_TTL_MS,
  getPilot,
  buildWorldBankUrl,
  isAllowedHost,
  PILOT_INDICATORS,
} from './config.js';

/** @type {Map<string, { expires: number, body: object }>} */
const cache = new Map();

function contentHash(text) {
  return createHash('sha256').update(text).digest('hex');
}

function receiptId(indicatorId, retrievedAt) {
  return contentHash(`${indicatorId}|${retrievedAt}`).slice(0, 24);
}

function observationId(indicatorId, geoCode, referencePeriod) {
  return contentHash(`${indicatorId}|${geoCode}|${referencePeriod}`).slice(0, 32);
}

/**
 * Validate and resolve pilot indicator. Never accepts arbitrary URLs.
 */
export function resolvePilotRequest(indicatorId) {
  if (!indicatorId || typeof indicatorId !== 'string') {
    return { ok: false, errorClass: 'INVALID_INDICATOR', message: 'indicatorId is required' };
  }
  const pilot = getPilot(indicatorId);
  if (!pilot) {
    return { ok: false, errorClass: 'NOT_ALLOWED', message: 'indicatorId is not on the pilot allowlist' };
  }
  return { ok: true, pilot };
}

/**
 * Fetch World Bank series with timeout, size limit, host check.
 * @param {object} opts
 * @param {string} opts.indicatorId
 * @param {typeof fetch} [opts.fetchImpl]
 * @param {number} [opts.timeoutMs]
 * @param {boolean} [opts.bypassCache]
 */
export async function retrieveObservations(opts) {
  const resolved = resolvePilotRequest(opts.indicatorId);
  if (!resolved.ok) {
    return {
      contractVersion: CONTRACT_VERSION,
      status: 'error',
      errorClass: resolved.errorClass,
      message: resolved.message,
      indicator: null,
      observations: [],
      receipt: null,
    };
  }

  const pilot = resolved.pilot;
  const sourceUrl = buildWorldBankUrl(pilot.worldBankIndicator);
  let hostname;
  try {
    hostname = new URL(sourceUrl).hostname;
  } catch {
    return errorPayload(pilot, sourceUrl, 'malformed', 'BAD_URL', null, 0, null);
  }
  if (!isAllowedHost(hostname)) {
    return errorPayload(pilot, sourceUrl, 'not_allowed', 'HOST_NOT_ALLOWED', null, 0, null);
  }

  const cacheKey = pilot.id;
  if (!opts.bypassCache) {
    const hit = cache.get(cacheKey);
    if (hit && hit.expires > Date.now()) {
      return { ...hit.body, cache: 'HIT' };
    }
  }

  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const fetchImpl = opts.fetchImpl ?? globalThis.fetch;
  const retrievedAt = new Date().toISOString();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let httpStatus = null;
  let rawText = '';
  try {
    const res = await fetchImpl(sourceUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    httpStatus = res.status;
    const reader = res.body?.getReader?.();
    if (reader) {
      const chunks = [];
      let total = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        total += value.byteLength;
        if (total > MAX_RESPONSE_BYTES) {
          // Stop consuming an oversized upstream response instead of leaving
          // the stream open after the gateway has already rejected it.
          try {
            await reader.cancel();
          } catch {
            // Cancellation is best-effort; the public result remains generic.
          }
          clearTimeout(timer);
          return errorPayload(pilot, sourceUrl, 'upstream_error', 'RESPONSE_TOO_LARGE', httpStatus, 0, null);
        }
        chunks.push(value);
      }
      rawText = Buffer.concat(chunks.map((c) => Buffer.from(c))).toString('utf8');
    } else {
      rawText = await res.text();
      if (Buffer.byteLength(rawText, 'utf8') > MAX_RESPONSE_BYTES) {
        clearTimeout(timer);
        return errorPayload(pilot, sourceUrl, 'upstream_error', 'RESPONSE_TOO_LARGE', httpStatus, 0, null);
      }
    }
    clearTimeout(timer);

    if (!res.ok) {
      return errorPayload(
        pilot,
        sourceUrl,
        'upstream_error',
        `HTTP_${httpStatus}`,
        httpStatus,
        0,
        contentHash(rawText),
      );
    }

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      return errorPayload(pilot, sourceUrl, 'malformed', 'JSON_PARSE', httpStatus, 0, contentHash(rawText));
    }

    if (!Array.isArray(parsed) || parsed.length < 2 || !Array.isArray(parsed[1])) {
      return errorPayload(pilot, sourceUrl, 'malformed', 'UNEXPECTED_SHAPE', httpStatus, 0, contentHash(rawText));
    }

    const rows = parsed[1];
    /** @type {object[]} */
    const observations = [];
    for (const row of rows) {
      if (!row || row.value == null || typeof row.value !== 'number' || !row.date) continue;
      const referencePeriod = String(row.date);
      observations.push({
        observationId: observationId(pilot.id, pilot.geoCode, referencePeriod),
        indicatorId: pilot.id,
        datasetId: pilot.datasetId,
        geoCode: pilot.geoCode,
        geoLevel: pilot.geoLevel,
        referencePeriod,
        value: row.value,
        unit: pilot.unit,
        sourceAttribution: pilot.sourcePublisher,
        sourceUrl: pilot.sourceUrl,
        retrievedAt,
        publicationDate: null,
        qualityFlags: ['estimated', 'national-only'],
        methodologyRef: pilot.methodologyNotes,
        contractVersion: CONTRACT_VERSION,
      });
    }
    observations.sort((a, b) => a.referencePeriod.localeCompare(b.referencePeriod));

    const outcome = observations.length === 0 ? 'empty' : 'success';
    const receipt = {
      receiptId: receiptId(pilot.id, retrievedAt),
      indicatorId: pilot.id,
      datasetId: pilot.datasetId,
      sourceUrl,
      retrievedAt,
      httpStatus,
      contentHash: contentHash(rawText),
      observationCount: observations.length,
      outcome,
      errorClass: outcome === 'empty' ? 'EMPTY_SERIES' : null,
      contractVersion: CONTRACT_VERSION,
    };

    const body = {
      contractVersion: CONTRACT_VERSION,
      status: outcome === 'success' ? 'ok' : 'empty',
      cache: 'MISS',
      indicator: publicIndicatorMeta(pilot),
      observations,
      receipt,
      // Persistence interface — not durable yet
      persistence: {
        mode: 'ephemeral',
        note: 'Receipts are returned in-response only. No database project is configured; durable storage is deferred.',
      },
    };

    cache.set(cacheKey, { expires: Date.now() + CACHE_TTL_MS, body });
    return body;
  } catch (err) {
    clearTimeout(timer);
    const aborted = err && (err.name === 'AbortError' || err.code === 'ABORT_ERR');
    return errorPayload(
      pilot,
      sourceUrl,
      aborted ? 'timeout' : 'upstream_error',
      aborted ? 'TIMEOUT' : 'FETCH_FAILED',
      httpStatus,
      0,
      null,
    );
  }
}

function publicIndicatorMeta(pilot) {
  return {
    id: pilot.id,
    title: pilot.title,
    definition: pilot.definition,
    unit: pilot.unit,
    measurementType: pilot.measurementType,
    geoLevel: pilot.geoLevel,
    geoCode: pilot.geoCode,
    datasetId: pilot.datasetId,
    sourcePublisher: pilot.sourcePublisher,
    sourceUrl: pilot.sourceUrl,
    methodologyNotes: pilot.methodologyNotes,
    limitations: pilot.limitations,
  };
}

function errorPayload(pilot, sourceUrl, outcome, errorClass, httpStatus, observationCount, hash) {
  const retrievedAt = new Date().toISOString();
  return {
    contractVersion: CONTRACT_VERSION,
    status: 'error',
    errorClass,
    cache: 'MISS',
    indicator: pilot ? publicIndicatorMeta(pilot) : null,
    observations: [],
    receipt: {
      receiptId: receiptId(pilot?.id || 'unknown', retrievedAt),
      indicatorId: pilot?.id || 'unknown',
      datasetId: pilot?.datasetId || 'unknown',
      sourceUrl,
      retrievedAt,
      httpStatus,
      contentHash: hash,
      observationCount,
      outcome,
      errorClass,
      contractVersion: CONTRACT_VERSION,
    },
    persistence: {
      mode: 'ephemeral',
      note: 'Receipts are returned in-response only. No database project is configured; durable storage is deferred.',
    },
  };
}

export function listPilotCatalog() {
  return Object.values(PILOT_INDICATORS).map(publicIndicatorMeta);
}

/** Test helper: clear in-memory cache */
export function clearGatewayCache() {
  cache.clear();
}
