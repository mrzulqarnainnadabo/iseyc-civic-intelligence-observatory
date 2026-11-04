# ISEYC Observatory

The Observatory is the public evidence workspace within ISEYC's civic intelligence infrastructure. It connects published community records with public datasets, source provenance, geography and documented institutional accountability.

It is an early-stage national pilot. It is not a national statistics office, a representative survey, a government service-delivery monitor or a fully integrated national evidence system.

## Product responsibilities

| Product | Responsibility |
|---|---|
| Civic Mandate Nigeria | Community intake, human review, publication and the system of record for CommunityRecords |
| Civic Intelligence Observatory | Public evidence catalogue, observations, geographic exploration, source provenance and approved briefs |
| Civic Brain | Evidence-grounded analysis, related-record discovery, gap identification and draft briefs for human review |

The products share versioned contracts but retain clear data ownership. See [the product operating model](docs/PRODUCT-OPERATING-MODEL-v1.md) and [national source-readiness assessment](docs/NATIONAL-SOURCE-READINESS-2026-11.md).

## Current implementation

- Published Civic Mandate records are consumed through the versioned, published-only CommunityRecord v0.1 API; the legacy `/api/pulse` endpoint is a temporary outage fallback only.
- The Observatory adapter follows CommunityRecord pagination, preserves stable IDs and source metadata, and fails closed on malformed or truncated feeds; a valid empty v0.1 response remains empty.
- Community Observations are a separate published-only feed, not Civic Mandate demands. The Observatory uses a distinct v0.1 adapter with strict public-field allowlisting, pagination checks and no pulse/demo fallback.
- The observation feed exposes unavailable, invalid, incomplete, empty and ready states separately; a feed outage does not block the rest of the Observatory.
- The Observatory has a separate Evidence Vault v0.1 adapter and displays only published, dual-reviewed records. It validates source provenance, numeric values, geography and explicit observation relationships; it never substitutes the source registry for evidence.
- Three World Bank indicator pilots are defined for national-level observations.
- The Evidence page includes a sourced historical INEC voter-register/PVC snapshot for all 36 states and FCT, with searchable state rows and explicit source arithmetic warnings.
- Dataset-level source readiness is documented for INEC, UBEC, NBS, CBN, NPC, Budget Office, BPP/NOCOPO and health sources.
- The Evidence Gateway and shared civic evidence contracts are present in the repository.
- The source registry is metadata; a listed source is not proof that observations have been ingested.
- The Kaduna PHC pilot has a documented source-readiness assessment covering HFR API-key access, HEFA data-access gaps and the KSPHCB March 2025 workforce baseline; no facility-level PHC observations have been ingested yet.
- Nigeria's state boundaries support geographic navigation; boundary availability is not state-level evidence coverage.
- Institutional responsibility, response and delivery claims require documentary evidence and human review.
- Demonstration fixtures are isolated behind an explicit demo query and must never enter live data.

## Evidence rules

- Published does not mean independently verified.
- Community reports do not establish prevalence or public opinion.
- National observations are not state or LGA observations.
- A budget allocation is not expenditure; expenditure is not verified delivery.
- A named office in a submission is not a verified legal responsibility.
- Empty, unavailable, stale, partial and failed retrieval are different states.
- A malformed or unsupported CommunityRecord contract response fails closed; it is not silently hidden by the pulse fallback.
- AI analysis is a draft, not an institutional finding or approved public brief.

## Development

Requires Node.js 22.22.2 or later and npm 10 or later.

```bash
npm install
npm run dev
npm run verify
npm run build && npm run preview
```

## Deployment boundary

The merged main branch contains the Evidence Gateway implementation, but the Observatory still requires a configured Vercel project and production verification. Do not describe the gateway as publicly operational until the deployed API has been tested against its upstream source.

## Related products

- [Civic Mandate Nigeria](https://2027-street-mandate.vercel.app)
- [Civic Brain](https://iseyc-civic-brain.vercel.app)


Evidence governance: [Community Observation contract](docs/COMMUNITY-OBSERVATION-CONTRACT.md) · [Evidence Vault contract](docs/EVIDENCE-VAULT-CONTRACT-V1.md) · [Kaduna HEFA access review](docs/HEFA-ACCESS-REVIEW-2026-11.md)


National evidence readiness: [Source readiness assessment](docs/NATIONAL-SOURCE-READINESS-2026-11.md) · [Community Observation contract](docs/COMMUNITY-OBSERVATION-CONTRACT.md) · [Evidence Vault contract](docs/EVIDENCE-VAULT-CONTRACT-V1.md) · [Kaduna HEFA access review](docs/HEFA-ACCESS-REVIEW-2026-11.md)
