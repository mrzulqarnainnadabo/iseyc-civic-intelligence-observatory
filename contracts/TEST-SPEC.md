# Contract & privacy test specification — Stage 2

## A. Public Pulse privacy (live or mocked)

```
GET /api/pulse
```

Assert:

1. `total` is a number ≥ 0  
2. For each voice: keys ⊆ { id, sentence, duty, mandate, office, state, lga, created, schemaVersion }  
3. No key matches /email|phone|fingerprint|gender|ageBand|name/i  
4. Body is not a raw Notion properties dump  

**Live check 2026-10-30:** total=24; sample voices matched allowlist; no PII keys observed.

## B. PublicMandateRecord schema

Validate each voice (normalized) against `public-mandate-record.v1.json`.

## C. EvidenceRecord schema

Unit fixtures: one `community_submission` built from a PublicMandateRecord; one `official_publication` stub with URL; reject record with neither sourceUrl nor documentRef.

## D. CivicBrief schema

- Valid minimal brief with empty arrays and explicit limitations  
- Invalid: FACT finding with empty citations → fail  
- COMMUNITY_REPORT classification required on communityReports items  

## E. Unpublished isolation

Records with Status ≠ Published never appear in pulse voices (Mandate repo).

## Implementation note

Prefer tests inside each repo (`npm test`) copying these fixtures. Wiring is Stage 2 on feature branches.
