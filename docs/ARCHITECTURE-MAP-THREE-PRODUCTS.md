# ISEYC Intelligence System Architecture

**Architecture version:** 2.0  
**Review date:** 12 November 2026  
**Status:** Product operating model and evidence boundaries. Feature-branch work is not yet merged or deployed.

## 1. One institutional system

ISEYC operates four connected products and four specialist departments. They share evidence and decisions, but each product has a distinct responsibility and source of truth.

| Product | Primary responsibility | Owns |
|---|---|---|
| **Civic Mandate Nigeria** | Citizen entry: civic learning, public-service observations, demands, human review and publication | Published CommunityRecords and their moderation history |
| **Intelligence Observatory** | National and state evidence foundation: source registry, observations, indicators, geography, source provenance and public briefs | EvidenceSource metadata, curated observations, retrieval receipts and evidence-quality notes |
| **Civic Brain** | Evidence retrieval, explanation, uncertainty, responsibility mapping and concise draft briefs | Draft analysis and its citations; it does not own upstream source data |
| **Digital Operations Centre** | Internal execution: department plans, programmes, assignments, meetings, decisions, reports, approvals and evidence follow-up | Private operational records, officer workflow and human review history |

## 2. Department responsibilities

1. **Education and Capacity Building** — schooling, learning, teachers, school infrastructure, skills and education programme outcomes.
2. **Health and Well-being** — population health, PHC functionality, workforce, essential medicines, health financing and service continuity.
3. **Software and Technology** — digital access, connectivity, software capacity, innovation infrastructure, digital skills and public digital services.
4. **Civic Department** — documented public duties, institutional accountability, public participation, budget transparency, procurement and published public concerns.

Each department interprets its own field. The Observatory supplies evidence and limits; Civic Brain explains the record; the Operations Centre turns reviewed priorities into owned work.

## 3. Operating loop

`Observe → Source → Reconcile → Explain → Prioritise → Plan → Assign → Execute → Submit evidence → Review → Report`

- Mandate records what citizens submit and what human reviewers publish.
- Observatory establishes what published evidence says, where it applies, when it was measured and what remains unknown.
- Brain turns a specific question into a short, sourced explanation and a responsible next step.
- Departments investigate and propose work within their remit.
- The Operations Centre records owners, due dates, decisions, evidence, approvals and follow-up.
- Public-facing claims are released only after human review.

## 4. Evidence and data ownership

| Evidence object | System of record | Rules |
|---|---|---|
| CommunityRecord | Civic Mandate Nigeria | Submitted, reviewed, published, flagged and rejected are distinct states |
| EvidenceSource / dataset registry | Intelligence Observatory | Registration is not ingestion; source status and access conditions remain explicit |
| IndicatorObservation / source snapshot | Intelligence Observatory | Preserve source, period, unit, geography, method, retrieval date and limitations |
| RetrievalReceipt | Observatory evidence gateway | Preserve success, empty, stale, invalid, partial and unavailable states separately |
| Draft explanation / IntelligenceBrief | Civic Brain | AI output is a draft; citations and human approval are required before publication |
| WorkPlan / Programme / Meeting / Action / Report | Digital Operations Centre | Private operational records; authority and approval must be attributable to a verified officer |

## 5. Public and private boundaries

- Published Mandate records and approved Observatory evidence may be public.
- Private submissions, staff identities, appointment records, drafts, internal decisions and operational notes remain private.
- A public source page does not prove a dataset was ingested.
- A published community report does not establish prevalence or public opinion.
- A budget allocation is not a release; a release is not expenditure; expenditure is not verified delivery.
- An announcement, procurement award, delivery, commissioning and operational functionality are different evidence stages.
- National figures do not establish state, LGA, ward, facility or household conditions unless the source explicitly provides that geography.

## 6. Current Observatory evidence boundaries

- The source registry contains 101 source entries in this feature branch. A registry entry is metadata, not an observation.
- The curated source snapshot pack contains 92 dated observations and 26 catalogue-only or partially integrated sources.
- The new snapshot API is `GET /api/evidence/source-snapshots`.
- The existing `GET /api/evidence/snapshots` endpoint remains unchanged because it serves the existing National Department Snapshot contract and downstream consumers.
- The state-budget coverage register tracks all 36 states and the FCT separately. Fifteen official state budget portals and three additional official state budget documents were located in the current source-discovery pass; 18 states remain unreviewed. A BudgIT Q2 2026 fiscal-information availability table covers all 36 states, but it measures publication completeness rather than service delivery.
- Agora Policy's 2025 analysis covers 35/36 states, excluding Rivers. BudgIT's H1 2026 revenue analysis covers 34/36 states, excluding Rivers and Osun.
- The NGF Public Finance Database claims 36-state coverage, but its landing page showed unrelated injected third-party links during review. It remains under integrity review and contributes no numeric values.
- The FCT's final 2026 appropriation law and official implementation reports were not confirmed in the current source review.

Do not present partial coverage as a complete national dataset. Use the state-budget source-readiness document and coverage JSON for the current denominator and source status.

## 7. Civic Brain response standard

- Answer the question directly first.
- Default to 45–90 words; hard limit 120 words unless the user asks for a detailed report.
- Use only the evidence needed: up to three short source-backed points and one material limitation.
- Distinguish official data, published research, community submissions, estimates and unknowns.
- Do not repeat the question, dump every source, or narrate the research process.
- Never invent statistics, local conditions, institutional duties or outcomes.
- If the evidence is insufficient, say what is missing and identify the responsible source or next step.

## 8. Operations and security

- Shared staff access is transitional and limited to browsing and drafting.
- A shared key is not an individual officer identity, department membership or appointment.
- Privileged approval, assignment, publication and accountable action progress require verified identity and appointment-bound authority.
- Capability checks must precede protected data access and mutation; mutation routes retain same-origin protections.
- Action progress fails closed where verified officer authority is absent.
- Human review remains required for source reconciliation, institutional findings and public release.

## 9. Product experience standard

- Phone-first, low-bandwidth and readable on small screens.
- One clear answer or action per screen; details progressively disclosed.
- Prefer evidence cards with value, unit, period, geography and source link over long explanatory text.
- Label loading, empty, unavailable, stale, partial, demo and under-review states distinctly.
- Avoid decorative dashboards, unsupported rankings, synthetic production data and text-heavy introductions.
- Keep the ISEYC seal unchanged and preserve the calm institutional visual language.

## 10. Release boundary

This branch is a proposed improvement set. It is not production evidence until CI passes, the diff is reviewed, the PR is approved and the deployed endpoints are tested against their actual upstream data. No merge, deployment, DNS or hosting changes are implied by this document.
