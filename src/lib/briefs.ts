import type { CivicRecord, EvidenceItem, Institution, Sector, StateRef } from '../data/types';
import { SECTOR_LABEL, KIND_LABEL, STAGE_LABEL } from '../data/types';
import { CLAIM_LABEL, claimStrength, implementationEstablished, stageOf } from './rules';

export interface BriefSection { question: string; lines: string[] }
export interface Brief { title: string; synthetic: boolean; scope: string; sections: BriefSection[]; caveats: string[] }

/** Builds a structured brief answering the nine questions from records on hand. Deterministic: no generated claims. */
export function buildBrief(args: { records: CivicRecord[]; evidence: EvidenceItem[]; institutions: Institution[]; states: StateRef[]; stateId?: string; sector?: Sector }): Brief {
  const { records, evidence, institutions, states, stateId, sector } = args;
  const stateName = stateId ? states.find(s => s.id === stateId)?.name ?? stateId : 'All states';
  const sectorName = sector ? SECTOR_LABEL[sector] : 'All sectors';
  const synthetic = records.some(r => r.synthetic);
  const ev = (id: string) => evidence.filter(e => e.recordId === id);
  const instNames = (r: CivicRecord) => r.institutionIds.map(i => institutions.find(x => x.id === i)?.name ?? i);
  const established = records.filter(r => implementationEstablished(r, evidence));
  const lines = (f: (r: CivicRecord) => string) => records.map(f);
  return {
    title: `Civic Intelligence Brief: ${sectorName}, ${stateName}`,
    synthetic, scope: `${sectorName} | ${stateName} | ${records.length} published record(s)`,
    sections: [
      { question: 'What is happening?', lines: lines(r => `${r.title}: ${r.summary}`) },
      { question: 'Where is it happening?', lines: lines(r => `${r.id}: ${states.find(s => s.id === r.stateId)?.name ?? r.stateId}${r.lga ? `, ${r.lga}` : ''}`) },
      { question: 'Who is affected?', lines: ['Community members who submitted or share the reported need. These are community submissions: they do not measure how many people are affected.'] },
      { question: 'What evidence supports the information?', lines: lines(r => `${r.id}: ${ev(r.id).length} evidence item(s): ${ev(r.id).map(e => `${KIND_LABEL[e.kind]} (${e.status})`).join('; ') || 'none attached'}`) },
      { question: 'Which institutions have responsibility?', lines: lines(r => `${r.id}: ${instNames(r).join('; ')} [responsibility mapping unverified until a legal basis is attached]`) },
      { question: 'What has been announced?', lines: lines(r => `${r.id}: announcement ${stageOf(r, 'announced')?.status ?? 'unknown'}; funding ${stageOf(r, 'funded')?.status ?? 'unknown'}`) },
      { question: 'What has been implemented and independently verified?', lines: [
        established.length ? `Independently verified delivery: ${established.map(r => r.id).join(', ')}.` : 'No record in this scope has independently verified delivery.',
        ...lines(r => `${r.id}: ${CLAIM_LABEL[claimStrength(r, evidence)]}`) ] },
      { question: 'What remains unknown?', lines: records.flatMap(r => r.unknowns.map(u => `${r.id}: ${u}`)).slice(0, 40) },
      { question: 'What should happen next?', lines: records.flatMap(r => r.nextSteps.map(n => `${r.id}: ${n}`)).slice(0, 40) },
    ].map(s => ({ ...s, lines: s.lines.length ? s.lines : ['No published records match this scope.'] })),
    caveats: [
      'Community submissions are not a representative survey.',
      'Published means reviewed for clarity and safety. It is not a vote, ranking or proof that a claim is true.',
      'A referral, announcement or budget line does not show that anything was delivered.',
      ...(synthetic ? ['DEMONSTRATION DATA: every record in this brief is synthetic and is not a report about any real place.'] : []),
    ],
  };
}

export function briefToMarkdown(b: Brief): string {
  const out = [`# ${b.title}`, '', b.synthetic ? '> **DEMONSTRATION DATA. Synthetic records, not real reports.**\n' : '', `*Scope: ${b.scope}*`, ''];
  for (const s of b.sections) out.push(`## ${s.question}`, ...s.lines.map(l => `- ${l}`), '');
  out.push('## Read this carefully', ...b.caveats.map(c => `- ${c}`), '');
  return out.filter(l => l !== undefined).join('\n');
}

export { STAGE_LABEL };
