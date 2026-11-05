import type { DepartmentId } from '../data/departmentEvidence';
export interface PublishedDepartmentRecord {
  id: string; text: string; duty: string | null; sector: string | null; issueCategory: string | null;
  officeLabel: string | null; state: string | null; lga: string | null; ward: string | null;
  facilityRef: string | null; createdAt: string | null; publishedAt: string | null;
  verificationStatus: string; followUpStatus: string; contractVersion: '0.1.0';
  publicationStatus: 'published'; publicUrl: string;
}
export interface DepartmentCommunityFeed {
  status: 'ready' | 'empty' | 'unavailable' | 'invalid';
  source: 'civic-mandate-community-records-v0.1' | 'unavailable';
  fallbackReason: string | null; contractVersion: '0.1.0' | null;
  records: PublishedDepartmentRecord[]; total: number | null; limitations: string[]; message: string | null;
}
type Raw = Record<string, unknown>;
type Page = { contractVersion:string; publicationBoundary:string; page:number; total:number; totalPages:number; truncatedUpstream?:boolean; records:Raw[] };
export const COMMUNITY_RECORDS_URL = 'https://2027-street-mandate.vercel.app/api/v1/community-records';
function mapPublicRecord(raw: Raw): PublishedDepartmentRecord {
  if (raw.contractVersion !== '0.1.0' || raw.publicationStatus !== 'published' ||
      typeof raw.id !== 'string' || typeof raw.text !== 'string' || !raw.text.trim() ||
      typeof raw.verificationStatus !== 'string') throw new Error('community_record_invalid_contract');
  // Explicit allowlist: private submitter/operator fields are never copied into this public model.
  return {
    id: raw.id, text: raw.text,
    duty: typeof raw.duty === 'string' ? raw.duty : null,
    sector: typeof raw.sector === 'string' ? raw.sector : null,
    issueCategory: typeof raw.issueCategory === 'string' ? raw.issueCategory : null,
    officeLabel: typeof raw.officeLabel === 'string' ? raw.officeLabel : null,
    state: typeof raw.state === 'string' ? raw.state : null,
    lga: typeof raw.lga === 'string' ? raw.lga : null,
    ward: typeof raw.ward === 'string' ? raw.ward : null,
    facilityRef: typeof raw.facilityRef === 'string' ? raw.facilityRef : null,
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : null,
    publishedAt: typeof raw.publishedAt === 'string' ? raw.publishedAt : null,
    verificationStatus: raw.verificationStatus,
    followUpStatus: typeof raw.followUpStatus === 'string' ? raw.followUpStatus : 'unknown',
    contractVersion: '0.1.0', publicationStatus: 'published',
    publicUrl: 'https://2027-street-mandate.vercel.app/mandate/' + encodeURIComponent(raw.id),
  };
}
function failureReason(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  const status = message.split('HTTP ')[1]?.slice(0, 3);
  if (status && status.length === 3 && [...status].every((character) => character >= '0' && character <= '9')) return 'community_record_http_' + status;
  if (message === 'community_record_invalid_contract') return message;
  if (message.toLowerCase().includes('json') || message.toLowerCase().includes('parse')) return 'community_record_invalid_json';
  return 'community_record_network_error';
}
export async function fetchDepartmentCommunityRecords(fetchImpl: typeof fetch = fetch, endpoint = COMMUNITY_RECORDS_URL): Promise<DepartmentCommunityFeed> {
  try {
    const firstResponse = await fetchImpl(endpoint + '?page=1&pageSize=50', { headers:{Accept:'application/json'} });
    if (!firstResponse.ok) throw new Error('CommunityRecord HTTP ' + firstResponse.status);
    const first = await firstResponse.json() as Page;
    if (first?.contractVersion !== '0.1.0' || first.publicationBoundary !== 'published-only' ||
        first.page !== 1 || !Array.isArray(first.records) || !Number.isInteger(first.totalPages) ||
        first.totalPages < 1 || first.truncatedUpstream || first.totalPages > 100) throw new Error('community_record_invalid_contract');
    const all = [...first.records];
    for (let page = 2; page <= first.totalPages; page++) {
      const response = await fetchImpl(endpoint + '?page=' + page + '&pageSize=50', { headers:{Accept:'application/json'} });
      if (!response.ok) throw new Error('CommunityRecord HTTP ' + response.status);
      const body = await response.json() as Page;
      if (body?.contractVersion !== '0.1.0' || body.publicationBoundary !== 'published-only' ||
          body.page !== page || !Array.isArray(body.records) || body.truncatedUpstream) throw new Error('community_record_invalid_contract');
      all.push(...body.records);
    }
    const records = all.map(mapPublicRecord);
    return {
      status: records.length ? 'ready' : 'empty', source:'civic-mandate-community-records-v0.1',
      fallbackReason:null, contractVersion:'0.1.0', records,
      total:typeof first.total === 'number' ? first.total : records.length,
      limitations:[
        'Published community records are human-reviewed for publication; publication is not independent verification.',
        'Published records are not a representative survey and do not measure national or local prevalence.',
        'The named office is reproduced as recorded and is not a legal determination of institutional responsibility.',
      ],
      message:records.length ? null : 'No published community records are available in the current feed.',
    };
  } catch(error) {
    const reason = failureReason(error);
    return {
      status:reason === 'community_record_invalid_contract' ? 'invalid' : 'unavailable',
      source:'unavailable', fallbackReason:reason, contractVersion:null, records:[], total:null,
      limitations:['The published CommunityRecord feed could not be validated; no legacy pulse or synthetic substitute is shown.'],
      message:'Published community records are temporarily unavailable. No substitute data is shown.',
    };
  }
}
export function departmentMatchesRecord(department: DepartmentId, record: PublishedDepartmentRecord): boolean {
  const sector = (record.sector || '').toLowerCase();
  const duty = (record.duty || '').toLowerCase();
  if (department === 'education') return sector === 'education' || /education|school|teacher|youth development/.test(duty);
  if (department === 'health') return sector === 'health' || /health|primary healthcare|well-being/.test(duty);
  if (department === 'software-technology') return /software|technology|digital infrastructure/.test(sector + ' ' + duty);
  return sector === 'governance' || /governance|justice|public finance|electoral|civic/.test(duty);
}

/** Classifies only explicit Kaduna geography. Statewide and other-LGA records are context, never LGA-local evidence. */
export function kadunaRecordScope(record: PublishedDepartmentRecord): 'local' | 'state-context' | 'excluded' {
  const rawState = (record.state || '').trim().toLowerCase();
  const state = rawState.endsWith(' state') ? rawState.slice(0, -6) : rawState;
  if (state !== 'kaduna') return 'excluded';
  const lga = (record.lga || '').trim().toLowerCase().replaceAll('-', ' ').replaceAll('_', ' ').split(' ').filter(Boolean).join(' ');
  if (lga === 'kaduna south') return 'local';
  return 'state-context';
}


/** Match the national state selector without inferring LGA-level coverage. */
export function stateRecordScope(record: PublishedDepartmentRecord, selectedState: string): 'local' | 'state-context' | 'national-context' | 'excluded' {
  const normalize = (value: string | null) => {
    const normalized = (value || '').trim().toLowerCase().replace(/\\s+state$/i, '').replace(/\\s+/g, ' ');
    if (normalized === 'federal capital territory' || normalized === 'abuja') return 'fct';
    return normalized;
  };
  if (selectedState === 'All states + FCT') return 'national-context';
  if (normalize(record.state) !== normalize(selectedState)) return 'excluded';
  if (normalize(selectedState) === 'kaduna' && normalize(record.lga) === 'kaduna south') return 'local';
  return 'state-context';
}
