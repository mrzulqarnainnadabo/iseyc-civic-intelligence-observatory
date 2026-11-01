# Stage 2 shared contracts (Milestones 2.0–2.2)

**Authoritative location:** this directory in `iseyc-civic-intelligence-observatory`.  
**Status:** draft for founder review — not enabled in production integrations.

## Contents

| File | Milestone | Purpose |
|------|-----------|---------|
| `duty-sector-crosswalk.v1.json` | 2.0 | 18 Mandate duties → 8 Observatory sectors (many-to-many) |
| `geographic-reference.v1.json` | 2.1 | 37 state/FCT units, stable ids, aliases |
| `public-mandate-record.v1.schema.json` | 2.2 | JSON Schema for public DTO |
| `public-mandate-record.v1.ts` | 2.2 | TypeScript types + privacy denylist |
| `evidence-contracts.v1.md` | 2.2+ | EvidenceSource, EvidenceItem, VerificationRecord, CivicBrief lifecycle |

## Consumption

- **Civic Mandate:** remains system of record; keep `/api/pulse` shape stable.
- **Civic Brain:** map Pulse voices into `PublicMandateRecordV1` in adapters only.
- **Observatory:** import crosswalk + geo for filters; keep demo adapter default; HTTP live mode stays off until approved.

## Non-goals for this milestone

- No live Observatory integration
- No LGA pack
- No production API shape change
- No AI-assigned `independently_verified`

## Tests

```bash
npm test -- tests/contracts/stage2-contracts.test.ts
```
