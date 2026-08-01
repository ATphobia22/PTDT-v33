/**
 * Multi-hazard frames backed by live public APIs where available.
 * - Atmosphere / thermal: Open-Meteo (no key)
 * - Hydro context: caller supplies USGS stage or we note dual-gauge path
 * - Wildfire / vegetation indices: no free operational point API — reported as UNAVAILABLE not fake numbers
 */

import { BONEBANK_SITE } from "../lib/siteConstants";

export type EngineStatus = "LIVE" | "UNAVAILABLE" | "PE_GATED";

export interface EngineFrame {
  engine: string;
  status: EngineStatus;
  site: string;
  timestamp: string;
  metrics: Record<string, number | string | boolean | null>;
  source: string;
  notes: string[];
}

interface OpenMeteoCurrent {
  temperature_2m?: number;
  relative_humidity_2m?: number;
  precipitation?: number;
  weather_code?: number;
  wind_speed_10m?: number;
  cloud_cover?: number;
}

async function fetchOpenMeteo(): Promise<OpenMeteoCurrent | null> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${BONEBANK_SITE.lat}` +
    `&longitude=${BONEBANK_SITE.lon}` +
    `&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,cloud_cover` +
    `&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=America%2FIndiana%2FIndianapolis`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "PTDT-Bonebank/1.0" } });
    if (!res.ok) return null;
    const data = await res.json();
    return (data?.current || null) as OpenMeteoCurrent;
  } catch {
    return null;
  }
}

export async function atmosphericEngine(): Promise<EngineFrame> {
  const cur = await fetchOpenMeteo();
  if (!cur) {
    return {
      engine: "AtmosphericEngine",
      status: "UNAVAILABLE",
      site: BONEBANK_SITE.name,
      timestamp: new Date().toISOString(),
      metrics: {},
      source: "Open-Meteo",
      notes: ["Open-Meteo request failed"],
    };
  }
  return {
    engine: "AtmosphericEngine",
    status: "LIVE",
    site: BONEBANK_SITE.name,
    timestamp: new Date().toISOString(),
    metrics: {
      cloud_cover_pct: cur.cloud_cover ?? null,
      weather_code: cur.weather_code ?? null,
      wind_speed_mph: cur.wind_speed_10m ?? null,
      precip_in: cur.precipitation ?? null,
    },
    source: "Open-Meteo",
    notes: ["Live forecast grid at parcel lat/lon"],
  };
}

export async function thermalEngine(): Promise<EngineFrame> {
  const cur = await fetchOpenMeteo();
  if (!cur) {
    return {
      engine: "ThermalEngine",
      status: "UNAVAILABLE",
      site: BONEBANK_SITE.name,
      timestamp: new Date().toISOString(),
      metrics: {},
      source: "Open-Meteo",
      notes: ["Open-Meteo request failed"],
    };
  }
  return {
    engine: "ThermalEngine",
    status: "LIVE",
    site: BONEBANK_SITE.name,
    timestamp: new Date().toISOString(),
    metrics: {
      air_temp_f: cur.temperature_2m ?? null,
      relative_humidity_pct: cur.relative_humidity_2m ?? null,
    },
    source: "Open-Meteo",
    notes: ["2 m air temperature / RH — not land-surface skin temperature"],
  };
}

export async function soilEngine(): Promise<EngineFrame> {
  // NRCS is mapunit metadata via /api/nrcs-soil; point volumetric moisture needs in-situ sensors
  return {
    engine: "SoilEngine",
    status: "LIVE",
    site: BONEBANK_SITE.name,
    timestamp: new Date().toISOString(),
    metrics: {
      nrcs_proxy: "/api/nrcs-soil",
      in_situ_vwc: null,
    },
    source: "USDA-NRCS SDA (mapunit) + local sensors TBD",
    notes: [
      "Mapunit soil attributes via NRCS SDA",
      "Continuous soil moisture requires on-site transducers (PT network)",
    ],
  };
}

export async function vegetationEngine(): Promise<EngineFrame> {
  return {
    engine: "VegetationEngine",
    status: "UNAVAILABLE",
    site: BONEBANK_SITE.name,
    timestamp: new Date().toISOString(),
    metrics: { ndvi: null },
    source: "none",
    notes: ["No free point NDVI API wired; use USGS/NASA AppEEARS offline if needed"],
  };
}

export async function wildfireEngine(): Promise<EngineFrame> {
  return {
    engine: "WildfireEngine",
    status: "UNAVAILABLE",
    site: BONEBANK_SITE.name,
    timestamp: new Date().toISOString(),
    metrics: { active_fire: null },
    source: "none",
    notes: [
      "Posey County is not a primary wildland-urban interface product zone",
      "Do not invent spread rates",
    ],
  };
}

export async function hydroContextEngine(): Promise<EngineFrame> {
  return {
    engine: "HydroContextEngine",
    status: "LIVE",
    site: BONEBANK_SITE.name,
    timestamp: new Date().toISOString(),
    metrics: {
      usgs_primary: BONEBANK_SITE.usgs_gauge,
      usgs_ohio: BONEBANK_SITE.usgs_gauge_ohio,
      telemetry_route: "/api/usgs-telemetry",
    },
    source: "USGS NWIS IV",
    notes: ["Live dual-gauge path on sovereign server"],
  };
}

/** Particle / sealed HEC-RAS — cannot be completed without PE model files */
export async function hecRasGate(): Promise<EngineFrame> {
  return {
    engine: "HecRasMesh",
    status: "PE_GATED",
    site: BONEBANK_SITE.name,
    timestamp: new Date().toISOString(),
    metrics: { sealed: false },
    source: "data/hec-ras/MANIFEST.json",
    notes: [
      "Attach PE-sealed mesh to clear PE_GATED",
      "GET /api/hec-ras/mesh serves placeholder geometry only",
    ],
  };
}

export async function runAllHazardEngines(): Promise<EngineFrame[]> {
  return Promise.all([
    atmosphericEngine(),
    thermalEngine(),
    soilEngine(),
    vegetationEngine(),
    wildfireEngine(),
    hydroContextEngine(),
    hecRasGate(),
  ]);
}
