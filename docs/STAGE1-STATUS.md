# Stage 1 status — Civic Intelligence Observatory

**Date:** 2026-11-01  
**Branch:** `feat/stage1-observatory-import`  
**HEAD:** see latest commit on branch

## Local verification (fresh this session)

| Check | Result |
|-------|--------|
| Registry | PASS — 26 sources, 4 confirmed, 5 domain-confirmed, 16 not re-confirmed |
| typecheck | PASS |
| tests | **52/52 PASS** |
| production build | PASS |
| Browser smoke | NOT RUN |

## Integrity fixes in local candidate

- `validate.ts` Map typing for evidence cross-checks
- Bare stage `E` without evidenceId → `C`
- `open-treasury` → documented-not-reconfirmed
- `httpAdapter` unused Envelope type removed; remains disabled by default

## Remote branch progress

### Present
Six pages, design system, core lib (hooks/data/rules/briefs), types, demo adapter + index, **httpAdapter**, institutions, schemas, ATTRIBUTIONS, registry validator, briefs/registry/rules tests, package.json, vite/tsconfig, contracts seed

### Still missing on GitHub
- `src/lib/validate.ts`
- `src/styles/components.css`
- `src/data/source-registry.json` and `data/source-registry.json`
- `src/data/geo/nigeria-map.json`
- `src/data/synthetic/index.ts`
- `tests/validate.test.ts`, `tests/adapters.test.ts`, `tests/components.test.tsx`
- `package-lock.json`, app README (product), civic-record schema

Without registry, map, synthetic, validate, and components.css the remote tree **cannot** run the full app.

## Production

No merge. No deploy.
