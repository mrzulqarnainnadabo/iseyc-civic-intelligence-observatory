# Evidence registry contract v1

## Purpose

Separate **dataset metadata**, **observations**, **indicators**, and **interpretations** so the Observatory can host multiple evidence streams without treating Civic Mandate submissions as national statistics.

## Layers

1. **Dataset** — publisher, URL, licence, coverage, method, limitations, last checked.
2. **Observation** — a dated value for an indicator at a geography, with source dataset id.
3. **Indicator** — definition, unit, measurement type (measured | estimated | modelled | derived), methodology.
4. **Interpretation** — human-reviewed narrative; never auto-promoted from a model alone.

## Civic Mandate

Published Mandate records are a **community evidence stream** (`origin: civic-mandate`). They are not indicator observations.

## Pilot

`data/indicators/nga-pilot-indicators.json` defines three national World Bank WDI series with live API retrieval. Values are attributed to the World Bank, not ISEYC.
