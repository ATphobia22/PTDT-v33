# PDF-extracted regulatory facts (Bonebank / PTDT)

Source attachments ingested 2026-08-01. Use these as the single checklist for HUD, LOMA package, and IDNR permit paths.

## Elevations (NAVD88 only)

| Metric | Value | Source doc |
|--------|-------|------------|
| BFE | **375.0 ft** | LOMA checklist, Gov dossier, Grant reqs |
| LAG | **377.2 ft** | LOMA, NAVD88 Architecture |
| Clearance | **+2.2 ft** | LAG − BFE |
| FFE | **382.5 ft** | NAVD88 Architecture |
| Forbidden | NGVD29 | ~3 ft systematic shift → FEMA reject |

## FEMA LOMA path

- Type: **Natural High Ground** LOMA (MT-EZ / Online LOMC) — not LOMR-F if no fill
- Street: 13101 Bonebank Road
- Community: Posey County & Unincorporated Areas **#180194**
- **FIRM Panel: 18129C0215D**
- Gauge metadata: USGS **03378500**
- ~60 day review; no LOMA fee

## IDNR / Indiana dual mapping

| Layer | Agency | Role |
|-------|--------|------|
| NFHL / FIRM | FEMA | NFIP insurance |
| BAFM / BAFL | IDNR DOW | Local permit / floodway (IC 14-28-1) |
| INFIP | IDNR | BFE points, FARA |
| FARA | INFIP output | Zone A / better data / LOMA support |

- Floodway jurisdiction if drainage area **> 1 sq mi (640 ac)**
- Compensatory storage: **V_cut ≥ 1.20 × V_fill** (IDNR checklist; use **1.20** not 1.15 from older math snippet)
- No-Rise: **0.000 ft** surcharge; statute IC 14-28-1 & **312 IAC 10**

## Dual-gauge Tri-State network

| Gauge | River | Notes |
|-------|-------|-------|
| **03378500** | Wabash @ New Harmony | Primary site calibration |
| **03322000** | Ohio @ John T. Myers | NWS **UNWK2**; action 33 / minor 37 / mod 49 / major 60 ft |

## BCA / BRIC sample metrics (dossier JSON)

- BCR **2.45**; losses avoided ~$20.8M; project cost $8.5M (illustrative package)
- HAZUS safety index **98.4** (package claim — not a live HAZUS run)

## Daubert / solvers (spec only)

Accepted engines when attached: HEC-RAS 2D, TUFLOW, PySWMM, MODFLOW 6. Custom unverified math banned for evidentiary bundles.

## OpenMI stub

`ptdt.openmi.v32` SolverIntegration RPCs (Initialize, PerformTimeStep, Get/SetValues, Finish) — wire when coupling external solvers.

## Not project geography

Magic3D / generic text-to-3D paper, Franklin NC 35 ac holographic mock, coastal resort flyovers — **style only**, not Bonebank data.
