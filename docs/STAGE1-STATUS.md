# Stage 1 status — Civic Intelligence Observatory

**Date:** 2026-10-31  
**Branch:** `feat/stage1-observatory-import`  
**Candidate:** v0.2.1 ZIP

## Local verification (complete)

| Check | Result |
|-------|--------|
| Node | v24.15.0 |
| validate:registry | PASS |
| typecheck | PASS |
| tests | **52/52 PASS** |
| production build | PASS |
| Browser smoke | Not run in agent session |

## Remote branch status (in progress)

Source is being uploaded via authenticated GitHub file API in batches (no force-push, not on main).

**Already on branch:** package.json, vite/tsconfig, main.tsx, adapters (demo + index), hooks/data provider, feedback, tokens/base CSS, validate-registry script, test setup/helpers, synthetic institutions, Stage 1 docs, contracts seed.

**Still uploading:** pages, remaining design/lib, source-registry JSON, nigeria-map, synthetic records, components.css, httpAdapter, full test suites, package-lock, app README/docs.

## Fixes in candidate import

1. TypeScript Map typing in validate.ts; removed unused symbols
2. Module-level `states` in validate tests
3. Bare stage `E` without evidenceId → `C`
4. open-treasury HTTP → documented-not-reconfirmed

## Decision

- **Local tree:** READY FOR INDEPENDENT ACCEPTANCE
- **Remote completeness:** NOT READY until remaining batches land
- **Production:** no merge, no deploy

## Founder option for full tree

Verified archive path when available in agent artifacts: `observatory-stage1-import.tgz` / local `/tmp/obs-rebuild/app` after re-extract.
