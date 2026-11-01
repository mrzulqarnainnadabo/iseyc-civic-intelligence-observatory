import { KINDS, SECTORS, STAGES } from '../data/types';

export interface ValidationResult { ok: boolean; errors: string[] }
const RECORD_KEYS = new Set(['id','origin','synthetic','title','summary','sector','stateId','lga','kind','reviewStatus','publishedMonth','institutionIds','stages','unknowns','nextSteps']);
const EVIDENCE_KEYS = new Set(['id','synthetic','recordId','kind','status','title','excerpt','publisherLabel','date','sector','stateId','limitations','verification']);
const INSTITUTION_KEYS = new Set(['id','name','tier','sectors','responsibilityBasis','basisNote']);
const SOURCE_KEYS = new Set(['id','publisher','name','url','urlStatus','sectors','kind','geographicCoverage','geoLevel','dataType','updateFrequency','licence','lastChecked','checkedHow','limitations','notes']);
const STATE_KEYS = new Set(['id','name']);
const PRIVATE = /(?:submitter|phone|mobile|email|e-mail|ip.?address|device.?fingerprint|private.?note|moderation|operator|credential|password|secret|token|auth|age.?band|gender|response.?requested|response.?received|follow.?up.?date|resolution.?status|response.?evidence|responsible.?institution)/i;
const object = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);
const str = (x: unknown) => typeof x === 'string' && x.trim().length > 0;
const isoDate = (x: unknown) => {
  if (typeof x !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(x)) return false;
  const [year, month, day] = x.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
};
function keys(x: unknown, allowed: Set<string>, path: string, errors: string[]) {
  if (!object(x)) { errors.push(`${path} must be an object`); return; }
  for (const k of Object.keys(x)) if (!allowed.has(k)) errors.push(`${path}.${k} is not an allowed public field`);
}
export function findPrivateKeys(value: unknown, path = '$'): string[] {
  const hits: string[] = [];
  if (Array.isArray(value)) value.forEach((v,i)=>hits.push(...findPrivateKeys(v,`${path}[${i}]`)));
  else if (object(value)) for (const [k,v] of Object.entries(value)) { if (PRIVATE.test(k.replace(/[^a-zA-Z]/gi,''))) hits.push(`${path}.${k}`); hits.push(...findPrivateKeys(v,`${path}.${k}`)); }
  return hits;
}
export function validateCivicRecord(x: unknown): ValidationResult {
  const errors: string[]=[]; if (!object(x)) return {ok:false,errors:['record must be an object']};
  keys(x,RECORD_KEYS,'record',errors);
  for (const k of ['id','title','summary','stateId','publishedMonth','origin'] as const) if (!str(x[k])) errors.push(`${k} is required`);
  if (!['civic-mandate','civic-brain','observatory-demo'].includes(String(x.origin))) errors.push('origin is invalid');
  if (!SECTORS.includes(x.sector as never)) errors.push('sector is not a known sector');
  if (x.kind!=='community-submission') errors.push("kind must be 'community-submission'");
  if (x.reviewStatus!=='published') errors.push("only published records may enter the Observatory");
  if (typeof x.synthetic!=='boolean') errors.push('synthetic must be an explicit boolean');
  if (x.origin==='observatory-demo' && x.synthetic!==true) errors.push('observatory-demo records must be synthetic');
  if (typeof x.publishedMonth==='string' && !/^\d{4}-(0[1-9]|1[0-2])$/.test(x.publishedMonth)) errors.push('publishedMonth must be YYYY-MM'); if(x.lga!==undefined&&!str(x.lga))errors.push('lga must be a non-empty string when supplied');
  if (!Array.isArray(x.institutionIds) || !x.institutionIds.every(str)) errors.push('institutionIds must be an array of identifiers');
  for (const k of ['unknowns','nextSteps']) if (!Array.isArray(x[k]) || !(x[k] as unknown[]).every(str)) errors.push(`${k} must be an array of strings`);
  if (!Array.isArray(x.stages) || x.stages.length!==STAGES.length) errors.push(`stages must list all ${STAGES.length} stages in order`);
  else (x.stages as unknown[]).forEach((s,i)=>{ if (!object(s) || s.stage!==STAGES[i] || !['evidenced','claimed','unknown','not-reached'].includes(String(s.status))) errors.push(`stage ${i} is invalid`); else { keys(s,new Set(['stage','status','evidenceId','note']),`record.stages[${i}]`,errors); if (s.evidenceId!==undefined && !str(s.evidenceId)) errors.push(`stage ${i} evidenceId is invalid`); if (s.status==='evidenced' && !str(s.evidenceId)) errors.push(`stage ${i} evidenced status requires evidenceId`); if (s.note!==undefined && !str(s.note)) errors.push(`stage ${i} note must be non-empty`); } });
  errors.push(...findPrivateKeys(x).map(p=>`private field not allowed: ${p}`)); return {ok:errors.length===0,errors};
}
export function validateEvidenceItem(x: unknown): ValidationResult {
  const errors: string[]=[]; if (!object(x)) return {ok:false,errors:['evidence must be an object']}; keys(x,EVIDENCE_KEYS,'evidence',errors);
  for (const k of ['id','recordId','title','publisherLabel','excerpt'] as const) if (!str(x[k])) errors.push(`${k} is required`);
  if (typeof x.synthetic!=='boolean') errors.push('synthetic must be an explicit boolean');
  if (!KINDS.includes(x.kind as never)) errors.push('kind is not a known evidence kind');
  if (!['verified','unverified','outdated','unavailable','disputed'].includes(String(x.status))) errors.push('status is invalid');
  if (!isoDate(x.date)) errors.push('date must be a valid ISO calendar date');
  if (!SECTORS.includes(x.sector as never)) errors.push('sector is invalid'); if (!str(x.stateId)) errors.push('stateId is required');
  if (!Array.isArray(x.limitations)||x.limitations.length===0||!x.limitations.every(str)) errors.push('every evidence item must list non-empty limitations');
  if (x.kind==='community-submission' && x.status==='verified') errors.push('a community submission cannot be marked verified');
  if (x.synthetic===true && object(x.verification)) errors.push('synthetic evidence cannot carry a real verification attestation');
  if (x.verification!==undefined) { const v=x.verification; if (!object(v)||Object.keys(v).some(k=>!['reviewerId','reviewedAt','method'].includes(k))||!str(v.reviewerId)||!isoDate(v.reviewedAt)||!str(v.method)) errors.push('verification attestation is invalid'); }
  errors.push(...findPrivateKeys(x).map(p=>`private field not allowed: ${p}`)); return {ok:errors.length===0,errors};
}
export function validateInstitution(x: unknown): ValidationResult { const e:string[]=[]; if(!object(x))return{ok:false,errors:['institution must be an object']}; keys(x,INSTITUTION_KEYS,'institution',e); if(!str(x.id)||!str(x.name)||!str(x.basisNote))e.push('institution identity and basisNote are required'); if(!['federal','state','local','other'].includes(String(x.tier)))e.push('institution tier invalid'); if(!Array.isArray(x.sectors)||!x.sectors.length||!x.sectors.every(s=>SECTORS.includes(s as never)))e.push('institution sectors invalid'); if(!['unverified','verified'].includes(String(x.responsibilityBasis)))e.push('responsibilityBasis invalid'); e.push(...findPrivateKeys(x)); return{ok:!e.length,errors:e}; }
export function validateSource(x: unknown): ValidationResult {
  const e: string[] = [];
  if (!object(x)) return { ok: false, errors: ['source must be an object'] };
  keys(x, SOURCE_KEYS, 'source', e);
  for (const k of ['id','publisher','name','geographicCoverage','dataType','updateFrequency','licence','checkedHow','notes'] as const) {
    if (!str(x[k]) && !(k === 'notes' && x[k] === '')) e.push(`${k} required`);
  }
  const status = x.urlStatus;
  if (!['confirmed','domain-confirmed','documented-not-reconfirmed','not-applicable'].includes(String(status))) e.push('urlStatus invalid');
  if (x.url === null) {
    if (status !== 'not-applicable') e.push('a null source URL requires urlStatus not-applicable');
  } else if (typeof x.url !== 'string') {
    e.push('source URL must be a valid HTTPS URL, documented HTTP URL, or null');
  } else {
    try {
      const parsed = new URL(x.url);
      const isHttpException = status === 'documented-not-reconfirmed' && parsed.protocol === 'http:';
      if (parsed.username || parsed.password || (!['https:'].includes(parsed.protocol) && !isHttpException) || !parsed.hostname || parsed.hostname.includes(' ')) e.push('source URL must be a valid HTTPS URL, or documented-not-reconfirmed HTTP URL, without embedded credentials');
      if (status === 'not-applicable') e.push('not-applicable sources must have a null URL');
    } catch { e.push('source URL must be an absolute valid URL'); }
  }
  if (!Array.isArray(x.sectors) || x.sectors.length === 0 || !x.sectors.every(s => SECTORS.includes(s as never))) e.push('source sectors invalid');
  if (!KINDS.includes(x.kind as never)) e.push('source kind invalid');
  if (!['national','zone','state','lga','facility','point','varies'].includes(String(x.geoLevel))) e.push('geoLevel invalid');
  const confirmed = status === 'confirmed' || status === 'domain-confirmed';
  if (confirmed && !isoDate(x.lastChecked)) e.push('confirmed source URLs require a valid lastChecked date');
  if (!confirmed && x.lastChecked !== null) e.push('unconfirmed or not-applicable sources must have lastChecked null');
  if (!Array.isArray(x.limitations) || x.limitations.length === 0 || !x.limitations.every(str)) e.push('limitations invalid');
  e.push(...findPrivateKeys(x));
  return { ok: !e.length, errors: e };
}
export function validateState(x: unknown): ValidationResult { const e:string[]=[]; if(!object(x))return{ok:false,errors:['state must be an object']}; keys(x,STATE_KEYS,'state',e); if(!str(x.id)||!str(x.name))e.push('state id and name required'); return{ok:!e.length,errors:e}; }
export function validateDataset(records: unknown[], evidence: unknown[], institutions: unknown[], sources: unknown[], states: unknown[]) {
  const errors:string[]=[]; const check=(items:unknown[],fn:(x:unknown)=>ValidationResult,label:string)=>items.forEach((x,i)=>{const r=fn(x); if(!r.ok)errors.push(`${label}[${i}]: ${r.errors.join('; ')}`);});
  check(records,validateCivicRecord,'records'); check(evidence,validateEvidenceItem,'evidence'); check(institutions,validateInstitution,'institutions'); check(sources,validateSource,'sources'); check(states,validateState,'states');
  const unique=(items:unknown[],label:string)=>{const ids=items.filter(object).map(x=>x.id).filter(str); if(new Set(ids).size!==ids.length)errors.push(`${label} contains duplicate IDs`);};
  unique(records,'records'); unique(evidence,'evidence'); unique(institutions,'institutions'); unique(sources,'sources'); unique(states,'states'); if(states.length!==37)errors.push('states must contain exactly 36 states and the FCT (37 areas)');
  const evidenceById = new Map<string, Record<string, unknown>>(
    evidence.filter(object).map((e) => [String(e.id), e]),
  );
  const eids = new Set(evidenceById.keys());
  const iids = new Set(institutions.filter(object).map((i) => i.id).filter(str));
  const sids = new Set(states.filter(object).map((s) => s.id).filter(str));
  evidence.filter(object).forEach((e, i) => {
    const record = records.find((r) => object(r) && r.id === e.recordId);
    if (!record || !object(record)) errors.push(`evidence[${i}] references unknown record`);
    else {
      if (e.sector !== record.sector) errors.push(`evidence[${i}] sector does not match its record`);
      if (e.stateId !== record.stateId) errors.push(`evidence[${i}] state does not match its record`);
      if (e.synthetic !== record.synthetic) errors.push(`evidence[${i}] synthetic status does not match its record`);
    }
  });
  records.filter(object).forEach((r, i) => {
    if (!sids.has(String(r.stateId))) errors.push(`records[${i}] references unknown state`);
    if (Array.isArray(r.institutionIds))
      r.institutionIds.forEach((id) => {
        if (!iids.has(id as string)) errors.push(`records[${i}] references unknown institution`);
      });
    if (Array.isArray(r.stages))
      r.stages.forEach((s, j) => {
        if (!object(s) || !s.evidenceId) return;
        const ev = evidenceById.get(String(s.evidenceId));
        if (!eids.has(String(s.evidenceId)))
          errors.push(`records[${i}].stages[${j}] references unknown evidence`);
        else if (
          ev &&
          (ev.recordId !== r.id ||
            ev.sector !== r.sector ||
            ev.stateId !== r.stateId ||
            ev.synthetic !== r.synthetic)
        )
          errors.push(`records[${i}].stages[${j}] evidence does not belong to this record and scope`);
        if (
          s.stage === 'verified' &&
          r.synthetic !== true &&
          ev &&
          (ev.kind !== 'independently-verified' ||
            ev.status !== 'verified' ||
            ev.synthetic !== false ||
            !object(ev.verification))
        )
          errors.push(
            `records[${i}].verified stage requires non-synthetic independently verified evidence with an attestation`,
          );
      });
  });
  return {ok:errors.length===0,errors};
}
