# Observatory product and operating model

**Status:** Product direction and implementation baseline  
**Scope:** Observatory UX, cross-product responsibilities, and national-readiness sequence

## Product purpose

The Observatory is the place to examine public evidence about Nigeria and connect it to published community intelligence, geography, institutions, and documented responses.

It is not a general dashboard, a source-link directory, a national statistics office, or an AI chat interface.

A user should be able to move from a place or issue to:
1. the community records that have been published;
2. the public observations and documents relevant to that place or issue;
3. the source, period, geography, method, and limitations for each observation;
4. the institution whose responsibility is supported by a published legal or administrative source;
5. documented commitments and responses;
6. what changed, what did not, and what remains unknown.

## Three products, one operating system

| Product | Owns | Must not become |
|---|---|---|
| Civic Mandate Nigeria | Community intake, moderation, publication, stable CommunityRecord IDs, community follow-up and response records | A public suggestion box or a proxy for national opinion |
| Civic Intelligence Observatory | Evidence-source metadata, datasets, observations, geographic context, institutional evidence, public exploration and approved briefs | A decorative dashboard or an unverified source directory |
| Civic Brain | Evidence retrieval, structured analysis, cross-record discovery, gap identification, draft briefs and next-check suggestions | An authority, autonomous publisher, or unsupported answer generator |

### Shared operating loop

**Community concern → published CommunityRecord → evidence retrieval → grounded analysis → human review → documented response → updated public record**

Ownership remains explicit:
- Mandate owns the community record and its publication lifecycle.
- Observatory owns evidence-source metadata, dataset and observation provenance, and public evidence presentation.
- Brain produces derived analysis. It does not own source facts or publish institutional conclusions.
- A named human reviewer owns approval of public briefs and any verification claim.

## Observatory information architecture

Keep the navigation to six durable destinations:

1. **Overview** — current national evidence and published community-record feed.
2. **Issues** — browse records and evidence by sector and issue.
3. **Places** — national, state, LGA and facility views only at the geography level supported by actual data.
4. **Evidence** — observations, documents, source methods, periods, licences and retrieval history.
5. **Accountability** — documented duties, commitments, responses and delivery evidence.
6. **Briefs** — human-approved intelligence briefs with visible source references and version history.

A screen should not explain its own navigation with paragraphs. Use clear nouns, useful defaults, visible source context and predictable interactions. Remove duplicate labels, marketing copy, helper essays, decorative cards and repeated explanatory text. Keep essential methodological limitations adjacent to the data they qualify.

## Interaction and visual rules

- Start with the user's task, not a hero statement.
- Prefer a quiet workspace: one canvas, clear hierarchy, restrained borders, consistent spacing and strong typography.
- Avoid gradients, glowing surfaces, oversized metric tiles, decorative maps, excessive card nesting and repeated explanatory text.
- Use tables for precise comparison; maps only when geography changes the decision.
- Every filter must affect the displayed data and be shareable in the URL where practical.
- Every record and observation must have a stable detail view and a copyable canonical URL.
- Keep mobile and low-bandwidth use first-class: compact lists, progressive loading, no mandatory map interaction, minimal assets and recoverable errors.
- Keyboard navigation, visible focus, semantic headings, accessible tables and reduced motion are release requirements.

## Data and evidence rules

- A published CommunityRecord is a published report, not proof that the reported condition is independently verified.
- Mandate submission counts are not prevalence, representativeness or public opinion.
- An indicator must carry publisher, dataset, indicator definition, value, unit, reference period, geography, method, licence, retrieval time and quality flags where available.
- National observations must never be rendered as state or LGA values.
- Source metadata is not an observation. A registered source must not inflate coverage metrics.
- Budget allocation, release, expenditure, project execution and independently verified service delivery are separate evidence states.
- Institutional responsibility requires a cited legal or administrative basis. A named office in a citizen submission is not proof of jurisdiction.
- Empty, unavailable, stale, partial and failed retrieval are distinct states.
- No synthetic records or observations in live views. Demonstration fixtures, if retained for tests, stay isolated and unmistakably labelled.
- Every derived statement from Brain must retain its evidence references, generation time, model/method metadata and review status.
- No AI-generated content becomes a published brief or verified finding without a human approval event.

## National readiness: work in evidence order

### 1. Stabilise the shared record contract
- Consume Mandate's versioned, published-only CommunityRecord API first.
- Preserve record IDs, raw duty, office label, place, timestamps, publication status and verification status.
- Use the pulse endpoint only as a clearly identified temporary compatibility fallback.
- Surface pagination completeness and upstream truncation; never imply a complete national feed when the source is partial.

### 2. Build a real evidence layer
- Promote only sources with verified access paths, licensing, update cadence, geography, methods and data quality documentation.
- Integrate one Nigerian public dataset end-to-end before adding more catalogue entries.
- Persist immutable retrieval receipts and versioned observations before relying on them for longitudinal analysis.
- Support refresh, stale detection, source outages, revisions and provenance.

### 3. Make geography evidence-led
- Distinguish national, state, LGA, ward, facility and point observations.
- Build place profiles from evidence actually available at that level.
- Show coverage gaps as gaps. Never fill them with national proxies or inferred state scores.

### 4. Make accountability operational
- Add documented institutional responsibility with legal basis and review history.
- Connect public commitments and responses to CommunityRecord IDs.
- Track referral, acknowledgement, commitment, funding, implementation and independent verification as separate states.
- Allow authorised human reviewers to correct, flag, withdraw and approve records with an audit trail.

### 5. Integrate Civic Brain as a governed analyst
- Brain reads CommunityRecords and Observatory observations through stable, versioned APIs.
- It proposes related records, evidence gaps, candidate institutional mappings and draft briefs.
- It must cite exact source records and clearly separate facts, claims, inferences and unknowns.
- Human review is required for publication, verification and institutional attribution.

## Developer and agent experience

- One canonical schema per shared entity; generated types and contract tests should prevent drift.
- Keep data fetching, domain mapping, presentation and policy rules in separate modules.
- Avoid duplicated source adapters and hand-maintained copies of shared contracts.
- Provide stable local fixtures that mirror production schemas without entering live builds.
- Every API must document version, pagination, filters, error semantics, provenance and privacy boundary.
- Add contract tests across Mandate → Observatory and Observatory → Brain.
- Keep operations observable: request IDs, structured errors, retrieval receipts, freshness and source health.
- Agents must inspect the repository, use existing contracts, work on isolated branches, run the full verification suite and report exact SHAs. They must not silently change schemas, publication rules, production settings or databases.

## Current implementation boundary

This branch improves the Observatory's product shell and national overview. It does not claim that the full national evidence layer, institutional response workflow, state-level evidence coverage or three-product production integration is complete.

The next engineering gate is CommunityRecord-first consumption with an explicit pulse fallback, followed by one real Nigerian public dataset end-to-end and durable provenance.
