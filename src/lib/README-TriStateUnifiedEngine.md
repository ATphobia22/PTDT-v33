# TriStateUnifiedEngine (PTDT v33)

Purpose: provide deterministic building height normalization and multi-jurisdictional flood compliance evaluation for the PTDT project.

Key points

- Coordinates
  - coordinates: [lon, lat] — canonical ordering used by mapping libraries (MapLibre/GeoJSON).
  - latLon: [lat, lon] — legacy field retained for backward compatibility and marked as deprecated.

- normalizeBuildingHeight(rawProperties, isPrimary)
  - Coerces numeric strings and accepts numbers.
  - Order of precedence: explicit meters (height_m) -> feet (height_ft, converted to meters) -> levels (levels * LEVEL_HEIGHT_M) -> deterministic fallback (FALLBACK_BUILDING_HEIGHT_M).

- evaluateJurisdictionalCompliance(jurisdiction, stageFt, floodwayDeltaFt?)
  - Validates numeric inputs and throws TypeError for invalid values.
  - Consistent compliance semantics: BFE exceedance sets compliant=false for all jurisdictions. LAG exceedance sets status=CRITICAL_EXCEEDED and compliant=false.
  - Jurisdiction-specific floodway delta thresholds:
    - ILLINOIS: delta > 0.1 ft (17 Ill. Adm. Code 3700)
    - KENTUCKY: delta > 0.0 ft (401 KAR 4:060)
    - INDIANA: BFE exceedance treated as critical

Testing

- Uses Vitest for unit tests. To run tests locally:

  1. Install dependencies (add vitest as devDependency):

     npm install --save-dev vitest

  2. Run tests:

     npx vitest

Migration notes

- Consumers should switch from latLon to coordinates to avoid lat/lon ordering mistakes when integrating with GeoJSON or MapLibre.

