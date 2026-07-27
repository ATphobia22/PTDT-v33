# atphobia22-hydro-pipeline (Databricks DLT only)

This package is a **Databricks Delta Live Tables** pipeline. It requires:

- Databricks runtime / `dlt` + Spark
- Cloud paths under `/mnt/flood-models/...`
- Optional private modules (`rgis`, `ras_commander`, etc.) not published in this monorepo

**Do not run locally** as a substitute for regulatory PDFs.

Local LOMA / No-Rise / BCA path:

```bash
# from repo root
pip install -r requirements.txt
python archimedes_engine.py
```

Deploy this folder only via Databricks Asset Bundle (`databricks.yml`) when workspace mounts and secrets are configured.
