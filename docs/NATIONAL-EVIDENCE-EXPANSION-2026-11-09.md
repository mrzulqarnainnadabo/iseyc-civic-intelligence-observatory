# National evidence expansion — 9 November 2026

## What changed

The source registry contains **69 registered sources** on this baseline (up from 38 on the earlier main baseline). New source families include:

- WHO Global Health Observatory — Nigeria profile and indicator access.
- IMF World Economic Outlook — October 2026 vintage and DataMapper/API documentation.
- NIMC NIN enrolment dashboard — October 2025 state snapshot.
- NITDA Digital Literacy for All dashboard and National Digital Literacy Framework.
- NASENI Innovation Hub programme and innovation activity.\n- Innovation Support Network (ISN) national hub directory and 2026 assessment summary.\n- Nigeria Startup Support and Engagement Portal, NBTI incubation-centre records, AfriLabs Nigeria hub profiles, CcHUB programme updates and NIPOST Digital Postcode hub API programme.
- NBS monthly CPI, quarterly GDP and Selected Food Price Watch collections.

The source catalogue and application registry are kept in sync:
- `data/source-registry.json`
- `src/data/source-registry.json`

## Dated source snapshots now displayed

The Overview and relevant Department pages display compact, provenance-first cards from `src/data/indicators/national-department-snapshots.v1.json`.\n\nA read-only endpoint now exposes the same curated contract at `/api/evidence/snapshots` (optional `departmentId` filter; `catalog=1` returns metadata only). It is an ISEYC-curated snapshot API, not a live WHO/NIMC/NITDA/NASENI/NBS API.

| Evidence | Reference period | What the product may state |
|---|---|---|
| WHO Nigeria health indicators | 2021–2023, per indicator | WHO health estimates and reported series with uncertainty intervals; the profile shows no 2023 new-HIV value; national context only |
| NIMC enrolment | 31 October 2025 | 123,906,318 national enrolment records; Kaduna State 7,326,730 |
| NITDA DL4ALL dashboard | Updated 24 October 2026 | 2,783,731 verified programme beneficiaries; 36 states + FCT, 774 LGAs and 14,747 communities reached, plus reported inclusion measures for persons with disabilities, rural beneficiaries and informal-sector workers |
| NASENI InnovateNaija | Announcement dated 3 September 2025 | Announced programme terms; the current campaign page says applications are closed and Phase 2 voting has ended, but no claim of verified winners, disbursement or commercialisation |
| NBS real GDP growth | Q1 2026 | 3.89% year-on-year official national-accounts estimate |\n| ISN Nigerian Innovation Hub Assessment | Summary released 22 May 2026; survey period not stated | 190+ active hubs surveyed/covered from 250+ active and partially active spaces; 68.35% with fewer than 10 staff; 90% offer structured training |

## Department snapshot coverage and current gaps

The current snapshot bundle contains fourteen dated records. Its department coverage is intentionally uneven and must not be presented as a complete four-department dataset.

| Department | Curated snapshot evidence in this release candidate | What remains limited or unintegrated |
|---|---|---|
| Education and Capacity Building | FME 2024/2025 national and Kaduna State school-census dashboard snapshots; NITDA DL4ALL, NASENI InnovateNaija and ISN assessment records are cross-linked | FME national school reporting is 53.7%; the Kaduna record is state-level, not Kaduna South; no current local school-level attendance or learning outcome series |
| Department of Health and Well-being | WHO Nigeria profile indicators; five dated NPHCDA PHC programme snapshot cards covering facility/infrastructure progress, BHCPF, workforce, multi-state support and combined Kaduna–Yobe recruitment; existing national World Bank pilot indicator | NPHCDA figures are agency-reported 2025 programme outputs, not current facility functionality; combined Kaduna–Yobe recruitment is not a Kaduna-only total; NDHS, HFR and Kaduna health sources still require validated ingestion and geography checks; no current Kaduna South facility staffing or medicine series |
| Software and Technology | NITDA DL4ALL, NASENI InnovateNaija and ISN hub assessment snapshots; selected ISN-listed hub directory | Programme-reported reach is not national digital-literacy prevalence; the directory is a selected listing, not a complete or independently verified hub census; no official Kaduna South digital-access or software-employment measure |
| Civic Department | NIMC October 2025 national and Kaduna State enrolment snapshot; existing INEC evidence sources remain separately registered | NIMC enrolment is not a population coverage measure; INEC registration, PVC collection and turnout remain separate measures; no final validated post-CVR national register or Kaduna South civic-participation estimate |

**Cross-department national context:** NBS Q1 2026 GDP and the World Bank Nigeria Development Update are national macroeconomic context, not department performance measures or state/LGA estimates.

The API accepts the DOC stable department identifiers `education`, `health`, `digital-systems` and `civic-affairs`. Existing Observatory route identifiers remain supported as compatibility aliases. The API response exposes the stable identifiers so DOC, Brain and other consumers do not need to adopt the Observatory's historical route slugs.

## Interpretation safeguards

- WHO values remain labelled statistical estimates and retain uncertainty intervals. WHO warns that Nigerian death-registration data are unavailable or unusable for cause-of-death analysis.
- NIMC enrolment is not a census, population coverage rate, active identity count or proof of service access. Kaduna State values are not Kaduna South values.
- NITDA's 5.57% is progress against the programme's 50-million target; it is not the national digital-literacy rate. Training counts do not prove durable competence or employment outcomes.
- NASENI programme announcements do not prove that awards were selected, funds were disbursed, products were commercialised or jobs were created.
- NBS GDP is a national quarterly estimate. The base year, release vintage and calculation method must be preserved. No local growth rate is inferred.
- IMF WEO is registered as a source but no projection is displayed as an observed fact. If imported later, historical observations, IMF staff estimates and projections must be separated by vintage and status.
- NBS CPI and food-price collections are registered, but no numeric values are published from them until the original tables are extracted, checked and stored with exact reference month, geography, unit and methodology.

## Department connections

- **Department of Health and Well-being:** WHO profile and national estimates; existing NDHS, NPHCDA, HFR and Kaduna health source records remain separate.
- **Software and Technology:** NITDA DL4ALL operational dashboard, NDLF competency framework, NASENI innovation programme, ISN hub assessment and selected ISN directory listings.\n- **Education and Capacity Building:** UBEC and World Bank evidence plus NITDA training reach, ISN hub training/mentorship findings and NBTI incubation sources.
- **Civic Department:** INEC electoral evidence and NIMC identity-registration administration.
- **Education & Capacity Building:** existing UBEC and World Bank evidence; NITDA's digital-literacy programme is cross-linked through its source record and interpretation notes.
- **National overview:** NBS GDP context appears outside the four operational department workspaces.

## What is not yet integrated

- WHO's live OData/API ingestion. The legacy GHO API is being retired; a new World Health Data Hub contract must be verified before implementation.
- IMF SDMX/DataMapper ingestion. The WEO source is registered; no IMF values are currently ingested.
- NIMC machine-readable/API feed. The October 2025 dashboard is a dated manual snapshot.
- NITDA DL4ALL API feed. The dashboard is currently a dated source snapshot; API partner access must be confirmed before automated ingestion.
- NASENI grant award, selection, disbursement and innovation-outcome dataset.
- NBS CPI and food-price table extraction into validated indicator records.
- Current Kaduna South facility, school and digital-access measures.\n- The full ISN assessment methodology and underlying respondent-level tables; the current product uses only the public launch summary.\n- A complete, independently verified national hub census or live hub-activity feed; the visible hub directory is a selected subset of ISN listings.

**A source listed in the registry is not an integrated dataset. A dashboard counter is not independent verification. A published target is not an achieved result.** The product displays those distinctions directly rather than hiding them in a long methodology essay.


## NPHCDA primary healthcare programme snapshots — 11 November 2026

Five additional health records are exposed through the existing read-only snapshot contract, using the already registered NPHCDA source `nphcda-phc-progress-2025` and its official progress page dated 15 September 2025.

The records separate:
- National PHC revitalisation and infrastructure progress.
- BHCPF disbursement and facility upgrades.
- Workforce deployment and training.
- Multi-state commodity and cold-chain support.
- Combined Kaduna State and Yobe State recruitment figures.

**Interpretation controls**
- All figures are historical agency-reported programme outputs, not independently audited outcomes or current 2026 status.
- Facilities at various stages of revitalisation are not counted as completed.
- The first-half 2025 BHCPF disbursement is included in the wider 2023–mid-2025 total; it must not be added to that total.
- The 10-state maternal/newborn commodity distribution does not name the participating states.
- The Kaduna and Yobe recruitment figures are combined. The source does not provide a state split, LGA breakdown or named-facility deployment list. These values must never be presented as Kaduna State-only totals.
- No observation establishes current staffing, medicine stock, equipment functionality or service availability at a Kaduna South PHC.

The older branch's July 2026 education census and June 2025 NIMC figures were not copied into this release: the current catalogue already contains later source snapshots for those sources. Older WHO observations were also excluded pending reconciliation of differing indicator values and reference periods against the current WHO country profile.
