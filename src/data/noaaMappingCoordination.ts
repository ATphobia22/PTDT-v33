export const NOAA_MAPPING_COORDINATION_SERVICE =
  'https://services2.arcgis.com/C8EMgrsFcRFL6LrL/arcgis/rest/services/US_MappingCoordination_WFL1/FeatureServer';

export const NOAA_MAPPING_COORDINATION_ITEM =
  'https://noaa.maps.arcgis.com/home/item.html?id=f925a51112a64722ab4c869bded0b1ef';

export const NOAA_MAPPING_COORDINATION_DASHBOARD_ITEM =
  'https://noaa.maps.arcgis.com/home/item.html?id=004bd1be64664bab9e1f47bed5f58572';

export const INMAP_MAPPING_DASHBOARD =
  'https://inmap.maps.arcgis.com/apps/dashboards/10d377fea85d4a8a8a378617766d9f92';

export const NOAA_MAPPING_COORDINATION_METADATA = Object.freeze({
  standard: 'ISO 19139 Geographic Information - Metadata - Implementation Specification',
  version: '2007',
  characterSet: 'utf8',
  scope: 'dataset',
  keywords: ['FY25', 'US Mapping Coordination', 'NOAA', 'IOCM'] as const,
  limitationOfUse: 'Not for Navigation',
});

export interface ArcGISServiceInfo {
  name?: string;
  serviceDescription?: string;
  capabilities?: string;
  layers?: readonly { id: number; name: string; type?: string }[];
  tables?: readonly { id: number; name: string }[];
}

export interface ArcGISLayerInfo {
  id: number;
  name: string;
  type?: string;
  geometryType?: string;
  maxRecordCount?: number;
  supportedQueryFormats?: string;
  fields?: readonly { name: string; alias?: string; type?: string }[];
}

export function noaaLayerUrl(layerId: number): string {
  return `${NOAA_MAPPING_COORDINATION_SERVICE}/${layerId}`;
}

export function noaaQueryUrl(
  layerId: number,
  options: {
    where?: string;
    outFields?: string;
    outSR?: number;
    resultRecordCount?: number;
    resultOffset?: number;
  } = {},
): string {
  const params = new URLSearchParams({
    where: options.where ?? '1=1',
    outFields: options.outFields ?? '*',
    returnGeometry: 'true',
    f: 'geojson',
  });
  if (options.outSR !== undefined) params.set('outSR', String(options.outSR));
  if (options.resultRecordCount !== undefined) params.set('resultRecordCount', String(options.resultRecordCount));
  if (options.resultOffset !== undefined) params.set('resultOffset', String(options.resultOffset));
  return `${noaaLayerUrl(layerId)}/query?${params.toString()}`;
}

export async function discoverNoaaService(signal?: AbortSignal): Promise<ArcGISServiceInfo> {
  const response = await fetch(`${NOAA_MAPPING_COORDINATION_SERVICE}?f=json`, { signal });
  if (!response.ok) throw new Error(`NOAA ArcGIS service discovery failed: HTTP ${response.status}`);
  return (await response.json()) as ArcGISServiceInfo;
}

export async function discoverNoaaLayer(layerId: number, signal?: AbortSignal): Promise<ArcGISLayerInfo> {
  const response = await fetch(`${noaaLayerUrl(layerId)}?f=json`, { signal });
  if (!response.ok) throw new Error(`NOAA ArcGIS layer discovery failed: HTTP ${response.status}`);
  return (await response.json()) as ArcGISLayerInfo;
}
