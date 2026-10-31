# System architecture — ISEYC Civic Intelligence (v1)

## Principle

Two independently deployable applications share **versioned contracts**, not a monorepo or a third production service (yet).

```
Civic Mandate Nigeria          Civic Intelligence Observatory         Civic Brain
(intake + moderation)          (coverage + sources + briefs UI)       (evidence interpretation)
        |                                    |                               |
        +-------- PublicMandateRecord.v1 ----+------- published-only --------+
        |                                    |                               |
        +-------- geographic / duty codes ---+-------------------------------+
```

Observatory is the public evidence and accountability layer. It must not gain private submitter data because products are connected.

## Non-negotiables

- Non-partisan; no rankings or endorsements
- Published-only public surfaces
- Referral ≠ acknowledgement ≠ implementation ≠ independent verification
- AI analysis is not independent verification
- Live adapters disabled by default until governance approval

## Stage 1 vs Stage 2

Stage 1: Observatory standalone, synthetic/demo data, verified validators and build.  
Stage 2: Governed read-only integration with Mandate published records and Brain contracts.
