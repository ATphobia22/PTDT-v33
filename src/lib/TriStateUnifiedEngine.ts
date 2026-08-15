/**
 * PTDT v33- TriStateUnifiedEngine
 * Horizontal CRS: EPSG:26916 (NAD83 / UTM zone 16N) primary for project indexing
 * Vertical Datum: NAVD88 (elevations in feet)
 */

export interface SovereignSiteMetrics {
  /** Deprecated: legacy [lat, lon] ordering. Will be removed in future releases. */
  latLon: [number, number];
  /** Explicit mapping coordinate ordering: [lon, lat] */
  coordinates: [number, number];
  address: string;
  parcelApn: string;
  section: string;
  township: string;
  range: string;
  bfeFt: number;
  lagFt: number;
  ffeFt: number;
  bermCrestFt: number;
}

export interface StateComplianceEvaluation {
  jurisdiction: string;
  stageFt: number;
  compliant: boolean;
  status: "COMPLIANT_SAFE" | "WARNING_STAGE" | "CRITICAL_EXCEEDED" | "NOT_EVALUATED";
  notes: string[];
}

export const FALLBACK_BUILDING_HEIGHT_M = 7.2;
export const LEVEL_HEIGHT_M = 3.2;

function parseFiniteNumberLike(value: any): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export class TriStateUnifiedEngine {
  public static readonly SITE: SovereignSiteMetrics = (() => {
    const legacyLatLon: [number, number] = [37.8348, -88.0142]; // [lat, lon]
    const explicitCoordinates: [number, number] = [legacyLatLon[1], legacyLatLon[0]]; // [lon, lat]

    return {
      latLon: legacyLatLon,
      coordinates: explicitCoordinates,
      address: "13101 Bonebank Road, Mount Vernon, IN 47620",
      parcelApn: "65-19-08-100-008.001-010",
      section: "Section 35",
      township: "T7S",
      range: "R14W",
      bfeFt: 375.0,
      lagFt: 377.2,
      ffeFt: 382.5,
      bermCrestFt: 379.8,
    };
  })();

  /**
   * Normalizes building height per Layer 19 extraction specifications.
   * Accepts numeric strings or numbers. Returns fallback when unavailable.
   */
  public static normalizeBuildingHeight(
    rawProperties: Record<string, any>,
    isPrimary = false
  ): { heightMeters: number; method: string } {
    if (isPrimary) {
      return { heightMeters: FALLBACK_BUILDING_HEIGHT_M, method: "deterministic_fallback" };
    }

    const explicitMeters = parseFiniteNumberLike(rawProperties.height_m);
    if (explicitMeters !== null) {
      return { heightMeters: explicitMeters, method: "explicit_height_m" };
    }

    const explicitFeet = parseFiniteNumberLike(rawProperties.height_ft);
    if (explicitFeet !== null) {
      return { heightMeters: explicitFeet * 0.3048, method: "explicit_height_ft_to_m" };
    }

    const levelsValue = parseFiniteNumberLike(rawProperties.levels);
    if (levelsValue !== null) {
      return { heightMeters: levelsValue * LEVEL_HEIGHT_M, method: "levels_heuristic" };
    }

    return { heightMeters: FALLBACK_BUILDING_HEIGHT_M, method: "deterministic_fallback" };
  }

  /**
   * Evaluates state compliance given a water stage.
   * Throws TypeError for invalid numeric inputs.
   */
  public static evaluateJurisdictionalCompliance(
    jurisdiction: "INDIANA" | "ILLINOIS" | "KENTUCKY",
    stageFt: number,
    floodwayDeltaFt?: number
  ): StateComplianceEvaluation {
    if (!Number.isFinite(stageFt)) throw new TypeError("stageFt must be a finite number");
    if (floodwayDeltaFt !== undefined && !Number.isFinite(floodwayDeltaFt)) {
      throw new TypeError("floodwayDeltaFt must be a finite number when provided");
    }

    const evaluation: StateComplianceEvaluation = {
      jurisdiction,
      stageFt,
      compliant: true,
      status: "COMPLIANT_SAFE",
      notes: [],
    };

    const exceedsBfe = stageFt > this.SITE.bfeFt;
    const exceedsLag = stageFt > this.SITE.lagFt;

    if (exceedsLag) {
      evaluation.compliant = false;
      evaluation.status = "CRITICAL_EXCEEDED";
      evaluation.notes.push("Structural inundation: stage exceeds Lowest Adjacent Grade (LAG).");
      // do not return early so floodwayDelta-based notes can also be recorded
    }

    switch (jurisdiction) {
      case "ILLINOIS": {
        if (floodwayDeltaFt !== undefined && floodwayDeltaFt > 0.1) {
          evaluation.compliant = false;
          evaluation.notes.push(
            `Exceeds Illinois floodway delta threshold (17 Ill. Adm. Code 3700): Delta ${floodwayDeltaFt} ft`);
        }

        if (exceedsBfe) {
          evaluation.compliant = false;
          if (evaluation.status !== "CRITICAL_EXCEEDED") evaluation.status = "WARNING_STAGE";
          evaluation.notes.push(`Stage (${stageFt.toFixed(2)} ft) exceeds BFE (${this.SITE.bfeFt} ft NAVD88).`);
        }
        break;
      }

      case "KENTUCKY": {
        if (floodwayDeltaFt !== undefined && floodwayDeltaFt > 0.0) {
          evaluation.compliant = false;
          evaluation.notes.push(
            `Exceeds Kentucky 'no-impact' standard (401 KAR 4:060): Delta ${floodwayDeltaFt} ft`);
        }

        if (exceedsBfe) {
          evaluation.compliant = false;
          if (evaluation.status !== "CRITICAL_EXCEEDED") evaluation.status = "WARNING_STAGE";
          evaluation.notes.push(`Stage (${stageFt.toFixed(2)} ft) exceeds BFE (${this.SITE.bfeFt} ft NAVD88).`);
        }
        break;
      }

      case "INDIANA":
      default: {
        if (exceedsBfe) {
          evaluation.compliant = false;
          // Indiana treats BFE exceedance as critical for structural safety
          evaluation.status = "CRITICAL_EXCEEDED";
          evaluation.notes.push(`Stage (${stageFt.toFixed(2)} ft) exceeds Indiana BFE (${this.SITE.bfeFt} ft NAVD88).`);
        }
        break;
      }
    }

    return evaluation;
  }
}

export default TriStateUnifiedEngine;
