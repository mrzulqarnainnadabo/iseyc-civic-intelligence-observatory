# ISEYC Civic Intelligence Observatory (prototype v0.2)

A standalone, integration-ready prototype of ISEYC's national civic intelligence interface for Nigeria. It helps a citizen, researcher, journalist, civil-society organisation or public institution ask: *what is happening, where, to whom, on what evidence, who is responsible, what was announced, what was actually delivered and independently verified, what is unknown, and what should happen next.*

It is **not** a campaign tool, poll, ranking, candidate comparison or chatbot.

> **Demonstration build.** The source registry (26 entries) and the state map are real project data. All civic records, evidence items and institution links are **synthetic** and say nothing about any real place. The UI labels them everywhere. The app is **not connected** to the live Civic Mandate or Civic Brain deployments and does not modify them.

## Six experiences

| Route | Experience | What it does |
|---|---|---|
| `#/` | National overview | Nine questions as navigation, evidence legend, real registry coverage and gaps, demonstration lifecycle funnel |
| `#/issues` | Issues and sector explorer | Filter published demands by sector, state, text; see registered sources for the sector |
| `#/geography` | Geographic explorer | Accessible state map with table alternative; sub-national sources for the selected state |
| `#/evidence` | Evidence library | Real source registry (filter, expand limitations, CSV export) and synthetic evidence items with detail |
| `#/accountability` | Institutional accountability | Six-stage lifecycle per record; claim-strength check; unverified responsibility mappings flagged |
| `#/briefs` | Civic intelligence briefs | Deterministic nine-question brief for a state and sector; copy, download Markdown, print |

## Quick start

Requires Node.js 22.22.2 or later and npm 10 or later.

```bash
npm install
npm run dev          # http://localhost:5173
npm run verify       # registry check, type-check, tests, production build
npm run build && npm run preview
```

Routing uses the URL hash. Review states: `?demo=empty`, `?demo=error` or `?demo=slow` before the hash.

## Ecosystem

| Product | Responsibility |
|---------|----------------|
| [Civic Mandate Nigeria](https://github.com/mrzulqarnainnadabo/2027-street-mandate) | Citizen demand intake + human-reviewed publication |
| [Civic Brain](https://github.com/mrzulqarnainnadabo/iseyc-civic-brain) | Evidence-grounded explanation and routing recommendations |
| **Observatory (this repo)** | Coverage, source registry, accountability integrity, briefs |

## Accountability integrity

- Referral ≠ acknowledgement
- Acknowledgement ≠ implementation
- Announcement ≠ implementation
- Implementation ≠ independently verified delivery
- AI analysis ≠ independent verification

## Data rules

- Published-only public surfaces
- No invented national statistics or government actions
- Live HTTP adapters remain **disabled by default**
- Synthetic data is labelled everywhere

## Related production

- Mandate: https://2027-street-mandate.vercel.app
- Brain: https://iseyc-civic-brain.vercel.app

See `ATTRIBUTIONS.md`, `docs/`, and `schemas/` for contracts, licences and methodology.
