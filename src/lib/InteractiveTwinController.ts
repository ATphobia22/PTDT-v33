/**
 * Interactive Twin Controller — public API for the real-time CGI 3D experience.
 * Call attachInteractiveTwin(map) after map 'load' to replace headless Blender workflow.
 */
import type { Map as MaplibreMap } from "maplibre-gl";
import { BONEBANK_SITE } from "./siteConstants";

// Assuming these exist or will be created based on OCR
// For now, I'll provide placeholders or implement them if I find them in OCR.

export type WeatherMode = "clear" | "mist" | "rain";

export interface FloodCell {
  lon: number;
  lat: number;
  depth_m: number;
}

export interface TwinSession {
  map: MaplibreMap;
  detach: () => void;
  setFloodCells: (cells: FloodCell[]) => void;
  flyHome: () => void;
  setPitch: (pitch: number) => void;
  setDayNight: (t: number) => void;
  setWeather: (w: WeatherMode) => void;
  setParticles: (on: boolean) => void;
  setCinematicOrbit: (on: boolean) => void;
  getCgiState: () => any | null;
  playCinematicIntro: () => void;
  syncFromUsgs: () => Promise<void>;
}

const LAYER_ID = "ptdt-realtime-twin";

export function attachInteractiveTwin(
  map: MaplibreMap,
  options?: {
    floodCells?: FloodCell[];
    particles?: boolean;
    virtualBackground?: boolean;
    particleDensity?: number;
    dayNight?: number;
    weather?: WeatherMode;
    cinematicOrbit?: boolean;
  }
): TwinSession {
  // Placeholder implementation based on OCR structure
  
  const detach = () => {
    if (map.getLayer(LAYER_ID)) map.removeLayer(LAYER_ID);
  };

  const setFloodCells = (cells: FloodCell[]) => {
    console.log("Setting flood cells", cells);
  };

  const flyHome = () => {
    map.easeTo({
      center: BONEBANK_SITE.center as [number, number],
      zoom: 17,
      pitch: 62,
      bearing: -18,
      duration: 1800,
    });
  };

  const setPitch = (pitch: number) => {
    map.easeTo({ pitch, duration: 600 });
  };

  const syncFromUsgs = async () => {
    try {
      const res = await fetch("/api/gis/usgs/wabash");
      if (!res.ok) return;
      const data = await res.json();
      console.log("USGS Data", data);
      // Implementation logic from OCR page 17
    } catch (e) {
      console.warn("[Twin] syncFromUsgs", e);
    }
  };

  return {
    map,
    detach,
    setFloodCells,
    flyHome,
    setPitch,
    setDayNight: (t) => console.log("Set DayNight", t),
    setWeather: (w) => console.log("Set Weather", w),
    setParticles: (on) => console.log("Set Particles", on),
    setCinematicOrbit: (on) => console.log("Set Cinematic Orbit", on),
    getCgiState: () => null,
    playCinematicIntro: () => {
      map.easeTo({
        center: BONEBANK_SITE.center as [number, number],
        zoom: 15.5,
        pitch: 45,
        bearing: 0,
        duration: 2000,
      });
    },
    syncFromUsgs,
  };
}

export default attachInteractiveTwin;
