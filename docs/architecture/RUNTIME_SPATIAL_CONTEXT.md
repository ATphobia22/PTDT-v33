# Runtime Spatial Context

The runtime twin uses the current MapLibre viewport as the spatial query boundary.

1. Query NOAA IOCM mapping footprints using ArcGIS `where`, geometry/spatial relationship, and bounded `outFields`/record count.
2. Convert returned footprints into provenance-safe mapping contexts.
3. Intersect those footprints/viewport records with registered DEM, LiDAR, RAS, USGS, PostGIS, and Archimedes spatial records.
4. Expose relationships to the HUD/inspector as contextual links.
5. Keep each dataset's authority, units, datum, timestamp, and role independent.

The spatial graph is not a calculation engine. It does not derive flood depth, stage, BFE, regulatory status, or navigation information from a geographic intersection.

The NOAA IOCM footprint retains its explicit `Not for Navigation` limitation.
