# Cross-department problem record schema v1

**Status date:** 2026-11-14  
**Purpose:** Shared coordination record so departments can contribute without taking ownership from the lead department. Private IDCC may store operational copies; public products only expose approved public fields.

## Required fields

| Field | Description |
|-------|-------------|
| problemId | Stable ID (e.g. prob-YYYYMMDD-###) |
| problemStatement | Clear statement of the issue |
| geography | State / LGA / national as supported |
| reportingPeriod | Period the evidence or report covers |
| origin | community_report | official_evidence | research | institutional_record |
| supportingEvidence | List of source refs (Observatory observation IDs, URLs, Mandate IDs) |
| evidenceConfidence | publisher_supported | secondary | community | unverified |
| evidenceLimitations | Explicit limitations |
| relatedMandateId | Optional published or draft Mandate ID |
| responsibleInstitution | Named public institution and duty |
| leadIseycDepartment | One of: civic | education | health | software-technology |
| supportingIseycDepartments | Array |
| governmentResponsibility | Text |
| iseycResponsibility | Text |
| partnerResponsibility | Text |
| communityParticipation | Text |
| proposedIntervention | Text |
| requiredExpertiseAndResources | Text |
| expectedOutputs | Measurable outputs |
| expectedOutcomes | Outcomes (not conflated with outputs) |
| verificationMethod | How outcomes would be checked |
| currentStatus | See lifecycle / operational statuses |
| reviewHistory | Append-only decision log (internal) |

## Status values (operational)

recorded · awaiting_verification · in_progress · completed_with_evidence · delayed · not_yet_recorded · rejected

## Rules

- One accountable lead department per intervention.
- Public mandate publication remains a separate human decision.
- Do not merge private organisational data into public datasets.
- Test fixtures must be labelled fixture:true and must never be presented as real community problems.
