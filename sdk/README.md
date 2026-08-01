# PTDT Autonomous SDK (skeleton)

Recommendation: *Build autonomous SDK for all your repos.*

This folder is a **thin cross-repo contract** so sister projects
(`Point-Township-Digital-Twin`, `PTDT-v33`, `godfirst-llm-ml-protocol`)
can share site anchors and hazard API shapes without a monorepo merge.

## Packages (planned)

| Module | Role |
|--------|------|
| `@ptdt/site-constants` | BONEBANK_SITE, FIRM, gauges |
| `@ptdt/hazards` | Multi-hazard engine frames |
| `@ptdt/regulatory` | LOMA/No-Rise draft schemas |

## Current

Copy or import from this repo:

- `src/lib/siteConstants.ts`
- `src/engines/multiHazardEngines.ts`
- `certification/*.json`

Publish to npm only when versioned and tested; until then treat as source-level SDK.
