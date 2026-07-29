# MapLibre + PMTiles workflow

## Stack

- **MapLibre GL JS** (`maplibre-gl`) — renderer  
- **pmtiles** npm package — `.pmtiles` archives via HTTP range requests  
- Free style hosts (e.g. demotiles / OpenFreeMap-style) — **no Mapbox token** for default path

## Client pattern

```ts
import maplibregl from "maplibre-gl";
import { Protocol } from "pmtiles";

const protocol = new Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);

const map = new maplibregl.Map({
  container: "map",
  style: "https://demotiles.maplibre.org/style.json", // replace with project style
  center: [-88.0051, 37.8459], // Bonebank vicinity — confirm survey
  zoom: 13,
  pitch: 60,
});

// Optional vector archive:
// map.addSource("site", { type: "vector", url: "pmtiles://https://host/posey.pmtiles" });
```

Wire exact sources in `src/components/MapComponent.tsx`.

## Building PMTiles

1. GeoJSON / geoparquet for floodplain, berm, footprints.  
2. **tippecanoe** or **Planetiler** → MVT.  
3. Package with go-pmtiles / tippecanoe PMTiles output.  
4. Host with CORS + **Range** support.  
5. Point `pmtiles://` at that URL.

## Proxy tip (from UI dashboard PDF)

Vite/Express can proxy `/api` → Archimedes `:8000` so the browser stays same-origin. Root `server.ts` already hosts federal proxies.

## Regulatory note

Tiles and Three.js holograms are **visualization**. Model-of-record remains PE HEC-RAS + survey.
