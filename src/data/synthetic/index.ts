/**
 * SYNTHETIC DEMONSTRATION DATA. Every record here is invented to exercise the interface.
 * States are assigned for display only: nothing below is a report about any real place.
 * Never merge these records with real data. See docs/DATA_CONTRACTS.md.
 */
import type { CivicRecord, EvidenceItem, EvidenceKind, EvidenceStatus, Sector, Stage, StageState, StageStatus } from '../types';
import { STAGES, STAGE_LABEL } from '../types';

const CODE: Record<string, StageStatus> = { E: 'evidenced', C: 'claimed', U: 'unknown', N: 'not-reached' };

/** spec: six comma-separated codes in STAGES order; E/C/U/N with optional ":evidenceId". */
function stages(spec: string): StageState[] {
  return spec.split(',').map((raw, i) => {
    const [c, ev] = raw.trim().split(':');
    return { stage: STAGES[i], status: CODE[c], ...(ev ? { evidenceId: ev } : {}) };
  });
}

export function deriveUnknowns(st: StageState[]): string[] {
  const out = st.filter(s => s.status === 'unknown').map(s => `Whether the "${STAGE_LABEL[s.stage]}" stage has happened is unknown.`);
  const claimed = st.filter(s => s.status === 'claimed').map(s => `The "${STAGE_LABEL[s.stage]}" stage is claimed but has no independent evidence.`);
  return [...out, ...claimed];
}
export function deriveNextSteps(st: StageState[], institution: string): string[] {
  const by = (s: Stage) => st.find(x => x.stage === s)!.status;
  const steps: string[] = [];
  if (by('referred') !== 'evidenced') steps.push(`Confirm in writing whether the demand has been formally referred to ${institution}.`);
  if (by('announced') === 'claimed') steps.push('Obtain the announcement or circular itself and record its date and issuer.');
  if (by('funded') === 'unknown' || by('funded') === 'claimed') steps.push('Check the budget and procurement records for a funded line and a contract.');
  if (by('implemented') === 'claimed') steps.push('Arrange independent verification (document check or site visit) before reporting delivery.');
  if (by('verified') !== 'evidenced' && by('implemented') !== 'claimed') steps.push('Keep the record open and re-check on the next review cycle.');
  return steps;
}

type R = [id: string, sector: Sector, stateId: string, month: string, title: string, summary: string, inst: string[], spec: string, lga?: string];
const RAW: R[] = [
  ['DEMO-001','education','kaduna','2026-06','Roof repairs requested for a basic school','A synthetic request describing classroom roofs that leak in the rainy season.',['subeb','lga'],'C,E:ev-001,C:ev-002,U,N,N','Demonstration LGA A'],
  ['DEMO-002','education','kano','2026-07','Request for desks and seating in a primary school','A synthetic request about pupils sitting on the floor.',['subeb'],'C,U,N,N,N,N'],
  ['DEMO-003','education','oyo','2026-06','Teacher posting requested for a junior secondary school','A synthetic request about a subject with no assigned teacher.',['subeb','ubec'],'C,E:ev-003,E:ev-004,C,C,N'],
  ['DEMO-004','education','enugu','2026-05','Completion of a stalled classroom block','A synthetic request about an unfinished classroom block.',['subeb','ubec'],'C,E:ev-005,E:ev-006,E:ev-007,E:ev-008,E:ev-009'],
  ['DEMO-005','health','borno','2026-07','Regular drug supply for a primary health centre','A synthetic request about stock-outs of basic medicines.',['state-moh','lga'],'C,E:ev-010,N,N,N,N','Demonstration LGA B'],
  ['DEMO-006','health','lagos','2026-08','Functioning referral transport for a health centre','A synthetic request about no vehicle for emergency referrals.',['state-moh'],'C,U,N,N,N,N'],
  ['DEMO-007','health','benue','2026-06','Staffing for a rural clinic','A synthetic request about a clinic open only part of the week.',['state-moh','fmohsw'],'C,E:ev-011,C:ev-012,U,N,N'],
  ['DEMO-008','health','sokoto','2026-05','Cold-chain equipment repair at a health facility','A synthetic request about a broken vaccine refrigerator.',['state-moh'],'C,E:ev-013,E:ev-014,E:ev-015,C:ev-016,N'],
  ['DEMO-009','security','plateau','2026-08','Working emergency contact line for a community','A synthetic request for a reachable emergency number.',['police'],'C,U,N,N,N,N'],
  ['DEMO-010','security','fct','2026-07','Street lighting near a market for safer evening trade','A synthetic request linking lighting to safety.',['state-works','lga'],'C,E:ev-017,N,N,N,N'],
  ['DEMO-011','infrastructure','niger','2026-04','Repair of a washed-out road section','A synthetic request about a road that floods and cuts off a village.',['state-works','fmw'],'C,E:ev-018,E:ev-019,E:ev-020,E:ev-021,E:ev-022'],
  ['DEMO-012','infrastructure','rivers','2026-07','Bridge handrails at a footbridge','A synthetic request about a footbridge without safety rails.',['state-works'],'C,U,N,N,N,N'],
  ['DEMO-013','infrastructure','kwara','2026-06','Transformer replacement for a neighbourhood','A synthetic request about repeated electricity outages.',['nerc'],'C,E:ev-023,C:ev-024,N,N,N'],
  ['DEMO-014','infrastructure','ogun','2026-08','Drainage clearing before the rains','A synthetic request about a blocked drain.',['lga'],'C,E:ev-025,N,N,N,N'],
  ['DEMO-015','water-sanitation','bauchi','2026-05','Repair of a community borehole','A synthetic request about a borehole that stopped working.',['state-water','lga'],'C,E:ev-026,C,U,C:ev-027,N'],
  ['DEMO-016','water-sanitation','delta','2026-07','Latrines at a market','A synthetic request about no public toilets at a market.',['lga'],'C,U,N,N,N,N'],
  ['DEMO-017','water-sanitation','taraba','2026-06','Piped water extension to a settlement','A synthetic request about the pipe network ending before a settlement.',['state-water','fmwrs'],'C,E:ev-028,E:ev-029,U,N,N'],
  ['DEMO-018','employment','kano','2026-07','Skills training places for young people','A synthetic request for local vocational training places.',['fmle'],'C,E:ev-030,N,N,N,N'],
  ['DEMO-019','employment','plateau','2026-04','Market stalls for informal traders','A synthetic request about traders displaced from a market.',['lga'],'C,E:ev-031,E:ev-032,E:ev-033,E:ev-034,E:ev-035'],
  ['DEMO-020','employment','lagos','2026-08','Access to small business loans','A synthetic request about difficulty reaching small loans.',['fmle'],'C,U,N,N,N,N'],
  ['DEMO-021','public-finance','kaduna','2026-07','Publication of a local project budget','A synthetic request to publish how a local project budget was set.',['lga','bpp'],'C,E:ev-036,N,N,N,N'],
  ['DEMO-022','public-finance','fct','2026-06','Contract details for a public works project','A synthetic request to see the contract award and timeline.',['bpp'],'C,U,C:ev-037,C,N,N'],
  ['DEMO-023','governance','oyo','2026-08','A reachable complaints office at the local council','A synthetic request about a complaints desk with no fixed hours.',['lga'],'C,U,N,N,N,N'],
  ['DEMO-024','governance','borno','2026-07','Public notice boards for council decisions','A synthetic request for council decisions to be posted publicly.',['lga'],'C,E:ev-038,N,N,N,N'],
];

export const SYNTHETIC_RECORDS: CivicRecord[] = RAW.map(([id, sector, stateId, month, title, summary, inst, spec, lga]) => {
  const st = stages(spec);
  return {
    id, origin: 'observatory-demo', synthetic: true, title: `Demonstration: ${title}`, summary, sector, stateId, ...(lga ? { lga } : {}),
    kind: 'community-submission', reviewStatus: 'published', publishedMonth: month, institutionIds: inst, stages: st,
    unknowns: deriveUnknowns(st), nextSteps: deriveNextSteps(st, inst[0]),
  } as CivicRecord;
});

type E = [id: string, rec: string, kind: EvidenceKind, status: EvidenceStatus, title: string, excerpt: string, date: string, limits: string[]];
const COMM = ['A community submission shows what someone reported, not how common the problem is.'];
const SYN = 'Synthetic example text.';
const EV: E[] = [
  ['ev-001','DEMO-001','official-data','unverified','Referral acknowledgement (synthetic)',`${SYN} A letter acknowledging receipt of the request.`,'2026-07-02',['Acknowledging a request does not mean action was taken.']],
  ['ev-002','DEMO-001','media-report','unverified','Local report of an announced repair programme (synthetic)',`${SYN} A news item says repairs are planned.`,'2026-08-11',['Media report; no contract or completion evidence.']],
  ['ev-003','DEMO-003','official-data','unverified','Referral letter (synthetic)',`${SYN} A copy of the referral letter.`,'2026-07-05',['A referral is not implementation.']],
  ['ev-004','DEMO-003','media-report','unverified','Announcement of teacher recruitment (synthetic)',`${SYN} An announcement of a recruitment drive.`,'2026-08-01',['An announcement is not a posting to this school.']],
  ['ev-005','DEMO-004','official-data','unverified','Referral letter (synthetic)',`${SYN} Referral to the state basic education board.`,'2026-05-20',['A referral is not implementation.']],
  ['ev-006','DEMO-004','official-data','unverified','Announcement circular (synthetic)',`${SYN} A circular listing the block for completion.`,'2026-06-10',['A circular is not funding.']],
  ['ev-007','DEMO-004','official-data','unverified','Contract record (synthetic)',`${SYN} A procurement record with an award date.`,'2026-07-03',['A contract award is not completion.']],
  ['ev-008','DEMO-004','published-research','unverified','Programme progress note (synthetic)',`${SYN} A programme note reporting works underway.`,'2026-09-12',['Self-reported by the programme.']],
  ['ev-009','DEMO-004','independently-verified','verified','Site verification by ISEYC reviewers (synthetic)',`${SYN} Two trained reviewers visited and recorded completion with dated photographs.`,'2026-10-05',['Single visit; condition may change after the visit date.','Illustrative: no real verification took place.']],
  ['ev-010','DEMO-005','official-data','unverified','Referral letter (synthetic)',`${SYN} Referral to the state ministry of health.`,'2026-07-30',['A referral is not implementation.']],
  ['ev-011','DEMO-007','official-data','unverified','Referral letter (synthetic)',`${SYN} Referral to health authorities.`,'2026-06-18',['A referral is not implementation.']],
  ['ev-012','DEMO-007','media-report','unverified','Radio item on staffing plans (synthetic)',`${SYN} A radio item mentions staff deployment.`,'2026-08-05',['Media report; no posting list seen.']],
  ['ev-013','DEMO-008','official-data','unverified','Referral letter (synthetic)',`${SYN} Referral for equipment repair.`,'2026-05-12',['A referral is not implementation.']],
  ['ev-014','DEMO-008','official-data','unverified','Work order (synthetic)',`${SYN} A work order for the repair.`,'2026-06-02',['A work order is not a completed repair.']],
  ['ev-015','DEMO-008','official-data','unverified','Payment record (synthetic)',`${SYN} A payment entry for the repair.`,'2026-06-30',['A payment record does not show the work was done.']],
  ['ev-016','DEMO-008','media-report','disputed','Report that equipment was repaired (synthetic)',`${SYN} A report says the equipment works; a community member disputes this.`,'2026-08-20',['Conflicting accounts; no independent check.']],
  ['ev-017','DEMO-010','official-data','outdated','Referral letter (synthetic)',`${SYN} A letter dated well before the latest review cycle.`,'2025-11-14',['Outdated: needs a fresh status check.']],
  ['ev-018','DEMO-011','official-data','unverified','Referral letter (synthetic)',`${SYN} Referral to the works authorities.`,'2026-04-18',['A referral is not implementation.']],
  ['ev-019','DEMO-011','official-data','unverified','Announcement notice (synthetic)',`${SYN} A notice announcing the repair.`,'2026-05-02',['An announcement is not funding.']],
  ['ev-020','DEMO-011','official-data','unverified','Budget line (synthetic)',`${SYN} A budget line naming the road section.`,'2026-05-30',['A budget line is not release of funds.']],
  ['ev-021','DEMO-011','published-research','unverified','Contractor progress report (synthetic)',`${SYN} A report of works progress.`,'2026-08-09',['Self-reported by the contractor.']],
  ['ev-022','DEMO-011','independently-verified','verified','Document and site check by ISEYC reviewers (synthetic)',`${SYN} Reviewers matched the contract to the repaired section on site.`,'2026-09-27',['Single visit; no load or flood test.','Illustrative: no real verification took place.']],
  ['ev-023','DEMO-013','official-data','unverified','Referral letter (synthetic)',`${SYN} Referral to the regulator.`,'2026-06-22',['A referral is not implementation.']],
  ['ev-024','DEMO-013','media-report','unverified','Item about a distribution company programme (synthetic)',`${SYN} Mentions transformer replacements in the area.`,'2026-08-03',['Media report; location not specific.']],
  ['ev-025','DEMO-014','official-data','unverified','Referral letter (synthetic)',`${SYN} Referral to the local council.`,'2026-08-14',['A referral is not implementation.']],
  ['ev-026','DEMO-015','official-data','unverified','Referral letter (synthetic)',`${SYN} Referral to the water agency.`,'2026-05-28',['A referral is not implementation.']],
  ['ev-027','DEMO-015','media-report','unverified','Report that the borehole was fixed (synthetic)',`${SYN} A short report says the borehole is working.`,'2026-09-04',['Single media report; not independently checked.']],
  ['ev-028','DEMO-017','official-data','unverified','Referral letter (synthetic)',`${SYN} Referral to the water agency.`,'2026-06-26',['A referral is not implementation.']],
  ['ev-029','DEMO-017','official-data','unverified','Programme announcement (synthetic)',`${SYN} A programme announcement lists extensions.`,'2026-07-30',['An announcement is not funding.']],
  ['ev-030','DEMO-018','official-data','unverified','Referral letter (synthetic)',`${SYN} Referral to the labour ministry.`,'2026-07-25',['A referral is not implementation.']],
  ['ev-031','DEMO-019','official-data','unverified','Referral letter (synthetic)',`${SYN} Referral to the local council.`,'2026-04-22',['A referral is not implementation.']],
  ['ev-032','DEMO-019','official-data','unverified','Council notice (synthetic)',`${SYN} A council notice announcing stalls.`,'2026-05-15',['A notice is not construction.']],
  ['ev-033','DEMO-019','official-data','unverified','Allocation record (synthetic)',`${SYN} A record of funds allocated.`,'2026-06-12',['An allocation is not a payment.']],
  ['ev-034','DEMO-019','published-research','unverified','Traders association statement (synthetic)',`${SYN} Traders say the stalls are in use.`,'2026-08-30',['Stakeholder statement.']],
  ['ev-035','DEMO-019','independently-verified','verified','Site check by ISEYC reviewers (synthetic)',`${SYN} Reviewers recorded occupied stalls on a site visit.`,'2026-09-29',['Single visit.','Illustrative: no real verification took place.']],
  ['ev-036','DEMO-021','official-data','unverified','Referral letter (synthetic)',`${SYN} Referral to the council and procurement authority.`,'2026-07-21',['A referral is not publication.']],
  ['ev-037','DEMO-022','media-report','unverified','Report of a contract award (synthetic)',`${SYN} A report says a contract was awarded.`,'2026-07-10',['Media report; contract record not seen.']],
  ['ev-038','DEMO-024','official-data','unverified','Referral letter (synthetic)',`${SYN} Referral to the council.`,'2026-07-28',['A referral is not implementation.']],
];

export const SYNTHETIC_EVIDENCE: EvidenceItem[] = EV.map(([id, recordId, kind, status, title, excerpt, date, limits]) => {
  const rec = SYNTHETIC_RECORDS.find(r => r.id === recordId)!;
  return {
    id, synthetic: true, recordId, kind, status, title, excerpt, date, sector: rec.sector, stateId: rec.stateId,
    publisherLabel: 'Demonstration publisher (synthetic)', limitations: kind === 'community-submission' ? COMM : limits,
  };
});
