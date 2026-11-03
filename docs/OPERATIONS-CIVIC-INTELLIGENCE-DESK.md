# ISEYC Civic Intelligence Desk — lightweight operations

Internal workflow for human review. Not a public product surface.

## States (moderation, not delivery)

`Received` → `Under Review` → `Published` | `Flagged` | `Rejected` → `Corrected` when needed.

These states are **not** implementation or independent-verification statuses.

## Desk checklist

1. **Submission review** — concrete public-service demand vs slogan/campaign only.
2. **Privacy** — no private contacts, demographics or device signals on public surfaces.
3. **Duplicates** — same place + duty + similar wording.
4. **Publication** — only after human decision; Mandate remains system of record.
5. **Evidence research** — attach allowlisted public sources; record limitations.
6. **Interpretation** — draft may use AI; claims must cite server-fetched sources.
7. **Brief approval** — named reviewer, date, evidence refs, limitations, version/correction trail.
8. **Corrections** — preserve history; do not silently rewrite published meaning.

## Pilot focus (90 days)

Primary healthcare service delivery in **Kaduna State** (`src/pilot/kaduna-phc.ts`).

Expand geography only after the phone test passes: find published concerns → inspect evidence → know limits → list next checks.
