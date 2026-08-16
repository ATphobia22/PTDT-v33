export interface BBox { xmin: number; ymin: number; xmax: number; ymax: number; }

export interface ArcGISQueryOptions {
  serviceUrl: string;
  layerId: number;
  bbox: BBox;
  where?: string;
  outFields: string[];
  resultRecordCount?: number;
  outSR?: number;
}

/**
 * NOAA IOCM footprints are contextual metadata only.
 * This adapter intentionally limits geometry, fields, and feature count.
 */
export async function queryNOAAFootprints(options: ArcGISQueryOptions): Promise<unknown> {
  const params = new URLSearchParams({
    f: 'json',
    where: options.where ?? '1=1',
    outFields: options.outFields.join(','),
    geometry: `${options.bbox.xmin},${options.bbox.ymin},${options.bbox.xmax},${options.bbox.ymax}`,
    geometryType: 'esriGeometryEnvelope',
    spatialRel: 'esriSpatialRelIntersects',
    inSR: String(options.outSR ?? 4326),
    outSR: String(options.outSR ?? 4326),
    returnGeometry: 'true',
    resultRecordCount: String(options.resultRecordCount ?? 100),
  });

  const url = `${options.serviceUrl.replace(/\/$/, '')}/${options.layerId}/query?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`ArcGIS query failed: HTTP ${response.status}`);
  const body = await response.json();
  if (body.error) throw new Error(`ArcGIS query failed: ${body.error.message ?? 'unknown error'}`);
  return body;
}
