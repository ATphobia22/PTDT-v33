/**
 * MapLibre helpers for 13101 Bonebank — local buildings fill-extrusion + site marker.
 * Zero-key: uses /api/gis/buildings (local sample) and BONEBANK_SITE.
 */
import type { Map as MapLibreMap } from "maplibre-gl";
import maplibregl from "maplibre-gl";
import { BONEBANK_SITE } from "./siteConstants";

const SRC = "bonebank-buildings";
const LAYER = "bonebank-buildings-extrusion";
const OUTLINE = "bonebank-buildings-outline";

export async function attachBonebankBuildingExtrusions(map: MapLibreMap): Promise<number> {
  if (!map.isStyleLoaded()) return 0;

  try {
    const res = await fetch("/api/gis/buildings");
    if (!res.ok) return 0;
    const data = await res.json();

    if (map.getSource(SRC)) {
      (map.getSource(SRC) as maplibregl.GeoJSONSource).setData(data);
    } else {
      map.addSource(SRC, { type: "geojson", data });
      map.addLayer({
        id: LAYER,
        type: "fill-extrusion",
        source: SRC,
        minzoom: 13,
        paint: {
          "fill-extrusion-color": "#10b981",
          "fill-extrusion-height": ["coalesce", ["get", "height_m"], 6.5],
          "fill-extrusion-base": 0,
          "fill-extrusion-opacity": 0.85,
        },
      });
      map.addLayer({
        id: OUTLINE,
        type: "line",
        source: SRC,
        paint: {
          "line-color": "#34d399",
          "line-width": 1.5,
          "line-opacity": 0.9,
        },
      });
    }
    return Array.isArray(data.features) ? data.features.length : 0;
  } catch (e) {
    console.warn("[bonebank layers] buildings load failed", e);
    return 0;
  }
}

export function flyToBonebank(map: MapLibreMap, duration = 2500): void {
  map.flyTo({
    center: BONEBANK_SITE.center,
    zoom: BONEBANK_SITE.zoom,
    pitch: 58,
    bearing: -20,
    duration,
    essential: true,
  });
}

export function addBonebankSiteMarker(map: MapLibreMap): maplibregl.Marker {
  const el = document.createElement("div");
  el.className = "bonebank-site-marker";
  el.style.cssText =
    "width:14px;height:14px;border-radius:50%;background:#10b981;border:2px solid #ecfdf5;box-shadow:0 0 12px rgba(16,185,129,0.8);";
  return new maplibregl.Marker({ element: el })
    .setLngLat(BONEBANK_SITE.center)
    .setPopup(
      new maplibregl.Popup({ offset: 12 }).setHTML(
        `<div style="font-family:monospace;font-size:11px;padding:4px">` +
          `<b>${BONEBANK_SITE.name}</b><br/>` +
          `${BONEBANK_SITE.owner} · ${BONEBANK_SITE.acreage} ac<br/>` +
          `BFE ${BONEBANK_SITE.bfe_ft_navd88} / LAG ${BONEBANK_SITE.lag_ft_navd88} NAVD88<br/>` +
          `FIRM ${BONEBANK_SITE.firm_panel}</div>`
      )
    )
    .addTo(map);
}
