# Evidence Gateway v1

## Purpose

Server-side, allowlisted retrieval for official indicator pilots. The browser must not call arbitrary upstream URLs.

## Endpoints

- `GET /api/evidence/observations?indicatorId=<pilot-id>`
- `GET /api/evidence/observations?catalog=1`

## Allowlist

- Host: `api.worldbank.org` only
- Country path: `NGA` only
- Indicator IDs: `wb-nga-sp-pop-totl`, `wb-nga-se-prm-enrr`, `wb-nga-sh-dyn-mort`

## Response layers

1. **Indicator metadata** — definition, unit, limitations, attribution
2. **Observations** — reference period, value, geoCode `NGA`, geoLevel `national`
3. **Retrieval receipt** — hash, status, outcome, count (ephemeral — not durable DB)
4. **Never** — human interpretations mixed into observations

## Cache

In-memory process cache, 6 hours. CDN header: `s-maxage=3600`.

## Persistence status

**Ephemeral.** Receipts are returned in the JSON response only. No Supabase/database project is attached. Durable storage is a later milestone.

## Geographic integrity

All pilot observations are **national**. UI must not present them as state scores. State pages show community Mandate stream separately.

## Failure policy

Upstream failure → empty observations + error classification. **No synthetic fallback.**

## Local / deploy note

Vercel Serverless loads `/api/*`. SPA rewrites exclude `api/`. Until the project is deployed, the client may report `GATEWAY_UNREACHABLE` in pure static preview.
