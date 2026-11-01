/**
 * Convert existing Pulse voice objects into PublicMandateRecord v1.
 * Does not call network. Does not modify /api/pulse.
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

const PRIVATE_LOWER = new Set(PRIVATE_FIELD_DENYLIST.map((k) => k.toLowerCase().replace(/\s+/g, '')));

export function assertNoPrivateFields(obj: Record<string, unknown>): void {
  for (const key of Object.keys(obj)) {
    const norm = key.toLowerCase().replace(/\s+/g, '');
    if (PRIVATE_LOWER.has(norm) || PRIVATE_FIELD_DENYLIST.includes(key as (typeof PRIVATE_FIELD_DENYLIST)[number])) {
      throw new PublicMandateContractError(`Private field not allowed on public contract: ${key}`);
    }
  }
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
  assertNoPrivateFields(voice as Record<string, unknown>);
  const status = opts?.publicationStatus ?? 'Published';
  if (status !== 'Published') {
    throw new PublicMandateContractError(`Only Published records may enter PublicMandateRecord v1 (got ${status})`);
  }
  if (!voice.id || !voice.sentence || !voice.created) {
    throw new PublicMandateContractError('Pulse voice missing id, sentence, or created');
  }
  const resolve = opts?.resolveState ?? DEFAULT_STATE_RESOLVER;
  const geoRes = resolve(voice.state ?? null);
  return {
    schemaVersion: PUBLIC_MANDATE_RECORD_SCHEMA_VERSION,
    id: voice.id,
    sentence: voice.sentence,
    mandate: voice.mandate ?? null,
    dutyId: voice.duty ?? null,
    duty: voice.duty ?? null,
    officeId: voice.office ?? null,
    office: voice.office ?? null,
    geo: {
      stateId: geoRes.stateId,
      state: voice.state ?? null,
      lgaId: null,
      lga: voice.lga ?? null,
      originalSubmittedText: voice.state ?? null,
      resolution: geoRes.resolution,
    },
    state: voice.state ?? null,
    lga: voice.lga ?? null,
    publicationStatus: 'Published',
    createdAt: voice.created,
    updatedAt: null,
    sourceUrl: opts?.sourceUrl ?? null,
  };
}
