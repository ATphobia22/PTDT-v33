# Authoritative Evidence Graph

## Authority model

The digital twin is a read-only evidence consumer. It does not rewrite, reinterpret, or certify source calculations.

| Source | Role | Authority |
|---|---|---|
| NOAA IOCM Mapping Coordination | Contextual footprint metadata | NOAA metadata |
| DEM | Terrain observation/dataset | Source dataset |
| LiDAR | Elevation observation/dataset | Source dataset |
| HEC-RAS / RAS GeoTIFF | Hydraulic model result | Hydraulic model |
| USGS NWIS | Measured/provisional telemetry | USGS |
| USGS-EnKF | Derived assimilation | Derived, not observation |
| PostGIS | Project spatial records | Project database |
| Archimedes | Engineering calculations | Independent calculation authority |

## Provenance invariant

Every evidence node has:

- stable provenance ID
- source record ID
- role and authority
- retrieval timestamp
- observation timestamp when applicable
- spatial reference and vertical datum when applicable
- units when applicable
- canonical payload SHA-256
- parent provenance IDs for derived records

The provenance ID is derived from the source identity, semantic role, authority, timestamps, coordinate metadata, payload hash, and parent IDs.

## USGS invariant

A USGS observation is never replaced by an assimilated value. The assimilation record points back to the observation through `parent_ids` and identifies itself as `derived-assimilation`.

Station `03378500` is the USGS Wabash River at New Harmony station. USGS currently labels the displayed conditions as provisional and exposes gage height parameter `00065` and discharge parameter `00060`.

## NOAA invariant

NOAA IOCM footprints are contextual mapping metadata. They are not converted into engineering constraints. Runtime queries are bounded by the current spatial extent, selective `where` predicates, selected `outFields`, spatial relationship, and record count.

## Archimedes invariant

Archimedes calculations are executed independently from the evidence graph. The calculation wrapper accepts a provenance record, invokes an explicitly exposed Archimedes operation, and stores the output as a new provenance node whose parent is the input node.

The HUD can display calculation inputs and outputs, hashes, and provenance relationships, but cannot mutate them.

## Runtime flow

`MapLibre selection -> bounded source queries -> provenance records -> EvidenceGraph -> Archimedes calculation boundary -> read-only HUD`

The renderer may use evidence to explain what is being visualized. It must not infer BFE, regulatory compliance, surcharge, flood depth, or engineering certification merely from spatial intersection.
