# Anti-fabrication policy (regulatory APIs)

## Rejected as non-official

The following patterns appear in some project PDFs and must **not** be treated as live federal integrations:

| Artifact | Why rejected |
|----------|----------------|
| `submit_fema_package.sh` OAuth to `https://fema.gov/oauth/token` | Not a documented public FEMA client-credentials API for LOMA/No-Rise |
| `https://api.fema.gov/v1/regulatory/submissions` | Not a verified public submission API for PE packages |
| Scope `regulatory:submission:write` | Not a published FEMA GO / LOMC OAuth scope |
| GitHub Action that “transmits to FEMA GO” via those URLs | Will fail or mislead; **FEMA GO** is a **web portal** for grants (BRIC/FMA), not a bash OAuth LOMA pipe |
| Placeholder SHA-256 `e3b0c44298fc1c14...` (empty content hash) | Invalid evidence for Daubert / agency packages |
| “Automated Administrative Dominance” language | Not legal authority |

## Approved real channels

| Need | Channel |
|------|---------|
| BRIC / FMA applications | [FEMA GO](https://go.fema.gov/) web UI (AOR submit) |
| LOMA / LOMC | FEMA **Online LOMC** + PE-sealed exhibits |
| IDNR floodway / No-Rise | IDNR Division of Water processes + PE seal |
| FARA / BAFL | [INFIP](https://www.in.gov/dnr/water/surface-water/indiana-floodplain-mapping/indiana-floodplain-information-portal) |
| Live stage/discharge | USGS NWIS (`/api/usgs-telemetry`) |
| Datum transform | NGS NCAT (`/api/transform-elevation`) |
| NFHL / BAFL map queries | Existing GIS proxies in `server.ts` |

## Local tools that are allowed

- ReportLab PDF **templates** for PE review (`archimedes_engine.py`)
- SHA-256 manifests of **local** files (honest hashes of real bytes)
- Prometheus metrics for **app performance** (not federal proof)
- Compensatory storage **calculator** with documented factor 1.20×
