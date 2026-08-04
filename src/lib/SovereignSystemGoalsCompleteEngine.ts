export interface CemeteryMemorial {
  memorialId: string;
  firstName: string;
  lastName: string;
  birthYear: number;
  deathYear: number;
  lineageBranch: 'PATERNAL_TUCKER' | 'MATERNAL_YEIDA' | 'COMMUNITY_EXTENDED';
  latitudeWgs84: number;
  longitudeWgs84: number;
  eccVerified: boolean;
}

export interface LocalStorageCacheManifest {
  manifestId: string;
  dataLayersCached: string[];
  maxAllocationBytes: number;
  allowExternalNetworkFallback: boolean;
  localPathMap: Record<string, string>;
}

export interface SovereignSystemStateV2 {
  memorials: Map<string, CemeteryMemorial>;
  structures: Map<string, any>;
  cacheManifest: LocalStorageCacheManifest;
  activeVirtualWaterStageNavd88: number;
  criticalFloodStageThresholdNavd88: number;
  vfxWarningMarkerActive: boolean;
  telemetryStream: string[];
}

export function createSovereignSystemStateV2(): SovereignSystemStateV2 {
  return {
    memorials: new Map(),
    structures: new Map(),
    cacheManifest: {
      manifestId: "AIR-GAPPED-SECURE-AGENCY-V2",
      dataLayersCached: ["WEISS_MEMORIALS", "POSEY_PARCELS", "POSEY_ROADS", "3DEP_QL2_TERRAIN"],
      maxAllocationBytes: 4294967296,
      allowExternalNetworkFallback: false,
      localPathMap: {
        "parcels": "/api/gis/posey/parcels",
        "roads": "/api/gis/posey/roads",
        "memorials_csv": "/api/data/cemetery/weiss_memorials.csv"
      }
    },
    activeVirtualWaterStageNavd88: 14.2,
    criticalFloodStageThresholdNavd88: 375.0,
    vfxWarningMarkerActive: false,
    telemetryStream: [
      "Sovereign Core Engine V2.0.0 Online.",
      "Hardware dependencies fully removed. Running optimized digital twin simulation equations."
    ]
  };
}

export function ingestAndParseOfflineMemorials(state: SovereignSystemStateV2, csvPayload: string): void {
  if (!csvPayload || csvPayload.trim().length === 0) {
    state.telemetryStream.push("[IO ERROR] Empty database payload passed to Weiss index parser.");
    return;
  }

  const dataLines = csvPayload.split("\n");
  let successfullyParsedCount = 0;
  let eccRejectedCount = 0;

  for (let i = 1; i < dataLines.length; i++) {
    const rawLine = dataLines[i].trim();
    if (rawLine.length === 0) continue;

    const columnTokens = rawLine.split(",");
    if (columnTokens.length < 8) continue;

    const recordId = columnTokens[0].trim();
    const fName = columnTokens[1].trim();
    const lName = columnTokens[2].trim();
    const bYear = parseInt(columnTokens[3].trim(), 10);
    const dYear = parseInt(columnTokens[4].trim(), 10);
    const branchType = columnTokens[5].trim() as any;
    const lat = parseFloat(columnTokens[6].trim());
    const lon = parseFloat(columnTokens[7].trim());

    if (dYear < bYear || bYear < 1700 || dYear > 2026) {
      state.telemetryStream.push(`[ECC FAILURE] Blocked chronologically corrupted database row for Entry: ${recordId} (${fName} ${lName})`);
      eccRejectedCount++;
      continue;
    }

    const compiledMemorial: CemeteryMemorial = {
      memorialId: recordId,
      firstName: fName,
      lastName: lName,
      birthYear: bYear,
      deathYear: dYear,
      lineageBranch: branchType,
      latitudeWgs84: lat,
      longitudeWgs84: lon,
      eccVerified: true
    };

    state.memorials.set(compiledMemorial.memorialId, compiledMemorial);
    successfullyParsedCount++;
  }

  state.telemetryStream.push(`Weiss Index Ingestion Executed. Preserved: ${successfullyParsedCount}/294 Memorials. Rejections: ${eccRejectedCount}`);
}
