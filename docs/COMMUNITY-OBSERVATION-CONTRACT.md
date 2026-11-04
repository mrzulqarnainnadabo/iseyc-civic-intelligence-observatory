# Community Observation contract — Observatory consumer v0.1

## Ownership

Civic Mandate Nigeria remains the system of record for citizen demands.

The separate ISEYC Community Observations intake records specific, time- and place-bounded reports about community conditions. These records are not demands, petitions, representative survey responses or verified government performance data.

The Observatory is a read-only consumer of the Mandate public API:

GET https://2027-street-mandate.vercel.app/api/v1/community-observations

Contract version: 0.1.0  
Publication boundary: published-only

## Publication gate

The source API returns a record only when both conditions are true:
- Status = Published
- Review Gate = Dual review complete

The Observatory does not attempt to access the private Notion review workspace. It consumes only the public allowlisted API.

Publication status and verification status are distinct:
- published means the record passed the source's editorial publication gate.
- unverified, corroborated, independently-verified and disputed describe the state of the underlying claim.

The Observatory must never upgrade verification status based on publication or report volume.

## Public record fields

- Stable record ID and optional display ID.
- Contract and publication status.
- Verification status.
- Title, report type and description.
- Sector.
- State, LGA, ward and place/facility where supplied.
- Observation date, submission timestamp and publication date.
- Evidence basis labels and an optional HTTPS evidence link.

The source API must not expose reporter identity, contact details, device fingerprints, source context, reviewer notes, reviewer identities or review dates.

The Observatory adapter maintains an explicit public-field allowlist. Unknown fields cause the response to fail closed rather than silently expanding the public contract.

## Feed states

| State | Meaning | UI behaviour |
|---|---|---|
| ready | Complete valid feed with records | Show records and their individual verification state |
| empty | Valid complete feed with zero published records | Show an honest empty state; never infer no needs |
| unavailable | Request/network/upstream failure | Show unavailable; do not substitute other records |
| invalid | Unsupported contract, malformed records, private fields or duplicate IDs | Withhold the feed |
| incomplete | Pagination mismatch, source truncation or safe page cap exceeded | Withhold the feed |
| not-in-demo | Live feed intentionally omitted from synthetic demo mode | Explain that live records are separate |

A community observation outage must not prevent the rest of the Observatory from loading. The feed status is independent of the Civic Mandate demand feed and the public evidence gateway.

## Geography and evidence matching

A community observation may be shown alongside a public evidence item only when the relationship is explicit and defensible.

- A national indicator may provide national context, but cannot verify a named LGA, ward or facility.
- A state-level observation cannot be treated as facility-level evidence.
- Different reference periods must remain visible.
- A registry listing does not establish that a facility is functional.
- Similar descriptions do not establish that two reports are the same incident.
- A report's evidence link is a source lead; the Observatory must not assume that the linked material corroborates the claim until a reviewer checks its publisher, date, geography, method and measure.
- Missing records do not mean the service is available.
- Counts are counts of published reports, not prevalence, population coverage or public opinion.

## Failure policy

- No fallback from the observation API to /api/pulse, CommunityRecord demands, synthetic fixtures or national indicators.
- A valid empty response remains empty.
- Upstream truncation or pagination inconsistency returns an incomplete state with no records shown as complete.
- Unknown sectors remain unclassified only if the public API contract explicitly allows them; otherwise the response is invalid.
- The source remains separate from the existing CivicRecord and EvidenceItem types.

## Current scope

The adapter and UI provide a read-only public observation view. They do not yet:
- independently verify reports;
- match reports to HEFA/HFR facility data;
- create formal evidence relationships;
- record institutional responses;
- estimate service prevalence or state/LGA rankings.

These capabilities require their own versioned contracts, source provenance and human-review controls.
