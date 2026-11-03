import { createDemoAdapter } from '../src/adapters/demoAdapter';
import type { Bundle } from '../src/lib/data';

export async function loadBundle(): Promise<Bundle> {
  const a = createDemoAdapter({ latencyMs: 0 });
  const [sources, records, evidence, institutions, states] = await Promise.all([a.getSources(), a.getRecords(), a.getEvidence(), a.getInstitutions(), a.getStates()]);
  return { sources, records, evidence, institutions, states };
}
