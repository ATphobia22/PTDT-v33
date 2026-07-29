# PDF ingest decisions (truth filter)

| Source PDF theme | Kept? | Action |
|------------------|-------|--------|
| No-Rise ReportLab generator | **Yes (draft)** | `python/norise_certificate_draft.py` |
| PE Transmittal ReportLab | **Yes (draft)** | `python/pe_transmittal_draft.py` — blank seal |
| HEC-RAS coupler Manning + optional HDF | **Yes (screening)** | `python/hec_ras_coupler.py` — `SCREENING_ONLY` |
| Calibration &lt;5% PASS | **Project QA only** | `compare_model_predictions` — not Daubert |
| Master engine `APPROVED_CERTIFIED_NO_RISE` | **No** | Forbidden |
| Governor 0.14 ft “strict No-Rise” auto-pass | **No** | PE/IDNR decide; do not soft-approve rise |
| Cesium Ion console HTML | **Defer** | Needs token; prefer MapLibre path in app |
| Godot frame SHA “evidence seal” | **No as legal** | UI demo only |
| MemoryNode / Chroma | **Optional** | Not required for agency filings |
| SQLite No-Rise ledger | **Yes (local log)** | `python/norise_ledger.py` |
| BCA narrative with invented losses | **Screening** | Toolkit required for real BCR |
| OAuth FEMA GO | **No** | See ANTI_FABRICATION.md |

## Commands

```bash
pip install reportlab numpy pytest
python python/pe_transmittal_draft.py
python python/norise_certificate_draft.py
python python/hec_ras_coupler.py
python python/better_data_package.py
pytest tests/test_math_gates.py -q
```
