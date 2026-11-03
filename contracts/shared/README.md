# Shared civic evidence contracts (v0.1)

**Canonical home (interim):** this repository under `contracts/shared/`.  
Mandate and Brain should import or mirror these files; do not redefine conflicting shapes.

Version: **0.1.0** — contract definitions only. Runtime enforcement lives in each product.

See also:

- `docs/ARCHITECTURE-MAP-THREE-PRODUCTS.md`
- `contracts/evidence/observation.v1.schema.json` (gateway observations)
- `contracts/evidence/retrieval-receipt.v1.schema.json`
- Observatory Stage 2 Mandate DTO under `contracts/stage2/`

## Entity list

1. CommunityRecord  
2. EvidenceSource  
3. Dataset  
4. Indicator  
5. IndicatorObservation  
6. InstitutionalResponsibility  
7. InstitutionalCommitment  
8. ResponseRecord  
9. IntelligenceBrief  
10. RetrievalReceipt  

## Status vocabulary (cross-product)

| Field | Allowed (public) |
|-------|------------------|
| community publication | `published` only on public APIs |
| verification | `unverified` \| `partially-verified` \| `independently-verified` \| `unknown` |
| geoLevel | `national` \| `state` \| `lga` \| `ward` \| `facility` \| `other` |
| brief publication | `draft` \| `human-review` \| `published` \| `withdrawn` |

AI output defaults to **`draft`**. Never auto-promote to `published`.
