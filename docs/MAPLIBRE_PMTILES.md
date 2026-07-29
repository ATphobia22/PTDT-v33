# MapLibre + PMTiles workflow

## Stack

- **MapLibre GL JS** (`maplibre-gl`) — renderer  
- **pmtiles** npm package — read `.pmtiles` archives (HTTP range requests)  
- Optional free style hosts (OpenFreeMap / Protomaps-style) — **no Mapbox token required** for default basemap

## Typical client pattern

```ts
import maplibregl from "maplibre-gl";
import { Protocol } from "pmtiles";

const protocol = new Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);

const map = new maplibregl.Map({
  container: "map",
  style: "https://.../style.json", // or local style referencing pmtiles://
  center: [-87.95, 37.92],
  zoom: 12,
});

// Vector overlay from archive:
// map.addSource("local", { type: "vector", url: "pmtiles://https://example.com/posey.pmtiles" });
```

Exact URLs live in `src/components/MapComponent.tsx` — prefer public CORS-enabled hosts or self-hosted files.

## Building a local PMTiles archive (offline / custom layers)

1. Prepare GeoJSON / geoparquet for floodplain, berm, parcels.  
2. Use **tippecanoe** or **Planetiler** to emit MVT tiles.  
3. Package with [go-pmtiles](https://github.com/protomaps/go-pmtiles) or tippecanoe PMTiles output.  
4. Host on static HTTPS (or `public/` in Vite for tiny files).  
5. Point MapLibre `pmtiles://` protocol at that URL.

## CORS

Remote PMTiles need **Range** request support and CORS headers allowing the app origin.

## Regulatory note

Map tiles are **visualization**. They are not the HEC-RAS model-of-record or a FEMA effective map.
