# Stage 1 status — Civic Intelligence Observatory

**Date:** 2026-10-31  
**Branch:** feat/stage1-observatory-import  
**Candidate:** v0.2.1 from ISEYC_Civic_Intelligence_Observatory_v0.2.1-candidate.zip

## Decision

**READY FOR INDEPENDENT ACCEPTANCE** of the imported application on the feature branch (not production merge).

## Verified locally (this session)

- [x] Application imported from candidate ZIP (`obs/` root flattened)
- [x] `npm install` (registry.npmjs.org)
- [x] `npm run validate:registry` — PASS (26 sources)
- [x] `npm run typecheck` — PASS
- [x] `npm test` — PASS (52 tests)
- [x] `npm run build` — PASS
- [ ] Browser / mobile smoke — not run in this agent session
- [ ] PR merge and production deploy — **not done**

## Fixes applied during import

1. TypeScript: unused Envelope; typed evidenceById Map; removed unused rids
2. Tests: module-level states for registry suite
3. Synthetic data: bare E stage codes without evidenceId → C (claimed)
4. Source registry: open-treasury HTTP URL → documented-not-reconfirmed
5. Removed empty ZIP path artefact src/{data...}

## Preserved

- Existing contracts/ from repository seed
- App docs, schemas, adapters, design system, six pages
- Disabled-by-default HTTP adapter

## Not done

- Stage 2 integration with Mandate/Brain
- Production deployment
