import { describe, expect, it } from 'vitest';
import { loadBundle } from './helpers';
import { briefToMarkdown, buildBrief } from '../src/lib/briefs';

describe('brief builder', () => {
  it('answers all nine questions in a fixed order', async () => {
    const b = await loadBundle(); const brief = buildBrief({ ...b, records: b.records.filter(r => r.stateId === 'kaduna'), stateId: 'kaduna' });
    expect(brief.sections.map(s => s.question)).toEqual(['What is happening?', 'Where is it happening?', 'Who is affected?', 'What evidence supports the information?', 'Which institutions have responsibility?', 'What has been announced?', 'What has been implemented and independently verified?', 'What remains unknown?', 'What should happen next?']);
  });
  it('flags demonstration data and never asserts verified delivery without evidence', async () => {
    const b = await loadBundle(); const recs = b.records.filter(r => r.id === 'DEMO-001');
    const brief = buildBrief({ ...b, records: recs }); const md = briefToMarkdown(brief);
    expect(md).toMatch(/DEMONSTRATION DATA/); expect(md).toMatch(/No record in this scope has independently verified delivery/);
  });
  it('says so plainly when no records match', async () => {
    const b = await loadBundle(); const brief = buildBrief({ ...b, records: [] });
    expect(brief.sections.every(s => s.lines[0].startsWith('No published records') || s.lines.length > 0)).toBe(true);
    expect(brief.sections[0].lines).toEqual(['No published records match this scope.']);
  });
});
