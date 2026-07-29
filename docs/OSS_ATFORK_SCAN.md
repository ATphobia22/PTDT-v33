# Useful free OSS (ATphobia22 forks + upstream)

Prefer **upstream** packages for production installs; forks are for reference only.

| Project | Role for PTDT |
|---------|----------------|
| **DOI-USGS/dataretrieval-python** (optional fork ATphobia22) | NWIS IV / DV client — optional path in `usgs_bridge.py` |
| **USACE HEC-RAS** | Model-of-record (download from HEC, not a git dependency) |
| **MapLibre GL JS** | Default map renderer |
| **protomaps/PMTiles** | Tile archive format + JS protocol |
| **felt/tippecanoe** | Build vector tiles → PMTiles |
| **maplibre/martin** | Optional tile server |
| **MODFLOW 6 / flopy** | Optional GW coupling (not CI) |
| **ReportLab** | Draft PDFs |
| **FastAPI / Uvicorn** | Archimedes API |

## Do not use for regulatory claims

- Quantum (Qiskit/stim) experiments — **removed** from `qec_filter` / `npr_engine`  
- Databricks runtime images in local Archimedes Docker  

## Install hints

```bash
pip install dataretrieval   # optional richer NWIS
pip install numpy pytest    # math gates
npm install                 # MapLibre already in package.json
```
