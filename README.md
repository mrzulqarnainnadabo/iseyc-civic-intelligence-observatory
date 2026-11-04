# ISEYC Observatory

The Observatory is the public evidence workspace within ISEYC's civic intelligence infrastructure. It connects published community records with public datasets, source provenance, geography and documented institutional accountability.

It is an early-stage national pilot. It is not a national statistics office, a representative survey, a government service-delivery monitor or a fully integrated national evidence system.

## Product responsibilities

| Product | Responsibility |
|---|---|
| Civic Mandate Nigeria | Community intake, human review, publication and the system of record for CommunityRecords |
| Civic Intelligence Observatory | Public evidence catalogue, observations, geographic exploration, source provenance and approved briefs |
| Civic Brain | Evidence-grounded analysis, related-record discovery, gap identification and draft briefs for human review |

The products share versioned contracts but retain clear data ownership. See [the product operating model](docs/PRODUCT-OPERATING-MODEL-v1.md).

## Current implementation

- Published Civic Mandate records are consumed through the public pulse compatibility endpoint.
- The versioned CommunityRecord API is the intended primary contract and is not yet integrated in this client.
- Three World Bank indicator pilots are defined for national-level observations.
- The Evidence Gateway and shared civic evidence contracts are present in the repository.
- The source registry is metadata; a listed source is not proof that observations have been ingested.
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
