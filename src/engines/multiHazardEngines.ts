/**
 * Multi-hazard engine stubs — roadmap from product recommendations
 * (Atmospheric / Thermal / Soil / Vegetation / Wildfire + cinematic pipelines).
 *
 * These are ZERO-COMPUTE stubs that expose a stable interface for future
 * physics modules. They do NOT claim calibrated wildfire/drought products
 * or PE-grade hydrodynamic particle results until models are attached.
 */

import { BONEBANK_SITE } from "../lib/siteConstants";

export type EngineStatus = "STUB" | "SEEDED" | "CALIBRATED";

export interface EngineFrame {
  engine: string;
  status: EngineStatus;
  site: string;
  timestamp: string;
  metrics: Record<string, number | string | boolean>;
  notes: string[];
}

function base(engine: string, metrics: Record<string, number | string | boolean>, notes: string[]): EngineFrame {
  return {
    engine,
    status: "STUB",
    site: BONEBANK_SITE.name,
    timestamp: new Date().toISOString(),
    metrics,
    notes,
  };
}

/** Sky / insolation placeholder — no radiative transfer yet */
export function atmosphericEngine(): EngineFrame {
  return base(
    "AtmosphericEngine",
    { sun_elevation_deg: 45, cloud_fraction: 0.3 },
    ["Sky scattering / volumetric clouds not simulated — stub only"]
  );
}

/** Heat / drought index placeholder */
export function thermalEngine(): EngineFrame {
  return base(
    "ThermalEngine",
    { land_surface_temp_c_seed: 28, drought_index_seed: 0.2 },
    ["Not NLDAS/gridMET calibrated — UI layer only"]
  );
}

/** Soil moisture / runoff coupling placeholder */
export function soilEngine(): EngineFrame {
  return base(
    "SoilEngine",
    { soil_moisture_frac: 0.35, infiltration_mm_hr_seed: 5 },
    ["Couple to PySWMM when attached"]
  );
}

/** Vegetation / NDVI placeholder */
export function vegetationEngine(): EngineFrame {
  return base(
    "VegetationEngine",
    { ndvi_seed: 0.55, canopy_height_m_seed: 8 },
    ["No live NDVI feed — stub"]
  );
}

/** Wildfire spread placeholder — Posey is low wildland-urban vs western US */
export function wildfireEngine(): EngineFrame {
  return base(
    "WildfireEngine",
    { fuel_load_seed: 0.1, spread_rate_mph_seed: 0, active: false },
    ["Illustrative only; not a fire-behavior model"]
  );
}

/** Hydro particle / SPH-style placeholder — not DualSPHysics */
export function hydroParticleEngine(): EngineFrame {
  return base(
    "HydroParticleEngine",
    { particle_count: 0, solver: "NONE" },
    ["Particle hydrodynamics not linked; use Archimedes / future HEC-RAS mesh"]
  );
}

export function runAllHazardEngines(): EngineFrame[] {
  return [
    atmosphericEngine(),
    thermalEngine(),
    soilEngine(),
    vegetationEngine(),
    wildfireEngine(),
    hydroParticleEngine(),
  ];
}
