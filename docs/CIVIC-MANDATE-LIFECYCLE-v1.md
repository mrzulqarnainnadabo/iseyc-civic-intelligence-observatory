# Civic Mandate record lifecycle v1

**Status date:** 2026-11-14  
**Owner department:** Civic Engagement & Accountability  
**Scope:** Public mandate workflow for Civic Mandate Nigeria. Does not change production schema until implemented in Mandate repo.

## Principle

A community submission is not a verified fact, a public mandate, or proof of institutional failure. Publication is a **human decision**.

AI may assist with clarification, summarisation, source discovery and drafting. AI **cannot** approve or publish.

## Lifecycle states

| State | Public visibility | Meaning |
|-------|-------------------|---------|
| `submitted` | Internal | Received; not yet triaged. |
| `clarification_required` | Internal | Issue vague, duplicated, unsupported or geographically unclear. |
| `under_review` | Internal | Issue identified; human review in progress. |
| `evidence_review` | Internal | Observatory / specialist evidence being attached. |
| `awaiting_publication_decision` | Internal | Draft demand ready; human decision pending. |
| `published` | Public | Approved for public wall / brief / API. |
| `response_recorded` | Public | Institutional response documented (not resolution). |
| `implementation_reported` | Public | Claimed implementation recorded; not independently verified. |
| `independently_verified` | Public | Verification performed against defined method. |
| `closed_with_evidence` | Public | Closed with documented outcome evidence. |
| `rejected` | Internal | Not published; reason retained internally. |
| `withdrawn` | Internal | Contributor or operator withdrew. |

Private reviewer notes and contributor contact details never appear on public surfaces.

## Decision rights

- **Publication:** human reviewer only (Civic Engagement & Accountability).
- **Specialist assessment:** Health / Education / Technology may advise; they do not publish mandates.
- **Rejection:** human reviewer; reason stored internally.
- **Response recording:** Civic; does not equal verification.

## Cross-product references

Published mandate records may reference:

- Observatory observation IDs (with limitations)
- Evidence Vault record IDs
- Community observation IDs (distinct from demands)
- Problem record IDs (internal coordination)

Stable public ID remains the Mandate published record ID. Do not merge databases.

## Relation to departments

| Department | Role in lifecycle |
|------------|-------------------|
| Civic Engagement & Accountability | Lead: intake, clarification, institution mapping, publication decision, response tracking |
| Education & Capacity Building | Support: literacy programmes, explaining public information |
| Health & Well-being | Support: interpret health evidence; advise on health-related demands |
| Software & Technology | Support: tools, data pipelines, accessibility |

One lead department per intervention. Public mandates remain Civic-owned.

## Non-negotiables

- No auto-publish from AI or from Observatory statistics.
- No conversion of community reports into national prevalence.
- Non-partisan language only.
- Preserve pilot framing: published rows are reviewed public records, not a national survey.
