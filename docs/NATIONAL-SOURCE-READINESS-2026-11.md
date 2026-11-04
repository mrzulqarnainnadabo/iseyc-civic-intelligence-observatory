# National source readiness and product utility — 4 November 2026

## Executive decision

ISEYC has a credible institutional source foundation, but it does not yet have a complete, harmonised or continuously refreshed national evidence base. The source registry is a discovery and assessment catalogue; a listed source is not an integrated dataset.

The next stage is to turn the catalogue into a governed acquisition and evidence system. Prioritise usable datasets and clear citizen questions over the number of institutions listed.

**Current implementation facts**
- The Observatory has a source registry and three national World Bank WDI indicator pilots.
- Civic Mandate CommunityRecords and Community Observations are separate streams.
- The Kaduna PHC pilot has source-readiness work but no imported HEFA facility observations.
- A structured 2023 INEC voter-register/PVC table has now been transcribed for all 36 states and the FCT. Its arithmetic exceptions are explicitly retained.
- No national current 2026 voter-register total after the scheduled CVR conclusion has yet been confirmed in the sources reviewed here.
- No complete national school-level, PHC facility-level, procurement-award or government project-completion dataset has yet been established in the Observatory.

## Source-readiness vocabulary

Use a readiness state for each dataset, not one score for an entire institution:

1. **Public structured** — public API or machine-readable download, documented schema and reuse conditions.
2. **Public document** — official report/PDF/HTML table; manual extraction and validation required.
3. **Authenticated access** — official API or portal requires approved credentials.
4. **Request required** — source owner must approve access or supply an export.
5. **Catalogue only** — source page describes or indexes data, but no usable observations have been acquired.
6. **Not confirmed** — access, coverage, freshness or publication route has not been verified.

Readiness is not a measure of institutional credibility. An authoritative institution may have difficult data access; an accessible file may still be stale or methodologically weak.

## Priority source assessment

### Electoral participation — INEC

**Useful products:** registered voters by state/LGA/ward; new CVR registrations; PVCs printed, distributed and collected; polling-unit counts and locations; accredited voters and turnout; election results.

**Confirmed evidence reviewed**
- INEC's 2023 General Election report states a validated register of 93,469,008 voters.
- INEC's 2023 nationwide PVC summary reports 87,209,007 collected PVCs (93.3%) as at 5 February 2023.
- The 2023 state summary reports Kaduna at 4,335,208 registered voters and 4,164,473 collected PVCs.
- INEC's PVC statistics page publishes certified polling-unit breakdowns for selected off-cycle governorship elections, including the 2026 Osun election, with 1,518,485 collected PVCs across 30 LGAs.
- INEC's February 2026 Chairman's remarks state that 2,782,587 eligible voters were registered in CVR phase one (18 August–10 December 2025). A separate INEC press release reports 2,782,589. Preserve this two-person source discrepancy pending clarification.
- The same February statement gave a scheduled CVR conclusion of 30 August 2026. A schedule is not proof of completion; a final consolidated post-exercise register and state/LGA tables are still required.

**Important source-quality finding — 2023 PVC arithmetic**
The INEC 2023 PDF's registered-voter and collected-PVC state rows sum to their printed national totals. Its uncollected-PVC data do not reconcile:
- Sum of state-row uncollected values: 6,259,231.
- Printed national uncollected total: 6,259,229.
- Registered minus collected: 6,260,001.
- 16 state rows have an uncollected count that differs from registered minus collected.

The Observatory's structured file stores the reported and calculated values separately. It must not silently replace the published values or display the uncollected total as settled fact. The registered-voter and collected-PVC totals are suitable for a dated historical explainer; the uncollected-PVC values need an explicit arithmetic warning.

**Acquisition:** request final CVR results, current validated register, state/LGA/ward tables, PVC print/collection definitions, and historical revisions from INEC. Build a versioned adapter only after official downloadable data and definitions are stable.

### Basic education — UBEC, Federal Ministry of Education and SUBEBs

**Useful products:** number of schools by type/ownership; enrolment; teachers by cadre and qualification; classrooms and WASH; school attendance; learning assessment; out-of-school estimates with explicit age definition; intervention funding and project status.

**Confirmed evidence reviewed**
- UBEC publishes a Reports index listing a 2024 Annual Report, a Q4 2025 Key Performance Report, the 2022/2023 National Personnel Audit (NPA), and other reports.
- UBEC's Digest of Statistics page lists 2022 public, private and combined school digests and earlier 2019/2020 volumes.
- The 2022/2023 NPA report describes a census-style exercise covering learners and personnel in public and private basic education schools, SUBEBs and LGEAs in all 36 states and the FCT; school coordinates were collected.
- UBEC state pages displayed zero-valued headline counters in this review. Those web counters must not be interpreted as zero enrolment, zero schools or zero teachers.

**Limitations:** the 2022/2023 audit is historical, not a current 2026 count. Reports are not yet a harmonised, versioned school-level feed. Administrative returns can vary in completeness. Enrolment is not attendance; attendance is not learning; school presence is not a functioning school.

**Acquisition:** obtain machine-readable tables or approved exports from UBEC's EMIS / Planning, Research and Statistics department and each SUBEB. Reconcile national definitions, private/public coverage, school identifiers, reference session and missing returns. Inspect the 2024 Annual Report and Q4 2025 KPI report table by table before creating indicators.

### Socioeconomic statistics — NBS

**Useful products:** labour force and employment; household living standards; poverty and inequality; inflation and food prices; trade; GDP; debt; FAAC and IGR; electricity customer and revenue statistics; household surveys.

The NBS Microdata Catalog was reviewed on 4 November 2026. Its landing page displayed 107 catalogue entries, including 79 microdata and 28 documents. The catalogue is a discovery index, not one dataset.

**Limitations:** survey-level sampling design governs what can be said at national, state or LGA level. Preserve weights, strata, clusters, confidence intervals, non-response, definitions and fieldwork dates. Microdata may require registration and restricted-use approval. Never turn a national estimate into a Kaduna estimate.

**Acquisition:** build a dataset-by-dataset register, beginning with NLFS, General Household Survey, MICS/NICS, price watches, FAAC, IGR, debt and electricity reports. Each selected study needs a metadata sheet and an indicator extraction test.

### Macroeconomy and financial system — CBN

**Useful products:** exchange rates, inflation-related series, reserves, money and credit, interest rates, government securities, GDP and financial expectations surveys.

The CBN Data & Statistics index links daily and monthly series, statistical databases, annual/quarterly bulletins, PMI and expectations surveys.

**Limitations:** series differ in frequency, definitions and revision policy. Most are national macroeconomic series and cannot directly explain household experience or state-level service delivery.

**Acquisition:** use official series with retrieval dates and vintage tracking. Do not present CBN national data as local outcome measures.

### Population and vital statistics — NPC

NPC's official FAQ and history state that Nigeria's last completed Population and Housing Census was in 2006. The 2023 census was postponed. A 2025 State House release described renewed planning and a committee, not a completed census.

**Useful products:** historical census geography and counts, population projections with base-year/method metadata, birth registration, death registration and demographic publications.

**Limitations:** 2006 counts are historical. Projections are estimates, not a new census. Vital registration coverage must be assessed before deriving rates. Do not use population projections as a precise LGA denominator without explaining the method and uncertainty.

**Acquisition:** request the official current projection series, methods, geographic tables, vital-registration completeness and any approved census-preparation datasets. Keep census, projection and registration datasets separate.

### Public finance — Budget Office, state budget offices and OAGF

**Useful products:** appropriations, budget versions, releases, cash expenditure, quarterly implementation, MDA/sector allocation, FAAC distributions, state budgets and audited accounts.

The Budget Office's quarterly implementation index lists federal reports across multiple years. The 2026 Q1 Budget Implementation Report was listed as published on 2 November 2026.

**Limitations:** a federal report does not describe state/local spending. Appropriation is not release; release is not cash expenditure; expenditure is not verified delivery. PDF availability is not transaction-level coverage.

**Acquisition:** start with federal Q1 2026 and the most recent complete annual report; extract tables with period, budget version, MDA, economic/functional classification and accounting basis. Add state-level sources one state at a time. Reconcile budget figures against audited accounts and OAGF releases where possible.

### Procurement and projects — BPP / NOCOPO

BPP's Open Contracting Disclosure Guideline identifies NOCOPO as the primary web-based publication route and describes procuring-entity upload with BPP validation. A 2025 BPP circular directs procuring entities to submit procurement records and plans and to publish contract awards monthly.

**Useful products:** procurement plans, tenders, bid/award details, contractor, contract amount, dates, procuring entity and project location.

**Limitations:** public API/bulk export, historical completeness and subnational coverage were not confirmed. Disclosure completeness depends on procuring entities. Contract award does not prove payment, physical completion, quality or service delivery.

**Acquisition:** request public OCDS/API/export access, schema and coverage metadata from BPP. Cross-link procurement award → payment evidence → site verification → commissioning/operational status. Keep each stage separate.

### Health — HFR, NPHCDA, state health agencies and HEFA

The Federal Ministry of Health's HFR developer documentation describes a read-only GET API but requires an approved API key. NPHCDA has a data requisition portal. Kaduna HEFA's public portal lists a facility directory, 2018/2025 census material, analytics and GIS, but its download portal presents a staff sign-in. No unauthenticated public HEFA API or bulk export was confirmed.

**Useful products:** registered facility directory, facility readiness, staffing, medicines, service availability, patient throughput and supportive supervision.

**Limitations:** registry presence is not functionality; functionality is not quality; staffing plan is not deployed staff; medicine procurement is not stock at the facility. Dataset dates and facility identifiers must be reconciled.

**Acquisition:** obtain approved HFR credentials and data-use terms, HEFA data dictionary/export route and NPHCDA aggregate datasets. Kaduna remains the first facility-level pilot because the source-access work is already documented, but no facility observations are to be claimed until acquired.

## National evidence model

The shared evidence layer should distinguish the following object classes:

1. **Source** — publisher, authority, contact, terms, access route and limitations.
2. **Dataset** — version, schema, coverage, collection method, update frequency and reference period.
3. **Observation** — indicator/value/unit/geography/reference period/denominator.
4. **Document** — policy, budget, speech, contract, report, audit or official response.
5. **Community record** — a published demand or a separately submitted observation; never a substitute for administrative statistics.
6. **Institution** — verified tier and responsibility basis, linked to the legal mandate or official allocation of functions.
7. **Response / commitment** — who said what, when, in which document, and whether it is an announcement, approved commitment, funded action, implementation evidence or verified outcome.
8. **Retrieval receipt** — source URL, retrieval timestamp, HTTP/source version, query/filter, file hash, parser version and row counts.
9. **Correction / review** — reviewer, reason, previous value, corrected value and publication history.

Every observation must retain: source ID, source document/URL, exact table/page or API path, publisher date, retrieval time, reference period, geography code, indicator definition, unit, numerator/denominator, method, revision/vintage, missingness, transformation and caveats.

## Product design — make the evidence useful

### 1. Observatory: answer a real question first

Do not lead with a wall of charts. Organise the public experience around useful questions:
- **People and participation:** who is registered, who collected a PVC, where the gaps are, and when the figures were measured.
- **Schools and learning:** how many schools and learners are recorded, where the teachers are, and what the learning evidence says.
- **Health services:** which facilities are registered, what readiness data exist, and which measures are unavailable.
- **Public money:** what was approved, released, spent and independently evidenced.
- **Projects and commitments:** what was promised, funded, contracted, implemented and verified.
- **Community voice:** what citizens report and demand, separated from representative statistics.

Each topic page should show the latest usable observation, its reference date, geography, source, method, what it does not prove, and the next evidence needed. Let users move from national → state → LGA → facility only when the source actually supports that level.

### 2. Civic Brain: a disciplined explainer, not an oracle

For every research answer, use this response structure:
1. What is happening?
2. Where is it happening?
3. Who is represented in the evidence?
4. What do we know?
5. What does the evidence suggest?
6. What might explain it — and what is only a hypothesis?
7. Which institution has responsibility, and what legal/administrative source establishes that?
8. What was announced or committed?
9. What has actually been verified?
10. What remains unknown?
11. What evidence or action should happen next?
12. Which sources support each finding?

Civic Brain must be able to say "the available evidence cannot answer this yet." It should never fill missing LGA data with a national average or convert correlation into causation. It must distinguish source fact, derived calculation, interpretation and hypothesis.

### 3. Civic Intelligence Desk: research and editorial control

Required workflow:
- question intake and scope;
- source search and source suitability assessment;
- retrieval and evidence capture;
- geography and period alignment;
- data quality checks and reconciliation;
- institutional responsibility review;
- draft analysis;
- independent second review for high-impact claims;
- right-of-reply / institutional response request where appropriate;
- publication approval;
- correction and version history.

No AI output should auto-publish. No source owner, donor or political actor should have the ability to edit ISEYC's analysis or suppress a documented finding.

### 4. Citizen-facing civic education

Create short, low-bandwidth explainers that answer one question at a time:
- What does a state government control?
- What is a local government responsible for?
- How does the budget cycle work?
- What is the difference between appropriation, release and expenditure?
- How does a public procurement award work?
- How do citizens register, verify their voter details or locate a polling unit?
- How can a citizen submit a report and what happens after submission?

Use plain English first, then progressively Hausa, Yoruba, Igbo and Nigerian Pidgin. Provide downloadable text, audio and printable one-page materials. Local-language versions must be reviewed by fluent humans; do not treat machine translation as final.

## Broadcast and publication standard

ISEYC should publish national civic intelligence briefings, not claim to be a real-time national statistics authority.

A national briefing may be published only when:
- every numerical claim has a traceable primary source or an explicitly labelled secondary source;
- reference period and geography are visible;
- the denominator and unit are clear;
- survey representativeness and administrative coverage are stated;
- arithmetic and cross-source discrepancies are disclosed;
- national claims are not inferred from selected states;
- the institution's response is included where material or the request for response is documented;
- a second reviewer has checked high-impact figures;
- a correction route and publication version are visible.

Where evidence is only available for some states, say exactly which states. Do not title a partial sample as a national picture. "No data located" is not "no service", "no activity" or "no problem".

## Institutional independence and funding firewall

- Publish the methodology, source registry, correction policy and funding disclosure.
- Separate funding/partnership management from research and publication approval.
- Partners may provide data, technical support, access or training; they may not buy a conclusion, approve findings about themselves or veto publication.
- Record conflicts of interest and recuse affected reviewers.
- Maintain immutable source snapshots and a public correction log.
- Provide institutions a factual right of reply, not editorial control.
- Never accept payment for favourable coverage, rankings, scores or suppression of evidence.

## Product usefulness measures

Measure whether people can use the system, not how much content it publishes:
- task completion: citizen finds a relevant figure, source or responsible institution;
- evidence comprehension: user can correctly identify the reference date, geography and limitation;
- Civic Brief downloads, shares and citations;
- research questions answered with adequate sources and clear unresolved gaps;
- user-rated clarity and usefulness after reading;
- return use by researchers, journalists, CSOs and institutions;
- low-bandwidth load success, time-to-first-content and offline/download usage;
- correction rate, correction time and source freshness;
- percentage of public claims with complete provenance;
- institutional responses received and independently evidenced follow-up.

Do not use page views, submitted report counts or partner logos as proof of public value.

## Immediate implementation sequence

### Gate 1 — source foundation
- Expand and maintain the source registry with dataset-level access and freshness states.
- Keep source catalogue records separate from ingested datasets.
- Add automated source contract and arithmetic checks.
- Keep all source data snapshots versioned and reproducible.

### Gate 2 — first national civic data products
1. INEC voter register/PVC historical dataset (already transcribed; arithmetic warning retained), then final 2026 CVR release when officially available.
2. UBEC 2022/2023 NPA and newest annual/KPI report, after table-level validation.
3. NBS Microdata Catalog selected datasets with correct sampling metadata.
4. Federal budget implementation report and procurement records with lifecycle stages.
5. CBN national macro series and NPC population estimates with explicit vintage.

### Gate 3 — state/local service evidence
- Complete the Kaduna PHC source-access request (HFR, HEFA, NPHCDA, KSPHCB).
- Obtain current SUBEB school records and validate school identifiers.
- Add water, electricity and transport service sources only after confirming actual downloadable data and geographic level.
- Expand to another state only after the same source and coverage checklist passes.

### Gate 4 — public utility
- Build question-led topic pages and Civic Brain sourced explanations.
- Build civic education modules and low-bandwidth downloads.
- Establish the Civic Intelligence Desk review and right-of-reply workflow.
- Publish a monthly national evidence bulletin only when its coverage and verification gates are met.

## Decision

The strongest path is not to add dozens of agency names or launch a national dashboard prematurely. It is to deliver a small number of defensible public answers, starting with voter participation, basic education, public finance and Kaduna primary healthcare, then expand by evidence readiness.

**National in ambition. Local in evidence. Transparent about what is not yet known.**
