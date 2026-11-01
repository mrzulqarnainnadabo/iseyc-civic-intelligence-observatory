/**
 * PublicMandateRecord v1 — TypeScript mirror of public-mandate-record.v1.schema.json
 * Authoritative for cross-app public demand DTO. Does not change live /api/pulse shape.
 */

export const PUBLIC_MANDATE_RECORD_SCHEMA_VERSION = 'public-mandate-record.v1' as const;

/** Fields that must never appear on PublicMandateRecord or Pulse public payloads */
export const PRIVATE_FIELD_DENYLIST = [
  'Device Fingerprint',
  'deviceFingerprint',
  'fingerprint',
  'Age Band',
  'ageBand',
  'Gender',
  'gender',
  'email',
  'phone',
  'contact',
  'Responsible Institution',
  'Response Requested',
  'Response Received',
  'Follow-up Date',
  'Resolution Status',
  'Response Evidence',
  'operatorNotes',
  'moderationNotes',
] as const;

export type GeoResolution = 'resolved' | 'ambiguous' | 'unknown' | 'not_applicable';

export interface PublicMandateGeoV1 {
  stateId?: string | null;
  state?: string | null;
  lgaId?: string | null;
  lga?: string | null;
  originalSubmittedText?: string | null;
  resolution?: GeoResolution;
}

export interface PublicMandateRecordV1 {
  schemaVersion: typeof PUBLIC_MANDATE_RECORD_SCHEMA_VERSION;
  id: string;
  sentence: string;
  mandate?: string | null;
  dutyId?: string | null;
  duty?: string | null;
  officeId?: string | null;
  office?: string | null;
  geo?: PublicMandateGeoV1;
  state?: string | null;
  lga?: string | null;
  publicationStatus: 'Published';
  createdAt: string;
  updatedAt?: string | null;
  sourceUrl?: string | null;
}

export const EXAMPLE_VALID_PUBLIC_MANDATE_RECORD: PublicMandateRecordV1 = {
  schemaVersion: 'public-mandate-record.v1',
  id: '4005db88ef468116ae20ec69bc81b114',
  sentence: 'Public access points in schools and civic centres.',
  mandate: 'Digital Infrastructure',
  dutyId: 'Digital Infrastructure',
  duty: 'Digital Infrastructure',
  officeId: 'President',
  office: 'President',
  geo: {
    stateId: 'ng-ondo',
    state: 'Ondo',
    lgaId: null,
    lga: 'Owo',
    resolution: 'resolved',
  },
  state: 'Ondo',
  lga: 'Owo',
  publicationStatus: 'Published',
  createdAt: '2026-10-21T18:15:00.000Z',
  updatedAt: null,
  sourceUrl: 'https://2027-street-mandate.vercel.app/mandate/4005db88ef468116ae20ec69bc81b114',
};

export interface PulseVoiceV0 {
  id: string;
  sentence: string;
  mandate?: string;
  duty?: string;
  office?: string;
  state?: string;
  lga?: string;
  created: string;
}
