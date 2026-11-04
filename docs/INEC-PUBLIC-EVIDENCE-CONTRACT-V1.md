# INEC public evidence contract v1.0.0

## Endpoint

`GET /api/evidence/inec`

This is a read-only ISEYC evidence endpoint serving a small allowlist of official-source INEC transcriptions. It is not an INEC API and does not claim to be a live or complete national register.

### Catalogue

`GET /api/evidence/inec?catalog=1`

Returns dataset IDs, source links, reference dates, geography and limitations.

### Dataset access

- `GET /api/evidence/inec?dataset=2023-pvc`
- `GET /api/evidence/inec?dataset=2023-pvc&state=Kaduna`
- `GET /api/evidence/inec?dataset=ekiti-2026-register`
- `GET /api/evidence/inec?dataset=osun-2026-pvc`
- `GET /api/evidence/inec?dataset=all`

Unknown dataset IDs return 404. An exact state filter with no match returns an empty result, not an invented zero-valued row.

## Dataset inventory

| Dataset ID | What it measures | Reference |
|---|---|---|
| `inec-2023-registered-voters-pvc-collection` | Registered voters and collected PVCs by state/FCT | 2023 General Election; PVC collection as at 5 February 2023 |
| `inec-ekiti-2026-election-register-snapshot` | Ekiti election register and reported registration components | 20 June 2026 governorship election; INEC bulletin 9 June 2026 |
| `inec-osun-2026-pvc-collection` | Collected PVCs across 30 LGAs | 2026 Osun off-cycle election; source page does not expose an exact cutoff date |

## Contract fields

Each dataset response includes:
- `contractVersion`
- `datasetId`
- `publisher`
- `sourceUrl`
- `sourceReferenceDate` (nullable where the source does not provide one)
- `retrievedAt`
- `methodology`
- `limitations`
- `reconciliation` where applicable
- `records` and `recordCount`

## Interpretation and publication rules

- Registered voters are not all eligible citizens.
- New CVR registrations are not the same as the validated final register.
- PVCs printed, distributed and collected are distinct measures.
- Collected PVCs are not accredited voters or turnout.
- Election-specific state register totals must not be added to the 2023 national base.
- National totals must not be derived from a selected set of states.
- Preserve the INEC source arithmetic discrepancies; never silently correct them.
- No collection rate is calculated where the denominator is unavailable.
- No state or LGA value is inferred from a national figure.

## Quality findings retained in the data

The 2023 INEC PDF's registered-voter and collected-PVC state rows sum to the published national totals. Its uncollected-PVC values do not reconcile: 16 state rows differ from registered minus collected; the state-row sum, printed national total and arithmetic difference are different.

The 9 June 2026 Ekiti bulletin states 1,059,360 registered voters, a 2023 base of 987,647 and 66,664 new registrants. Base plus new registrations equal 1,054,311, leaving 5,049 voters unexplained. INEC also reports 2,103 double registrations invalidated, but the bulletin does not reconcile the full components.

The Osun 2026 PVC Statistics page reports 1,518,485 collected PVCs across 30 LGAs. The page reviewed does not expose a collection cutoff date or registered-voter denominator.

## Change control

The JSON files in `data/indicators` are the source-of-truth transcriptions. Mirrored copies under `src/data/indicators` are consumed by the browser UI. Tests enforce mirror equality, national totals, key state values and the explicit discrepancy fields. Any update must change both files and include the exact source, reference date, retrieval date and reconciliation notes.
