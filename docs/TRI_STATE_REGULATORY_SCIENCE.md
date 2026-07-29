# Tri-state regulatory science matrix (IN / IL / KY)

Goal: document **what each state actually requires** so PTDT models and packages map cleanly — not to claim the software supersedes agencies.

## Shared federal floor

| Topic | Standard |
|-------|----------|
| Insurance maps | FEMA NFHL / FIRM |
| Map amendment | LOMA / LOMR via Online LOMC; PE survey data |
| Vertical datum | **NAVD 88** for modern filings |
| Model of record | USACE **HEC-RAS** (1D/2D) widely accepted for No-Rise |

## Indiana (IDNR Division of Water)

| Item | Practice |
|------|----------|
| Statute / rules | IC 14-28-1; **312 IAC 10** |
| Mapping | NFHL + **Best Available Floodplain (BAFL)** + **INFIP/FARA** |
| Drainage trigger | Often **> 1 sq mi** upstream for floodway jurisdiction |
| No-Rise | PE certification of **no increase** to BFE for floodway work (0.000 ft standard language in PE packages) |
| Storage | Project uses **1.20×** cut ≥ fill as *engineering factor* — confirm with reviewer |
| Portal | INFIP FARA generation; e-application channels |

## Illinois (IDNR/OWR Part 3700 / 3708 family)

| Item | Practice |
|------|----------|
| Program | Construction in Floodways of Rivers, Lakes and Streams (**Part 3700**); designated floodway rules (**Part 3708** in mapped areas) |
| Water-surface | Formal permits often require demonstration that increases stay within tight limits (commonly **≤ 0.1 ft** in guidance materials for certain cases; **0.0 ft** when damages would occur) |
| Compensatory storage | Required for floodway fill; volume tables (e.g. 0–10 and 10–100 year bands) in designated areas |
| Bridges | Replacement/new bridge conveyance rules; limited surcharge allowances in statewide guidance |

**Do not hard-code 0.14 ft as “Indiana No-Rise.”** That number in older drafts is not a substitute for PE modeling against the controlling ordinance.

## Kentucky (KDOW / 401 KAR 4:060)

| Item | Practice |
|------|----------|
| Regulation | **401 KAR 4:060** stream construction criteria |
| Floodway definition | Channel + land needed to pass base flood **without raising the base flood crest more than 1.0 foot** (regulatory floodway boundary concept) |
| Permits | State stream construction permit + local floodplain manager sign-off |
| Local | Often dual state + local permits |

## Scientific stack that strengthens “better data”

| Capability | Module | Agency value |
|------------|--------|--------------|
| Site LAG/BFE clearance on NAVD 88 | `archimedes_engine.py`, better-data package | LOMA natural-ground case |
| Live Ohio River context | `python/telemetry_john_t_myers.py` (USGS **03322000**) | Operational awareness |
| Live Wabash context | `/api/usgs-telemetry` (**03378500**) | Calibration reference |
| Volume / cut-fill screening | `python/volumetric_calc.py` | Storage math transparency |
| HDF open + screening WSE | `python/hec_ras_coupler.py` | Path to real RAS files |
| Dual-layer maps | NFHL + BAFL proxies | IN dual jurisdiction |
| Datum transform | NGS NCAT proxy | Kill NGVD 29 errors |
| Coupling contract | `protobuf/openmi_solver.proto` | Future multi-solver V&V |

## What still outranks any app

1. **Licensed PE seal** on No-Rise / LOMA exhibits  
2. **Survey-grade** LAG/FFE (LiDAR claims must be certified)  
3. **Official HEC-RAS** project files and run logs for floodway cases  
4. **INFIP FARA** PDF for the exact coordinates  
5. **Agency portals** (Online LOMC, IDNR, KDOW, IL OWR) — not homemade OAuth  

## Honesty bound (Daubert / FRE 702)

- Accepted practice: **HEC-RAS**, published USGS/NGS/FEMA data, PE judgment  
- SHA-256 manifests prove **file integrity**, not scientific truth  
- Screening Manning formulas are **not** St. Venant 2D solutions  
- Claiming “outshine all agencies” is not a scientific standard; **reproducible better topography + dual-layer compliance + live gages** is  
