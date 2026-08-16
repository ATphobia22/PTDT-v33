# Engineering Semantic Boundaries

The digital twin may spatially relate datasets without treating them as interchangeable measurements.

| Layer | Meaning | Allowed contextual relationship | Must not be inferred |
|---|---|---|---|
| DEM | elevation surface | footprint overlap, terrain rendering | flood depth, regulatory status |
| LiDAR | point-cloud/elevation observations | coverage, density, terrain provenance | design certification |
| RAS | modeled hydraulic result | flood visualization, scenario overlap | observed stage or legal boundary |
| USGS | hydrologic observations | timestamp/site association | forecast or regulatory determination |
| PostGIS | spatial persistence/derived GIS | indexing, joins, spatial query | independent authority unless source is authoritative |
| Archimedes | engineering calculations | calculation/evidence linkage | visual renderer as calculation engine |
| NOAA IOCM | mapping-coordination footprints | mapping coverage/provenance context | navigation, elevation, flood, engineering value |

## Spatial linking rule

A NOAA footprint may be linked to DEM, LiDAR, RAS, USGS, PostGIS, and Archimedes records when their spatial extents intersect or a user explicitly requests the relationship. The link means **contextual association only**.

## Provenance rule

Every linked layer retains its own:

- source identifier
- authority
- role
- timestamp when applicable
- horizontal CRS when known
- vertical datum when applicable
- units when applicable

No layer inherits another layer's datum, units, authority, or engineering meaning merely because the geometries overlap.

## ArcGIS query rule

ArcGIS requests should use a spatial/attribute predicate whenever possible, request only fields needed by the consumer, and bound record counts. The client helper enforces a field and record ceiling to avoid accidental unbounded requests. Pagination remains available through `resultOffset`/`resultRecordCount`.

## Rendering rule

Rendering may consume derived/contextual values but must never mutate authoritative source measurements. Visual exaggeration, color ramps, fog, cinematic post-processing, and flood visualization are presentation operations.

## Engineering rule

Archimedes outputs remain calculations with their own inputs/evidence. A map footprint or renderer cannot certify a hydraulic, structural, floodplain, or regulatory conclusion.
