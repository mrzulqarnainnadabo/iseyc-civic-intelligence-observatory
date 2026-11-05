import { describe, expect, it, vi } from 'vitest';
import { DEPARTMENT_EMPTY_STATE, validateDepartmentEvidence } from '../src/data/departmentEvidence';
import stateReference from '../contracts/states-ng.v1.json';
import { departmentMatchesRecord, fetchDepartmentCommunityRecords, kadunaRecordScope, stateRecordScope, type PublishedDepartmentRecord } from '../src/adapters/departmentCommunityRecords';
const valid = {
  departmentId:'health',indicatorId:'mortality',sourceId:'worldbank-wdi-under5-mortality',
  publisher:'World Bank',sourceUrl:'https://example.org/source',referencePeriod:'Not available for Kaduna South',
  retrievedAt:'not-retrieved',geography:{level:'lga',code:'kaduna-south',label:'Kaduna South, Kaduna State'},
  value:null,unit:null,evidenceStatus:'not-integrated',limitations:['National-only series.'],
};
describe('DepartmentEvidence contract', () => {
  it('accepts a valid null-valued evidence envelope', () => expect(validateDepartmentEvidence(valid)).toBe(true));
  it('rejects unsupported departments, invalid statuses and extra/private properties', () => {
    expect(validateDepartmentEvidence({...valid,departmentId:'business'})).toBe(false);
    expect(validateDepartmentEvidence({...valid,evidenceStatus:'verified'})).toBe(false);
    expect(validateDepartmentEvidence({...valid,submitterEmail:'private@example.org'})).toBe(false);
    expect(validateDepartmentEvidence({...valid,geography:{...valid.geography,phone:'123'}})).toBe(false);
  });
  it('uses exact missing-figure copy rather than zero', () => {
    expect(DEPARTMENT_EMPTY_STATE).toBe('No official figure integrated for this geography and indicator yet.');
    expect(DEPARTMENT_EMPTY_STATE).not.toMatch(/0|zero/i);
  });
});
describe('published CommunityRecord client', () => {
  it('fetches v0.1 and maps only public allowlisted fields', async () => {
    const fetcher = vi.fn(async () => ({ok:true,json:async () => ({
      contractVersion:'0.1.0',publicationBoundary:'published-only',page:1,pageSize:50,total:1,totalPages:1,truncatedUpstream:false,
      records:[{id:'cr-1',contractVersion:'0.1.0',publicationStatus:'published',verificationStatus:'unverified',
        text:'Community asks for better PHC access',duty:'Health',sector:'health',state:'Kaduna',lga:'Kaduna South',
        createdAt:'2026-10-01',submitterEmail:'private@example.org',phone:'08000000000',deviceFingerprint:'secret',operatorNotes:'internal'}],
    })})) as unknown as typeof fetch;
    const feed = await fetchDepartmentCommunityRecords(fetcher,'https://mandate.example/api/v1/community-records');
    expect(feed.source).toBe('civic-mandate-community-records-v0.1');
    expect(feed.fallbackReason).toBeNull();
    expect(feed.records[0].text).toContain('PHC');
    expect(JSON.stringify(feed.records[0])).not.toMatch(/submitterEmail|phone|deviceFingerprint|operatorNotes|private@example/);
    expect(Object.keys(feed.records[0])).not.toContain('submitterEmail');
  });
  it('reports endpoint failure and does not fall back to pulse', async () => {
    const fetcher = vi.fn(async () => ({ok:false,status:503,json:async () => ({})})) as unknown as typeof fetch;
    const feed = await fetchDepartmentCommunityRecords(fetcher,'https://mandate.example/api/v1/community-records');
    expect(feed.status).toBe('unavailable');
    expect(feed.source).toBe('unavailable');
    expect(feed.fallbackReason).toBe('community_record_http_503');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it('keeps a valid empty primary feed empty', async () => {
    const fetcher = vi.fn(async () => ({ok:true,json:async () => ({
      contractVersion:'0.1.0',publicationBoundary:'published-only',page:1,pageSize:50,total:0,totalPages:1,truncatedUpstream:false,records:[],
    })})) as unknown as typeof fetch;
    const feed = await fetchDepartmentCommunityRecords(fetcher,'https://mandate.example/api/v1/community-records');
    expect(feed.status).toBe('empty');
    expect(feed.records).toEqual([]);
  });
  it('rejects malformed contract and labels the reason', async () => {
    const fetcher = vi.fn(async () => ({ok:true,json:async () => ({
      contractVersion:'9.9.9',publicationBoundary:'published-only',page:1,totalPages:1,records:[],
    })})) as unknown as typeof fetch;
    const feed = await fetchDepartmentCommunityRecords(fetcher,'https://mandate.example/api/v1/community-records');
    expect(feed.status).toBe('invalid');
    expect(feed.fallbackReason).toBe('community_record_invalid_contract');
  });
  it('matches department records by sector or duty', () => {
    const record = {sector:'health',duty:'Health'} as any;
    expect(departmentMatchesRecord('health',record)).toBe(true);
    expect(departmentMatchesRecord('education',record)).toBe(false);
  });
});
describe('Kaduna geographic scope boundaries', () => {
  const record = (state: string | null, lga: string | null): PublishedDepartmentRecord => ({
    id:state + '-' + lga,text:'Published health record',duty:'Health',sector:'health',issueCategory:null,
    officeLabel:null,state,lga,ward:null,facilityRef:null,createdAt:null,publishedAt:null,
    verificationStatus:'unverified',followUpStatus:'unknown',contractVersion:'0.1.0',
    publicationStatus:'published',publicUrl:'https://example.org/record',
  });
  it('places an explicit Kaduna South LGA match in the local list, including normalized official labels', () => {
    const local = record('Kaduna','Kaduna South');
    const normalizedLabel = record('Kaduna State','Kaduna-South');
    expect(kadunaRecordScope(local)).toBe('local');
    expect(kadunaRecordScope(normalizedLabel)).toBe('local');
    expect([local,normalizedLabel].filter((item) => kadunaRecordScope(item) === 'local')).toEqual([local,normalizedLabel]);
  });
  it('places statewide and other-Kaduna-LGA records only in state context', () => {
    const statewide = record('Kaduna',null);
    const otherLga = record('Kaduna','Chikun');
    const items = [statewide,otherLga];
    expect(items.filter((item) => kadunaRecordScope(item) === 'local')).toEqual([]);
    expect(items.filter((item) => kadunaRecordScope(item) === 'state-context')).toEqual(items);
  });
  it('excludes non-Kaduna records from both local and state-context lists', () => {
    const nonKaduna = record('Kano','Kaduna South');
    expect(kadunaRecordScope(nonKaduna)).toBe('excluded');
    expect([nonKaduna].filter((item) => kadunaRecordScope(item) === 'local')).toEqual([]);
    expect([nonKaduna].filter((item) => kadunaRecordScope(item) === 'state-context')).toEqual([]);
  });
});


describe('national state selector scope', () => {
  const record = (state: string | null, lga: string | null): PublishedDepartmentRecord => ({
    id:String(state) + '-' + String(lga),text:'Published record',duty:'Health',sector:'health',issueCategory:null,
    officeLabel:null,state,lga,ward:null,facilityRef:null,createdAt:null,publishedAt:null,
    verificationStatus:'unverified',followUpStatus:'unknown',contractVersion:'0.1.0',
    publicationStatus:'published',publicUrl:'https://example.org/record',
  });
  it('keeps Kaduna South local only when Kaduna is selected', () => {
    expect(stateRecordScope(record('Kaduna State','Kaduna South'),'Kaduna')).toBe('local');
    expect(stateRecordScope(record('Kaduna','Chikun'),'Kaduna')).toBe('state-context');
  });
  it('filters other states without inventing LGA coverage', () => {
    expect(stateRecordScope(record('Kano','Kano Municipal'),'Kano')).toBe('state-context');
    expect(stateRecordScope(record('Kano','Kano Municipal'),'Kaduna')).toBe('excluded');
  });
  it('supports the national all-states view without treating it as prevalence', () => {
    expect(stateRecordScope(record('Rivers','Port Harcourt'),'All states + FCT')).toBe('national-context');
    expect(stateRecordScope(record('FCT',null),'All states + FCT')).toBe('national-context');
  });
});


describe('national geography reference', () => {
  it('contains all 36 states and the FCT exactly once', () => {
    expect(stateReference.states).toHaveLength(37);
    expect(new Set(stateReference.states).size).toBe(37);
    expect(stateReference.states).toContain('FCT');
    expect(stateReference.states).toContain('Kaduna');
  });
});
