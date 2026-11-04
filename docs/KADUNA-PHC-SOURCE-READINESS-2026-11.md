# Kaduna PHC pilot — source readiness assessment

**Reviewed:** 4 November 2026  
**Scope:** Kaduna State primary healthcare workforce, facility registry, readiness and service-delivery evidence  
**Status:** Source discovery and metadata verification only. No new Kaduna facility-level observations have been ingested.

## Decision

Proceed with a narrow Kaduna PHC evidence pilot, but do not build a facility scorecard or publish a statewide readiness rate yet. The strongest next data path is to request approved read access to the National Health Facility Registry (HFR) API and to establish a documented data-sharing/export route for Kaduna's Health Facility Analytics (HEFA) platform. Use the Kaduna State Primary Health Care Board's March 2025 recruitment plan as a dated administrative baseline, not as a current staffing count.

## Sources checked

### 1. Nigeria Health Facility Registry — API access path

- Publisher: Federal Ministry of Health and Social Welfare.
- Documentation: https://hfr.fmohconnect.gov.ng/developers
- REST base: `https://backend.hfr.fmohconnect.gov.ng/api/v1`
- FHIR R4 base: `https://backend.hfr.fmohconnect.gov.ng/api/fhir`
- The documentation describes a read-only GET API for facilities across all 36 states and the FCT.
- Requests require an approved API key in the `X-API-Key` header. The facility endpoint documented in the quick start is `GET /facilities`.
- Contact shown in the documentation: `hfr@health.gov.ng`.

**Integration decision:** Do not attempt anonymous API ingestion, scrape the portal, or store credentials in the repository. Request an API key and its data-use terms first. When approved, inspect the actual response schema, pagination, facility identifiers, state/LGA fields, ownership, validation dates and status definitions before designing an adapter.

**Interpretation boundary:** A facility's presence in a registry does not establish that it is currently functional, staffed, supplied or delivering services.

### 2. Kaduna Health Facility Analytics (HEFA)

- Portal: https://hefa.kdbs.ng/
- Kaduna State Government e-services lists the Ministry of Health facility analytics dashboard.
- The portal describes integration of health facility readiness, service throughput, facility censuses, longitudinal studies, household and telepolling surveys, supportive supervision, infrastructure, human resources, medicines, vaccines, supply chains and healthcare financing.

**What is confirmed:** The public portal lists 2018/2025 census material, a facility directory, analytics, GIS, ISS and a download centre. Partner publications describe a 2025 census dissemination exercise, dashboard comparisons with 2018, monthly facility record updates on the 25th, and functionality/security fields.

**What remains unconfirmed:** The download portal presents a staff sign-in page. No unauthenticated public API or public bulk export, final census dataset, complete data dictionary, licensing terms or facility-level validation history has been confirmed. The monthly update cadence and field definitions are partner-described, not independently audited.

**Integration decision:** Treat HEFA as the preferred Kaduna PHC facility-level source-access target, not as an already ingested dataset. Request an approved export/API and data dictionary through KDBS / Ministry of Health. See [HEFA access review](./HEFA-ACCESS-REVIEW-2026-11.md) for the detailed source assessment.

### 3. Kaduna State Primary Health Care Board — workforce baseline

- Document: *Access & Equity: Multiyear Recruitment and Deployment Plan*, March 2025.
- Official document: https://kdsg.gov.ng/download/2977/policy-and-plans/22470/ksphcb_recruitment_and_deployment_plan-2025
- The plan states an existing workforce of **5,240**, a required workforce of **14,240**, and a gap of **9,000**. It describes the 5,240 as 37% of required workforce.
- Its table separates facility cadres (5,126 available; 14,076 required; gap 8,950) from headquarters and zonal office staff (114 available; 164 required; gap 50).
- It sets out a five-year recruitment plan for 2025–2029, with a stated target of 1,800 staff per year and facility-by-facility deployment.
- The plan says quarterly monitoring and evaluation feedback should be sent to management.

**Permitted use:** A dated, attributed administrative planning baseline and a source for the Board's intended recruitment/deployment plan.

**Not permitted:** Treating 5,240 as the current 2026 headcount; treating the recruitment plan as evidence that recruitment or deployment occurred; or presenting 37% as a current facility functionality or service-quality rate.

### 4. NPHCDA Data Requisition Portal

- Portal: https://portal.nphcda.gov.ng/
- The portal is presented as a route to request and manage access to NPHCDA primary healthcare datasets.

**Integration decision:** This is an access-request route, not a public dataset. Request only the specific aggregate datasets needed for the pilot and document approval, permitted purpose, geographic resolution, reporting period and disclosure restrictions.

## Data conflict to preserve, not average away

A separate 2026 Health Systems Development Fund publication reports approximately **4,654** Kaduna PHC personnel in 2024, citing administrative records from the Kaduna State Primary Health Care Board: https://hsdf.org.ng/wp-content/uploads/2026/04/Building-the-Frontline-Kaduna-States-Primary-Health-Care-Workforce.pdf

This does not match the **5,240** workforce baseline in the Board's March 2025 plan. The figures have different stated reference dates and may have different workforce scope or counting rules. Do not average them, calculate a trend, or label either as the current count until the underlying definitions and reference dates are reconciled with the Board.

## Next evidence acquisition sequence

1. Request HFR API credentials and written API/data-use terms from the registry.
2. Request HEFA's data dictionary, export/API access route, dataset refresh dates and facility-level coverage.
3. Ask KSPHCB to confirm the reference date and scope of the 5,240 baseline and explain the 2024 figure cited by HSDF.
4. Obtain the 2025–2029 recruitment/deployment progress updates, facility-level deployment evidence and quarterly M&E reports.
5. Obtain approved aggregated facility-readiness, workforce, medicines and service-throughput observations with clear dates and facility identifiers.
6. Only then build a facility-level evidence adapter. Preserve source values, missingness, reporting period, retrieval receipt and limitations. Do not derive a readiness score until the underlying indicators and weights are independently justified.

## Observatory publication rules for this pilot

- Keep this source-readiness assessment separate from ingested observations.
- Label the 2025 workforce table as a historical administrative plan baseline.
- Preserve the 2024 and 2025 workforce figures as unreconciled source claims.
- Do not infer that upgraded, registered or equipped facilities are operational.
- Do not infer medicine availability from a distribution announcement.
- Do not infer deployment from a recruitment plan.
- Do not publish LGA or facility comparisons until coverage, missingness and definitions are checked.
- Every observation must carry its publisher, source URL, reference period, geographic level, retrieval time, measurement type and limitations.
- Community reports remain separate from official administrative data and cannot be used as prevalence estimates.

## Evidence references

- Federal Ministry of Health — [HFR API documentation](https://hfr.fmohconnect.gov.ng/developers)
- Kaduna State Government — [KSPHCB recruitment and deployment plan (March 2025)](https://kdsg.gov.ng/download/2977/policy-and-plans/22470/ksphcb_recruitment_and_deployment_plan-2025)
- Kaduna State Government — [e-services directory](https://kdsg.gov.ng/e-services/)
- Kaduna HEFA — [Health Facility Analytics portal](https://hefa.kdbs.ng/)
- NPHCDA — [Data Requisition Portal](https://portal.nphcda.gov.ng/)
- Health Systems Development Fund — [Building the Frontline: Kaduna State's Primary Health Care Workforce](https://hsdf.org.ng/wp-content/uploads/2026/04/Building-the-Frontline-Kaduna-States-Primary-Health-Care-Workforce.pdf)


## HEFA source-access update

A subsequent review of the public HEFA portal and partner publications clarified the available public-facing modules and described update cycle. This strengthens the case for formal data access, but does not change the ingestion status: no HEFA facility-level observations have been imported into the Observatory.
