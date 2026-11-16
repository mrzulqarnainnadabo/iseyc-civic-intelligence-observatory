# System architecture — ISEYC Civic Intelligence ecosystem

**Code snapshot:** Observatory `main` at `310d881f099887071e184d902e987c9585b3c761`. This describes repository contracts, not deployed production behavior.

## Institutional product roles

- **ISEYC** is the institution and parent identity.
- **Civic Mandate Nigeria** is the citizen entry point for participation and moderated intake.
- **Intelligence Observatory** is the central public evidence and accountability workspace.
- **Civic Brain** interprets published evidence and produces human-review drafts; it is not an independent verifier or referral-delivery system.
- **Digital Operations Centre** coordinates internal work and must retain its restricted-data boundary.
- The departments are Education & Capacity Building, Health & Well-being, Software & Technology, and Civic Department.

## Public data flow

```text
Civic Mandate private intake and moderation
                 |
                 | published CommunityRecord contract only
                 v
       Intelligence Observatory <---- curated and allowlisted public sources
                 |                    (published observations, evidence, snapshots,
                 |                     official-source transcriptions, pilot indicators)
                 |
                 +--------------------> Civic Brain interpretation
                                        (published inputs; human review required)
```

Only reviewed, published, allowlisted fields may cross a public product boundary. Unpublished submission content, contact details, device data, reviewer notes, and private operator records do not flow to the Observatory or Civic Brain. A publication status is not an independent verification status, and neither a referral nor an announcement establishes implementation or verified delivery.

## Observatory implementation boundary

Current `src/adapters/index.ts` selects the published CommunityRecord adapter by default. Synthetic demonstration fixtures require an explicit recognized `?demo=` selection and must remain clearly labelled. Other adapters and API handlers validate versioned envelopes, source allowlists, payload bounds, publication state, and completeness; invalid or incomplete upstream data must fail closed or display an explicit unavailable/limited state.

The serverless-style World Bank gateway is restricted to configured Nigeria pilot indicators and allowlisted hosts. Its short-lived in-memory cache is not durable storage. The Observatory has no first-party database, authentication, or write/admin workflow in this snapshot. Curated snapshots and catalogued sources are not proof of live publisher availability or nationwide coverage.

## Release, privacy, and verification boundaries

- Repository code and green CI checks do not establish production configuration, upstream availability, data freshness, or intended-hostname behavior.
- No production API or deployment was contacted for this snapshot. Keep the founder release gate in force and do not make a production-readiness or national-coverage claim without explicit approval and authorized deployed-source verification.
- Preserve published-only mappings, source attribution, evidence limitations, and human review. Never move private intake or applicant data between the products.
