import type { CivicRecord, EvidenceItem, EvidenceQuery, Institution, ObservatoryAdapter, RecordQuery, SourceRecord, StateRef } from '../data/types';
import mapData from '../data/geo/nigeria-map.json';
import registry from '../data/source-registry.json';
import { validateDataset } from '../lib/validate';

/** Disabled-by-default adapter. The versioned envelope is proposed and must be approved by data owners. */
export interface HttpEndpoints { records: string; evidence: string; institutions: string; sources?: string; states?: string }
export interface HttpAdapterConfig { endpoints: HttpEndpoints; headers?: Record<string, string>; fetchImpl?: typeof fetch; timeoutMs?: number; maxBytes?: number }
export class NotConfiguredError extends Error { constructor(what: string) { super(`Live adapter is not configured: ${what}. Supply an approved contract; no endpoints are assumed.`); this.name='NotConfiguredError'; } }
export class ContractError extends Error { constructor(message: string) { super(message); this.name='ContractError'; } }
/** Expected live envelope: schemaVersion 1.0, datasetMode live, data array (runtime-validated). */
function parseEnvelope<T>(x: unknown, name: string): T {
  if (!x || typeof x!=='object' || Array.isArray(x)) throw new ContractError(`${name}: response envelope must be an object`);
  const e=x as Record<string,unknown>; if(e.schemaVersion!=='1.0'||e.datasetMode!=='live'||!Array.isArray(e.data)) throw new ContractError(`${name}: expected schemaVersion 1.0, datasetMode live and data array`);
  return e.data as T;
}
export function createHttpAdapter(cfg?: Partial<HttpAdapterConfig>): ObservatoryAdapter {
  const ep=cfg?.endpoints; const f=cfg?.fetchImpl??(typeof fetch!=='undefined'?fetch.bind(globalThis):undefined); const timeout=cfg?.timeoutMs??8000; const max=cfg?.maxBytes??2_000_000;
  const need=(k:keyof HttpEndpoints)=>{const u=ep?.[k]; if(!u)throw new NotConfiguredError(`endpoint "${k}"`); let parsed:URL; try{parsed=new URL(u,typeof location!=='undefined'?location.href:undefined);}catch{throw new ContractError(`Invalid ${k} endpoint URL`);} if(parsed.protocol!=='https:' && !(parsed.protocol==='http:'&&['localhost','127.0.0.1'].includes(parsed.hostname)))throw new ContractError(`${k} endpoint must use HTTPS`); return parsed.toString();};
  async function getJson(url:string):Promise<unknown>{
    if(!f)throw new NotConfiguredError('fetch is unavailable'); const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),timeout);
    try { const res=await f(url,{headers:{Accept:'application/json',...(cfg?.headers??{})},signal:controller.signal}); if(!res.ok)throw new ContractError(`Upstream request failed (${res.status})`); const len=Number(res.headers?.get?.('content-length')??0); if(len>max)throw new ContractError('Upstream response exceeds size limit'); if(!res.body)throw new ContractError('Upstream response has no readable body'); const reader=res.body.getReader(); const chunks:Uint8Array[]=[]; let total=0; while(true){const {done,value}=await reader.read();if(done)break;total+=value.byteLength;if(total>max){await reader.cancel();throw new ContractError('Upstream response exceeds size limit');}chunks.push(value);} const bytes=new Uint8Array(total);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.byteLength;} try{return JSON.parse(new TextDecoder().decode(bytes));}catch{throw new ContractError('Upstream returned malformed JSON');} }
    catch(err){if(err instanceof ContractError||err instanceof NotConfiguredError)throw err;if(controller.signal.aborted)throw new ContractError('Upstream request timed out');throw new ContractError('Upstream request failed; details withheld');} finally{clearTimeout(timer);}
  }

  let dataset:Promise<{records:CivicRecord[];evidence:EvidenceItem[];institutions:Institution[];sources:SourceRecord[];states:StateRef[]}>|undefined;
  const load=()=>dataset??=(async()=>{
    const [rr,ee,ii,ss,tt]=await Promise.all([getJson(need('records')),getJson(need('evidence')),getJson(need('institutions')),ep?.sources?getJson(need('sources')):Promise.resolve(registry),ep?.states?getJson(need('states')):Promise.resolve(mapData.locations.map(l=>({id:l.id,name:l.name})))]);
    const records=parseEnvelope<CivicRecord[]>(rr,'records'), evidence=parseEnvelope<EvidenceItem[]>(ee,'evidence'), institutions=parseEnvelope<Institution[]>(ii,'institutions');
    const sources=ep?.sources?parseEnvelope<SourceRecord[]>(ss,'sources'):ss as SourceRecord[]; const states=ep?.states?parseEnvelope<StateRef[]>(tt,'states'):tt as StateRef[];
    const modes=[...records.map(x=>x.synthetic),...evidence.map(x=>x.synthetic)]; if(modes.some(Boolean))throw new ContractError('Live dataset contains synthetic records or evidence');
    const validation=validateDataset(records,evidence,institutions,sources,states); if(!validation.ok)throw new ContractError(`Dataset contract rejected (${validation.errors.slice(0,5).join('; ')})`);
    return {records,evidence,institutions,sources,states};
  })();
  return {mode:'live',label:'Live data (contract validated)',async getSources(){return (await load()).sources;},async getStates(){return (await load()).states;},async getRecords(q?:RecordQuery){const {records}=await load();return records.filter(r=>(!q?.sector||r.sector===q.sector)&&(!q?.stateId||r.stateId===q.stateId)&&(!q?.institutionId||r.institutionIds.includes(q.institutionId))&&(!q?.text||`${r.title} ${r.summary}`.toLowerCase().includes(q.text.toLowerCase())));},async getEvidence(q?:EvidenceQuery){const {evidence}=await load();return evidence.filter(e=>(!q?.kind||e.kind===q.kind)&&(!q?.status||e.status===q.status)&&(!q?.sector||e.sector===q.sector)&&(!q?.stateId||e.stateId===q.stateId)&&(!q?.recordId||e.recordId===q.recordId)&&(!q?.text||`${e.title} ${e.excerpt}`.toLowerCase().includes(q.text.toLowerCase())));},async getInstitutions(){return (await load()).institutions;}};
}
