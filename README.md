# ISEYC Civic Intelligence Observatory

**Institution:** Initiative for Sustainable Evolution for Youth and Community (ISEYC)  
**Role:** Public evidence, geography, source registry, accountability stages, and institutional briefs for Nigeria.

This product is **non-partisan**. It is not a poll, ranking platform, endorsement tool, or campaign site.

## Ecosystem

| Product | Responsibility |
|---------|----------------|
| [Civic Mandate Nigeria](https://github.com/mrzulqarnainnadabo/2027-street-mandate) | Citizen demand intake + human-reviewed publication |
| [Civic Brain](https://github.com/mrzulqarnainnadabo/iseyc-civic-brain) | Evidence-grounded explanation and routing recommendations |
| **Observatory (this repo)** | Coverage, source registry, accountability integrity, briefs |

## Stage 1 status (2026-10-31)

**Repository created.** Seeded with shared **versioned contracts** and architecture docs from the civic-intelligence foundation work.

**Not yet present:** the full application package  
`ISEYC_Civic_Intelligence_Observatory_v0.2.1-candidate.zip`  
(React/Vite/TypeScript app with six experiences, source registry, geo map, synthetic data, validators, tests).

That ZIP was **not available** in the engineering agent environment when this repo was created. Stage 1 verification (typecheck, tests, production build, browser QA) is **blocked** until the candidate package is committed.

### What this seed contains

- `contracts/` — Public Mandate DTO, evidence metadata, civic brief schema, geographic reference notes, institutional responsibility notes, states-ng reference
- `docs/system-architecture.md` — two-product + contracts architecture
- `docs/implementation-status.md` — foundation status

### Accountability integrity (non-negotiable)

- Referral ≠ acknowledgement  
- Acknowledgement ≠ implementation  
- Announcement ≠ implementation  
- Implementation ≠ independently verified delivery  
- AI analysis ≠ independent verification  

### Data rules

- Published-only public surfaces  
- No invented national statistics or government actions  
- Map of 36 states + FCT ≠ national evidence coverage  
- Live HTTP adapters remain **disabled by default** until contracts and governance are approved  

## Next step for founders

1. Upload `ISEYC_Civic_Intelligence_Observatory_v0.2.1-candidate.zip` to chat or push its contents to branch `feat/stage1-candidate-import`.  
2. Engineering agent will run Node ≥ 22.22.2 verification, fix Stage 1 defects, and open a review PR.  
3. **Do not merge to production** until independent acceptance.

## Related production

- Mandate: https://2027-street-mandate.vercel.app  
- Brain: https://iseyc-civic-brain.vercel.app  

## License

Project content for ISEYC institutional use. See individual contract headers for schema versioning.
