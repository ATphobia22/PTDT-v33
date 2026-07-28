# Master Makefile PDF → Live Repo Map

The uploaded *Master Monorepo Integration & Deployment Makefile* PDF uses paths that **do not exist** in this monorepo. The root `Makefile` implements the same phases against **real** files.

| PDF target / path | Live equivalent | Notes |
|-------------------|-----------------|-------|
| `02_mathematical_core/archimedes_master_v32.py` | `archimedes_engine.py` | Canonical engine + FastAPI |
| `from 02_mathematical_core.archimport ...` (broken) | `from archimedes_engine import generate_unified_regulatory_package` | Fixed import |
| `04_FEMA_BCA_Toolkit_Export_Data.json` | `05_final_portal_package/bca_elevation_data.json` | NAVD88 hard-check input |
| `infra/docker-compose.yml` | `workspace/archimedes_console/infra/docker-compose.yml` | Redis + Chroma (host **8001**) |
| `deploy_and_backup.py` | `archimedes_console/deploy_and_backup.py` | Vault backup |
| `qiskit` / IBM runtime in pip | **Not installed** | Out of scope for open LOMA/BCA path |
| Databricks DLT pipeline | `atphobia22-hydro-pipeline/` | Cloud only; not `make backend` |

## Standard commands

```bash
make package          # LOMA / No-Rise PDFs + BCA JSON/CSV
make ci-gate          # package + NAVD 88 check (hard gate)
make engine           # FastAPI on :8000
make ui               # dashboard :3000
make init-infra       # Redis + Chroma
make vault-backup     # SHA-256 backup protocol
make docker-verify    # slim image + health
make all              # package + ci-gate
```

Regulatory baseline (NAVD 88): BFE 375.0 ft, LAG 377.2 ft, clearance +2.2 ft.
