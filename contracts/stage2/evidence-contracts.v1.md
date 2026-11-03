# Evidence contracts v1 (Stage 2)

**Status:** draft-for-founder-review

## EvidenceSource
Publisher-level registry entry. Registration ≠ ingestion ≠ verification.

Required: id, publisher, name, urlStatus, sectors, limitations.

## EvidenceItem
Individual document/dataset/observation linked to a sourceId.

Kinds: official-data | published-research | media-report | community-submission | institutional-announcement.

**Forbidden:** using independently-verified as EvidenceItem.kind.

## VerificationRecord
Human-reviewed only. Required: method, reviewerRole, reviewedAt, supportingEvidenceItemIds, geoScope, temporalScope, methodology, limitations, decision, reviewHistory.

AI may recommend review; **must not** set decision: verified.

## CivicBrief editorial lifecycle
draft → under_review → approved → published → (corrected | withdrawn)

Brain output remains draft until authorised editorial review.
