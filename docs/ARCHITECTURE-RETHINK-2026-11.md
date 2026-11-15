# ISEYC digital architecture rethink — November 2026

## The institution, not the module list

ISEYC is one institution with four departments and four digital surfaces.

| Surface | Job | User should never need |
|---------|-----|------------------------|
| **Institutional front door** | Who we are; four departments; how to participate or partner | Ops modules, Notion fields |
| **Observatory** | What evidence establishes; what is missing; department relevance | Database schema literacy |
| **Civic Mandate** | Human-reviewed community voice | Prevalence claims |
| **Civic Brain** | Concise explanation of published evidence and gaps | Authority to invent sources |
| **IDCC (private)** | Attention, meetings, programmes, partners, access | Public visitors |

Security boundary is non-negotiable: public civic intelligence ≠ private operations.

## What was wrong with the previous execution pattern

1. **Feature branches as progress** — calendar view, partnership page, status badge — each real, none composing into a simpler institution.
2. **Navigation that mirrors internal structure** — eight Observatory destinations that describe *our* categories, not *their* questions.
3. **Empty completeness** — sections that look finished without programmes, partners, or minutes.
4. **Duplicate entry** — meetings, actions, partners and departments not connected as one workflow.

## Simplifying decisions

### Observatory primary navigation (implemented on this branch)

**Before:** Overview, Issues, Observations, Places, Evidence, Accountability, Briefs, Departments  
**After:** Understand, Evidence, Places, Departments, Briefs

Secondary routes remain linked from context. Progressive disclosure, not deletion of capability.

### Overview job (implemented on this branch)

Answer in under thirty seconds:

1. What can published evidence establish?
2. Where is coverage stronger or thinner?
3. How should a department use this?

Then show source-attributed snapshots. Gaps are first-class content.

### IDCC home (design rule — not yet fully implemented)

After sign-in, show **attention**, not a module directory:

- What needs me today?
- Next meetings (Lagos time)
- Pending decisions / screening
- My department strip

Deep tools (calendar, partners, readiness) stay one click away — not the landing experience.

### Partnerships (already started; keep thin)

Public: dignified introduction + empty recognition until approved.  
Private: one relationship record per organisation (existing external engagement).  
**Do not build a partner portal** until individual revocable partner identity exists.

### What we deliberately will not build next

- Another dashboard of cards
- Partner portal before identity model
- Fabricated programmes to fill empty registers
- Silent averaging of conflicting sources
- Merging public and private data planes

## Capabilities a mature institution will need (deferred, not discarded)

| Capability | Need now? | Note |
|------------|-----------|------|
| Decision register | Soon | Link resolutions → actions |
| Source freshness monitor | Soon | Observatory already has reconciliation notes |
| Staff onboarding path | Later | After individual sessions |
| Partner portal | Later | After identity + NDAs |
| Publication CMS | Later | Observatory briefs + Mandate are enough |

## Founder configuration still blocking public APIs

Mandate Evidence Vault and Community Observations return `NOTION_DATA_SOURCE_NOT_FOUND_OR_NOT_SHARED`. Code fails closed correctly. Share the data sources with the production integration.

## Branch discipline

Prefer **one coherent product PR at a time** over parallel feature branches. Reuse:

- `feat/institutional-calendar-lagos-week-day`
- `feat/institutional-partnerships-and-front-door`
- `feat/observatory-question-led-overview` (this branch)

Do not merge without explicit approval.
