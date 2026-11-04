# Kaduna HEFA source access review

**Reviewed:** 4 November 2026  
**Purpose:** Establish what the Kaduna Health Facility Analytics platform exposes publicly, what is described by programme partners, and what still requires authorised access.

## What the public portal shows

The HEFA landing page at https://hefa.kdbs.ng/ identifies the platform as Kaduna State's integrated health-facility analytics environment. It lists:
- 2018 / 2025 health facility census material;
- a facility directory;
- analytics and GIS;
- longitudinal study and search-data areas;
- Kaduna Integrated Supportive Supervision (ISS);
- a download centre.

The landing page says the platform combines multiple sources to provide visibility into facility readiness, service throughput, infrastructure, human resources, medicines and vaccines, supply chains, financing, service availability and utilisation, and geographic access.

This confirms the platform and its stated data domains. It does not, by itself, confirm that each dataset can be downloaded by the public or that all described datasets are current and complete.

## What partner publications add

### 2025 census dissemination

Natview Foundation's 3 December 2025 report on the Kaduna 2025 Health Facility Census dissemination workshop says preliminary census findings were presented and that the updated HEFA dashboard compared the 2018 and 2025 assessments. It describes views of facility status, service availability and reporting trends.

Source: https://natviewfoundation.org/news-center/nfti-participates-in-the-2025-health-facility-census-dissemination-worksh/

**Interpretation:** This is a partner account of a dissemination workshop, not the census microdata, final report, data dictionary or validation record. Treat the findings as preliminary until the underlying official census materials and definitions are obtained.

### Registry update cycle and functionality fields

Natview Foundation's 23 June 2026 report on HEFA registry training says the platform's monthly update cycle is triggered on the 25th, and describes facility records for Centres of Excellence, PHCs and health clinics. It also says the platform includes functionality and security status fields and consolidates records from other health information systems.

Source: https://natviewfoundation.org/news-center/nfti-and-kdbs-support-kaduna-state-to-strengthen-health-facility-registry-management/

**Interpretation:** These are descriptions by a programme partner. ISEYC has not independently audited the update cycle, source systems, field definitions, facility coverage or status-validation procedures.

## Access check

The HEFA download portal at https://download.hefa.kdbs.ng/login presents a staff sign-in page.

This review did not confirm:
- an unauthenticated public API;
- public bulk data export;
- a public download route for the 2025 census dataset;
- a complete data dictionary;
- dataset-specific licensing and reuse terms;
- facility-level data freshness and validation history.

Do not scrape staff-only screens, bypass authentication or attempt to obtain credentials through unofficial routes.

## Evidence acquisition request

Request the following from Kaduna State Bureau of Statistics (KDBS) and the Ministry of Health through an authorised institutional channel:

1. The final 2025 Health Facility Census report, data dictionary and approved public tables.
2. A public, de-identified facility master list with stable facility IDs, state, LGA, ward, classification, ownership and last-updated date.
3. Definitions and permitted use for functionality and security status fields.
4. Facility-level readiness, workforce, medicine/vaccine, infrastructure and service-availability datasets, with reference periods and missingness.
5. Update-cycle documentation, data steward roles, validation and correction process.
6. A read-only API or approved export route, access terms and attribution/licensing conditions.
7. Clarification on how HEFA reconciles facility IDs and records with the National Health Facility Registry and other source systems.

## Rules for the Observatory

- Keep the HEFA source registry entry as a source catalogue record, not an ingested dataset.
- Do not label a facility operational solely because it appears in the directory.
- Do not infer service quality from a functionality status field.
- Do not compare LGAs until coverage, reference dates, definitions and missingness are known.
- Preserve the 2018 and 2025 census vintages separately.
- Label preliminary workshop findings as preliminary and secondary-source descriptions.
- Do not construct a composite facility score until indicators, weights and validation methods are agreed and published.
- Every imported observation must carry source ID, original facility ID, reference period, retrieval time, geographic level, measure definition and quality flags.

## Decision

HEFA is the preferred route for the first Kaduna PHC facility-level evidence pilot because it is described as a state-level integration of facility registry, census, service and supervision data. The correct next step is formal source access and a data dictionary — not scraping, guessed endpoints or synthetic facility records.
