# PDF ingest decisions (truth filter)

| Source PDF theme | Kept? | Action |
|------------------|-------|--------|
| No-Rise ReportLab generator | **Yes (draft)** | `python/norise_certificate_draft.py` — blank PE signature, DRAFT banner |
| SQLite No-Rise ledger | **Yes (local log)** | `python/norise_ledger.py` — statuses limited to SCREENING_ONLY / AWAITING_PE_REVIEW / PE_SIGNED_LOCAL_COPY |
| PE Transmittal auto-signed by software | **No** | Illegal / unethical; PE must sign |
| Status `APPROVED_CERTIFIED_TRI_STATE_NO_RISE` from code | **No** | Agencies approve; code does not |
| Bishop FoS 1.68 claim without geotech inputs | **Log field only** | Optional number in ledger; not computed here |
| BCA JSON BCR 2.45 | **Screening only** | `python/bca_screening_export.py` marked SCREENING_ONLY |
| Meridian spatial envelope | **Yes** | `python/spatial_envelope.py` (no Redis required) |
| Calibration &lt;5% = Daubert compliant | **No as legal claim** | `python/calibration_receipt.py` = project QA gate only |
| Fake evidence_manifest hashes / tarball sealed | **No** | Generate hashes only from real files on disk |
| OAuth FEMA GO | **No** | See ANTI_FABRICATION.md |
| GitHub Actions math tests | **Yes** | `tests/test_math_gates.py` |
| Vitest / Playwright UI tests | **Defer** | Need stable frontend selectors |
| Postgres / Redis enterprise adapters | **Defer** | Optional ops; SQLite ledger sufficient for now |

## How to use for agency packages

```bash
pip install reportlab numpy pytest
python python/norise_certificate_draft.py
python python/norise_ledger.py
python python/better_data_package.py
pytest tests/test_math_gates.py -q
```

Attach PE-signed forms, survey, HEC-RAS, and INFIP FARA. Do not file DRAFT PDFs as certificates.
