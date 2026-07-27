# Point Township Digital Twin - Technical Reference

## Vertical Datum Transformations (NGS NCAT)
NCAT (NGS Coordinate Conversion and Transformation Tool) is the authoritative tool for transforming heights between datums. For flood digital twins, transformation between **NGVD 29** and **NAVD 88** is critical.

### Key Facts:
- **Engine**: VERTCON 3.0 (released 20190601).
- **Scope**: CONUS, Alaska, and various islands.
- **Bonebank Road Coordinates**: 37.8459°N, 88.0051°W.
- **Constraint**: Never use a fixed statewide offset (e.g., "3 ft"). The shift is location-specific.
- **API**: [NGS NCAT Web Service](https://geodesy.noaa.gov/web_services/ncat/index.shtml) (no key required).

---

## OpenMapTiles Schema
The application uses the OpenMapTiles schema (version 3.16.0) for vector tile rendering.

### Critical Layers:
- **`building`**: 
  - `source-layer`: `building`
  - `render_height`: Approx height in meters (OSM-derived).
  - `render_min_height`: Base height in meters.
- **`water`**:
  - `class`: ocean, lake, river, pond, etc.
  - `intermittent`: 0/1 flag for seasonal water.
- **`waterway`**:
  - `class`: stream, river, canal, drain, ditch.
- **`transportation`**:
  - `class`: motorway, trunk, primary, secondary, etc.

### Vector Sources:
- **OpenFreeMap**: `https://tiles.openfreemap.org/styles/dark` (or liberty).
- **Overture Maps**: Building footprints via PMTiles.
- **Protomaps**: Alternative for regional extracts.

---

## Engineering Guardrails
- **NAVD 88 Compliance**: All FEMA LOMA / No-Rise submissions MUST be in NAVD 88.
- **Validation**: `python/navd88_hard_check.py` blocks NGVD 29 inputs at the engine level.
