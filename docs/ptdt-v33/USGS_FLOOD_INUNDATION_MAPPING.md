# USGS flood inundation mapping (FIM) — Tri-State

## What FIM is

USGS publishes **stage-indexed depth grids** for selected reaches: for each tabulated gage stage, a raster of estimated inundation depth derived from calibrated 1-D/2-D hydraulics + DEM. Products are **scientific decision support**, not a substitute for FEMA BFE or IDNR FARA at a parcel.

---

## Relevant libraries near Bonebank

| Reach / gage | USGS ID | Notes |
|---|---|---|
| Wabash at New Harmony | **03378500** | Closest Wabash FIM; PTDT primary calibration gage in gov constants |
| Wabash at Memorial Bridge, Vincennes | **03343010** | Upstream depth-grid library |
| Ohio River corridor (regional) | various | Myers is **navigational**; use AHPS/USGS stage, not FIM alone |

Workflow:

```
USGS stage (ft) → gage zero (NAVD88) → WSEL_navd88
              → optional FIM depth grid @ that stage (presentation)
              → HUD label: source=USGS_FIM, authority=presentation
```

Never promote FIM depth to sealed BFE or LOMA LAG.

---

## PTDT use

| Layer | Role |
|---|---|
| Live USGS / AHPS stage | Operational HUD + RAS boundary |
| USGS FIM grids | Historical / scenario plates |
| Sealed LiDAR LAG / BFE | LOMA + freeboard authority |
| Tucker property triggers (Myers stage ft) | Family ground-truth impact ladder |

---

## Related

- `docs/ptdt-v33/TRI_STATE_AGENCY_DATA_VERIFICATION.md`
- `docs/ptdt-v33/BERM_PLACEMENT_AND_HISTORICAL_FLOOD.md`
- `backend/usgs_telemetry_bridge.py`
