# Stage 2 shared contracts (Milestones 2.0–2.2) — v1.1

**Authoritative location:** this directory in `iseyc-civic-intelligence-observatory`.
**Status:** draft for founder review — not enabled in production integrations.

## Contents

| File | Purpose |
|------|---------|
| `duty-sector-crosswalk.v1.json` | 18 Mandate duties → **10** Observatory sectors |
| `geographic-reference.v1.json` | 37 state/FCT units; **Abuja not auto-FCT** |
| `public-mandate-record.v1.schema.json` | JSON Schema for public DTO |
| `public-mandate-record.v1.ts` | TypeScript types + privacy denylist |
| `pulse-to-public-mandate.ts` | Conversion from Pulse; rejects private/unpublished |
| `fixtures/pulse-public-sample.json` | Sanitised public Pulse sample |
| `evidence-contracts.v1.md` | EvidenceSource / Item / VerificationRecord / CivicBrief |

## Sector taxonomy v1.1

Original eight ids preserved. **Added:** `agriculture`, `environment`.

- Agriculture → agriculture (primary)
- Environment → environment (primary)
- Youth Development → education + employment (**cross-cutting**, not dual primary)
- Women's Development → governance (**cross-cutting**)
- Housing → infrastructure (**interim**)
- Social Protection → governance (**interim**)

## Geographic rules

- FCT / Federal Capital Territory → `ng-fct`
- Nassarawa → `ng-nasarawa` (legacy spelling)
- **Abuja does not auto-resolve** to FCT
- No LGA/ward/community identifiers in v1

## Non-goals

- No `/api/pulse` shape change
- No live HTTP adapter enablement
- No AI-assigned independent verification
