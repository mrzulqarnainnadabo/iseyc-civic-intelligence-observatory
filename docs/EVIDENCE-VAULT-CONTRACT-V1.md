# Evidence Vault contract — consumer v0.1

## Ownership and separation

The ISEYC Evidence Vault is the private source-linked evidence register. It is separate from:
- Civic Mandate demands;
- Community Observations;
- the Observatory source registry;
- live public indicator retrieval.

The source registry describes available sources. The Evidence Vault records specific evidence items, their provenance, review state, geographic and temporal scope, and any explicit relationship to a community observation.

## Public API

GET https://2027-street-mandate.vercel.app/api/v1/evidence-records

Contract version: 0.1.0  
Publication boundary: published-and-dual-reviewed-only

A record is returned only when:
- Publication Status = Published
- Review Gate = Dual review complete

The API exposes a strict allowlist. Reviewer identities and review dates remain private.

## Verification is not one status

- UNVERIFIED: not yet checked.
- SOURCE_CONFIRMED: the source URL and publisher/source identity were checked.
- CONTENT_CORROBORATED: the source content was checked against a specific claim.
- DISPUTED: credible material conflicts with the claim.
- CORRECTED, SUPERSEDED and WITHDRAWN: lifecycle states that must remain visible.

Source reachability does not establish that the source content corroborates a community report.

## Evidence relation

Each evidence item may be:
- Not assessed
- Context only
- Corroborates
- Contradicts
- Unrelated

The source API enforces:
- Corroborates requires a linked Community Observation ID, Verification = CONTENT_CORROBORATED and Evidence Link Review = Content checked.
- Contradicts requires a linked Community Observation ID, Verification = DISPUTED and Evidence Link Review = Content checked.

The Observatory must preserve these states exactly. It must not infer a relationship from shared sector, text similarity or proximity alone.

## Required provenance fields

Every evidence record should preserve:
- Source ID matching the Observatory source registry;
- publisher and HTTPS source URL;
- evidence type and scope;
- indicator code, measure, unit and numeric value where relevant;
- value status (observed, estimated, provisional, missing or revised);
- geographic level and geographic unit;
- reference period and retrieval date;
- methodology and limitations;
- verification and evidence-link review state;
- linked community observation ID where a specific relationship has been reviewed.

A null value is not zero. A catalogue entry is not an ingested observation.

## Geography and temporal alignment

- National indicators are national context only; they cannot verify a state, LGA, ward or facility report.
- State-level evidence cannot establish a named facility's condition.
- A registry listing does not establish that a facility is functional, staffed or supplied.
- A reference period must overlap the reported observation period before making a temporal comparison.
- Indicator definitions and units must match before comparing values.
- Conflicting source periods, scopes or definitions remain separate; do not average them.

## Initial evidence-vault entries

The private Evidence Vault has six New / Pending records:
- World Bank WDI Nigeria population total (2024) — one national estimate stored; not linked to a community report.
- World Bank primary gross enrolment — source catalogue only; no numeric value asserted.
- World Bank under-five mortality — source catalogue only; no numeric value asserted.
- Kaduna HEFA — source access required.
- Nigeria Health Facility Registry — API access required.
- NPHCDA data requisition portal — access route, not a dataset.

These are not yet public. The population estimate is national context only.

## Current integration boundary

The Observatory has separate read-only adapters for Community Observations and the Evidence Vault. Both fail closed when their public APIs are unavailable, invalid or incomplete. The Mandate production deployment and live Evidence Vault response still require verification; until that happens, the UI must show the unavailable state and must not claim to display published Evidence Vault records or linked evidence.
