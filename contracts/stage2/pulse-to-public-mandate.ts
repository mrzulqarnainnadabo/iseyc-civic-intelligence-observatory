/**
 * Convert existing Pulse voice objects into PublicMandateRecord v1.
 * Constructs output from an explicit public-field allowlist only.
 * Does not spread input objects. Does not call network. Does not modify /api/pulse.
 */
import {
  PRIVATE_FIELD_DENYLIST,
  PUBLIC_MANDATE_RECORD_SCHEMA_VERSION,
  type PublicMandateRecordV1,
  type PulseVoiceV0,
} from './public-mandate-record.v1';

export class PublicMandateContractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PublicMandateContractError';
  }
}

/** Pulse fields that may be read from an inbound public voice */
export const PUBLIC_PULSE_FIELD_ALLOWLIST = [
  'id',
  'sentence',
  'mandate',
  'duty',
  'office',
  'state',
  'lga',
  'created',
] as const;

export type PublicPulseField = (typeof PUBLIC_PULSE_FIELD_ALLOWLIST)[number];

const PRIVATE_LOWER = new Set(
  PRIVATE_FIELD_DENYLIST.map((k) => k.toLowerCase().replace(/\s+/g, '')),
);

function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/\s+/g, '');
}

function isPrivateKey(key: string): boolean {
  const norm = normalizeKey(key);
  if (PRIVATE_LOWER.has(norm)) return true;
  return (PRIVATE_FIELD_DENYLIST as readonly string[]).includes(key);
}

export function assertNoPrivateFields(obj: Record<string, unknown>): void {
  for (const key of Object.keys(obj)) {
    if (isPrivateKey(key)) {
      throw new PublicMandateContractError(`Private field not allowed on public contract: ${key}`);
    }
  }
}

/** Pick only allowlisted Pulse fields; never spreads the source object. */
export function pickPublicPulseFields(
  source: Record<string, unknown>,
): Partial<Record<PublicPulseField, unknown>> {
  const out: Partial<Record<PublicPulseField, unknown>> = {};
  for (const key of PUBLIC_PULSE_FIELD_ALLOWLIST) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      out[key] = source[key];
    }
  }
  return out;
}

export type StateAliasResolver = (raw: string | null | undefined) => {
  stateId: string | null;
  resolution: 'resolved' | 'ambiguous' | 'unknown' | 'not_applicable';
};

export const DEFAULT_STATE_RESOLVER: StateAliasResolver = (raw) => {
  if (raw == null || String(raw).trim() === '') {
    return { stateId: null, resolution: 'not_applicable' };
  }
  const t = String(raw).trim();
  const lower = t.toLowerCase();
  if (lower === 'abuja') {
    return { stateId: null, resolution: 'ambiguous' };
  }
  const exact: Record<string, string> = {
    fct: 'ng-fct',
    'federal capital territory': 'ng-fct',
    nassarawa: 'ng-nasarawa',
    nasarawa: 'ng-nasarawa',
  };
  if (exact[lower]) return { stateId: exact[lower], resolution: 'resolved' };
  return { stateId: null, resolution: 'unknown' };
};

export function pulseVoiceToPublicMandate(
  voice: PulseVoiceV0 & Record<string, unknown>,
  opts?: {
    publicationStatus?: string;
    resolveState?: StateAliasResolver;
    sourceUrl?: string | null;
  },
): PublicMandateRecordV1 {
  if (voice == null || typeof voice !== 'object') {
    throw new PublicMandateContractError('Pulse voice must be an object');
  }

  const source = voice as Record<string, unknown>;
  assertNoPrivateFields(source);

  const status = opts?.publicationStatus ?? 'Published';
  if (status !== 'Published') {
    throw new PublicMandateContractError(
      `Only Published records may enter PublicMandateRecord v1 (got ${status})`,
    );
  }

  const picked = pickPublicPulseFields(source);

  const id = picked.id;
  const sentence = picked.sentence;
  const created = picked.created;
  if (typeof id !== 'string' || id.length === 0) {
    throw new PublicMandateContractError('Pulse voice missing public id');
  }
  if (typeof sentence !== 'string' || sentence.length === 0) {
    throw new PublicMandateContractError('Pulse voice missing public sentence');
  }
  if (typeof created !== 'string' || created.length === 0) {
    throw new PublicMandateContractError('Pulse voice missing public created timestamp');
  }

  const stateRaw =
    typeof picked.state === 'string' || picked.state == null ? (picked.state as string | null | undefined) : null;
  const lgaRaw =
    typeof picked.lga === 'string' || picked.lga == null ? (picked.lga as string | null | undefined) : null;
  const mandateRaw = typeof picked.mandate === 'string' ? picked.mandate : null;
  const dutyRaw = typeof picked.duty === 'string' ? picked.duty : null;
  const officeRaw = typeof picked.office === 'string' ? picked.office : null;

  const resolve = opts?.resolveState ?? DEFAULT_STATE_RESOLVER;
  const geoRes = resolve(stateRaw ?? null);

  const record: PublicMandateRecordV1 = {
    schemaVersion: PUBLIC_MANDATE_RECORD_SCHEMA_VERSION,
    id,
    sentence,
    mandate: mandateRaw ?? null,
    dutyId: dutyRaw ?? null,
    duty: dutyRaw ?? null,
    officeId: officeRaw ?? null,
    office: officeRaw ?? null,
    geo: {
      stateId: geoRes.stateId,
      state: stateRaw ?? null,
      lgaId: null,
      lga: lgaRaw ?? null,
      originalSubmittedText: stateRaw ?? null,
      resolution: geoRes.resolution,
    },
    state: stateRaw ?? null,
    lga: lgaRaw ?? null,
    publicationStatus: 'Published',
    createdAt: created,
    updatedAt: null,
    sourceUrl: opts?.sourceUrl ?? null,
  };

  return record;
}

export const PUBLIC_MANDATE_OUTPUT_KEYS = [
  'schemaVersion',
  'id',
  'sentence',
  'mandate',
  'dutyId',
  'duty',
  'officeId',
  'office',
  'geo',
  'state',
  'lga',
  'publicationStatus',
  'createdAt',
  'updatedAt',
  'sourceUrl',
] as const;
