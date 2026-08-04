/**
 * Agency map layers — Posey parcels, BAFM sample, optional live USGS annotation.
 * Offline-safe GeoJSON from /api/gis/posey/* endpoints.
 */
import type { Map as MaplibreMap } from "maplibre-gl";
import { BONEBANK_SITE } from "./siteConstants";

const PARCEL_SRC = "posey-parcels";
const PARCEL_FILL = "posey-parcels-fill";
const PARCEL_LINE = "posey-parcels-line";
const BAFM_SRC = "posey-bafm";
const BAFM_FILL = "posey-bafm-fill";
const BAFM_LINE = "posey-bafm-line";

async function fetchJson(url: string): Promise<any> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function ensureGeoJsonSource(map: MaplibreMap, id: string, data: any) {
  const src = map.getSource(id) as any;
  if (src && typeof src.setData === "function") {
    src.setData(data);
    return;
  }
  if (!map.getSource(id)) {
    map.addSource(id, { type: "geojson", data });
  }
}

/** Load Posey parcel sample + BAFM sample as MapLibre layers. */
export async function loadAgencyGisLayers(map: MaplibreMap): Promise<{ parcels: number; bafm: number }> {
  // Using the /api/gis/ endpoints as defined in server-gis-routes.ts
  const [parcels, bafm] = await Promise.all([
    fetchJson("/api/gis/parcels"),
    fetchJson("/api/gis/bafm"),
  ]);

  let parcelCount = 0;
  let bafmCount = 0;

  if (parcels?.features?.length) {
    parcelCount = parcels.features.length;
    ensureGeoJsonSource(map, PARCEL_SRC, parcels);
    if (!map.getLayer(PARCEL_FILL)) {
      map.addLayer({
        id: PARCEL_FILL,
        type: "fill",
        source: PARCEL_SRC,
        paint: {
          "fill-color": "#38bdf8",
          "fill-opacity": 0.18,
        },
      });
    }
    if (!map.getLayer(PARCEL_LINE)) {
      map.addLayer({
        id: PARCEL_LINE,
        type: "line",
        source: PARCEL_SRC,
        paint: {
          "line-color": "#0ea5e9",
          "line-width": 2,
          "line-opacity": 0.85,
        },
      });
    }
  }

  if (bafm?.features?.length) {
    bafmCount = bafm.features.length;
    ensureGeoJsonSource(map, BAFM_SRC, bafm);
    if (!map.getLayer(BAFM_FILL)) {
      map.addLayer({
        id: BAFM_FILL,
        type: "fill",
        source: BAFM_SRC,
        paint: {
          "fill-color": "#f59e0b",
          "fill-opacity": 0.15,
        },
      });
    }
    if (!map.getLayer(BAFM_LINE)) {
      map.addLayer({
        id: BAFM_LINE,
        type: "line",
        source: BAFM_SRC,
        paint: {
          "line-color": "#d97706",
          "line-width": 1.5,
          "line-dasharray": [2, 1],
          "line-opacity": 0.9,
        },
      });
    }
  }

  const siteFc = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          name: BONEBANK_SITE.name,
          bfe: BONEBANK_SITE.bfe_ft_navd88,
          lag: BONEBANK_SITE.lag_ft_navd88,
        },
        geometry: {
          type: "Point",
          coordinates: BONEBANK_SITE.center,
        },
      },
    ],
  };

  ensureGeoJsonSource(map, "bonebank-site-point", siteFc);
  if (!map.getLayer("bonebank-site-point-circle")) {
    map.addLayer({
      id: "bonebank-site-point-circle",
      type: "circle",
      source: "bonebank-site-point",
      paint: {
        "circle-radius": 7,
        "circle-color": "#22c55e",
        "circle-stroke-width": 2,
        "circle-stroke-color": "#ffffff",
      },
    });
  }

  return { parcels: parcelCount, bafm: bafmCount };
}

export function setAgencyLayerVisibility(
  map: MaplibreMap,
  layer: "parcels" | "bafm",
  visible: boolean
) {
  const vis = visible ? "visible" : "none";
  if (layer === "parcels") {
    if (map.getLayer(PARCEL_FILL)) map.setLayoutProperty(PARCEL_FILL, "visibility", vis);
    if (map.getLayer(PARCEL_LINE)) map.setLayoutProperty(PARCEL_LINE, "visibility", vis);
  } else {
    if (map.getLayer(BAFM_FILL)) map.setLayoutProperty(BAFM_FILL, "visibility", vis);
    if (map.getLayer(BAFM_LINE)) map.setLayoutProperty(BAFM_LINE, "visibility", vis);
  }
}

export default { loadAgencyGisLayers, setAgencyLayerVisibility };
