/**
 * SOVEREIGN CALCULUS ENGINE
 * Scientific Hydro-Subsurface Calculus Engine and Volumetric Profiler.
 * Computes customized trapezoidal line integrals based on true 3DEP QL2 LiDAR DEM elevations.
 */

export interface DesignProfileParameters {
  crestWidthFt: number;
  embankmentSideSlopeRatio: number; // e.g. 3 for 3H:1V
  targetCeilingElevationNavd88: number;
}

export interface VolumetricReportOutput {
  calculatedLengthLinearFt: number;
  computedMaximumFootprintWidthFt: number;
  meanExcavationHeightFt: number;
  totalVolumeRequiredCubicFeet: number;
  totalVolumeRequiredCubicYards: number;
}

export interface CemeteryIndexRecord {
  memorialId: string;
  surName: string;
  givenName: string;
  birthYear: number;
  deathYear: number;
  lineageTrackingGroup: 'PATERNAL_TUCKER' | 'MATERNAL_YEIDA' | 'COMMUNITY_EXTENDED';
  latitudeWgs84: number;
  longitudeWgs84: number;
}

export class SovereignCalculusEngine {
  private localFeetPerDegreeLon = 286745.4;
  private localFeetPerDegreeLat = 364173.2;

  /**
   * Proves micro-topographic volumetric precision outputs across vector profiles lines.
   */
  public computeTrapezoidalLineIntegral(
    pathPointsCoordinates: [number, number][],
    groundElevationsNavd88: number[],
    config: DesignProfileParameters
  ): VolumetricReportOutput {
    if (pathPointsCoordinates.length < 2 || groundElevationsNavd88.length !== pathPointsCoordinates.length) {
      throw new Error("Calculus Engine Matrix Boundary Failure: Inconsistent path vector length properties.");
    }

    let accumulatedDistanceFeet = 0;
    let integratedVolumeCubicFeet = 0;
    let peakFootprintWidthFeet = 0;
    let verticalCutDepthSum = 0;

    for (let i = 0; i < pathPointsCoordinates.length - 1; i++) {
      const segmentStart = pathPointsCoordinates[i];
      const segmentEnd = pathPointsCoordinates[i + 1];

      const deltaX = (segmentEnd[0] - segmentStart[0]) * this.localFeetPerDegreeLon;
      const deltaY = (segmentEnd[1] - segmentStart[1]) * this.localFeetPerDegreeLat;
      const sliceDistanceFeet = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      accumulatedDistanceFeet += sliceDistanceFeet;

      const startGroundElev = groundElevationsNavd88[i];
      const endGroundElev = groundElevationsNavd88[i + 1];
      const sliceMeanGroundElev = (startGroundElev + endGroundElev) / 2;

      const designCutHeight = config.targetCeilingElevationNavd88 - sliceMeanGroundElev;
      const verifiedHeight = Math.max(0, designCutHeight);
      verticalCutDepthSum += verifiedHeight;

      // Section Area = Height * (CrestWidth + (SideSlope * Height))
      const sectionAreaSquareFeet = verifiedHeight * (config.crestWidthFt + (config.embankmentSideSlopeRatio * verifiedHeight));
      integratedVolumeCubicFeet += sectionAreaSquareFeet * sliceDistanceFeet;

      const sliceBaseWidthFeet = config.crestWidthFt + (2.0 * config.embankmentSideSlopeRatio * verifiedHeight);
      if (sliceBaseWidthFeet > peakFootprintWidthFeet) {
        peakFootprintWidthFeet = sliceBaseWidthFeet;
      }
    }

    const segmentsCount = pathPointsCoordinates.length - 1;
    const finalVolumeCubicYards = integratedVolumeCubicFeet / 27.0;

    return {
      calculatedLengthLinearFt: Number(accumulatedDistanceFeet.toFixed(2)),
      computedMaximumFootprintWidthFt: Number(peakFootprintWidthFeet.toFixed(2)),
      meanExcavationHeightFt: Number((verticalCutDepthSum / segmentsCount).toFixed(2)),
      totalVolumeRequiredCubicFeet: Number(integratedVolumeCubicFeet.toFixed(2)),
      totalVolumeRequiredCubicYards: Number(finalVolumeCubicYards.toFixed(1))
    };
  }

  /**
   * Data Ingestion Matrix Core for Cemetery Memorials.
   */
  public processWeissCemeteryIndexRecords(rawDatabaseString: string): Map<string, CemeteryIndexRecord> {
    const memoryRegistryMap = new Map<string, CemeteryIndexRecord>();
    if (!rawDatabaseString || rawDatabaseString.trim().length === 0) return memoryRegistryMap;

    const databaseRows = rawDatabaseString.split("\n");
    for (let rowIdx = 1; rowIdx < databaseRows.length; rowIdx++) {
      const cleanLine = databaseRows[rowIdx].trim();
      if (cleanLine.length === 0) continue;
      const tokens = cleanLine.split(",");
      if (tokens.length < 8) continue;

      const uid = tokens[0].trim();
      const sName = tokens[1].trim();
      const gName = tokens[2].trim();
      const birth = parseInt(tokens[3].trim(), 10);
      const death = parseInt(tokens[4].trim(), 10);
      const group = tokens[5].trim() as any;
      const lat = parseFloat(tokens[6].trim());
      const lon = parseFloat(tokens[7].trim());

      if (death < birth || birth < 1700 || death > 2026) {
        console.warn(`[ECC REJECTION DETECTED] Dropped chronologically invalid record: ${uid}`);
        continue;
      }

      memoryRegistryMap.set(uid, {
        memorialId: uid,
        surName: sName,
        givenName: gName,
        birthYear: birth,
        deathYear: death,
        lineageTrackingGroup: group,
        latitudeWgs84: lat,
        longitudeWgs84: lon
      });
    }
    return memoryRegistryMap;
  }
}
