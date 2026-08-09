import type { MappingFootprintContract } from './DigitalTwinContracts';

export const NOAA_MAPPING_COORDINATION_SERVICE =
  'https://services2.arcgis.com/C8EMgrsFcRFL6LrL/arcgis/rest/services/US_MappingCoordination_WFL1/FeatureServer';

export const NOAA_MAPPING_COORDINATION_ITEM =
  'https://noaa.maps.arcgis.com/home/item.html?id=f925a51112a64722ab4c869bded0b1ef';

export const NOAA_MAPPING_COORDINATION: MappingFootprintContract & {
  serviceUrl: string;
  itemUrl: string;
} = {
  sourceId: 'noaa-us-mapping-coordination',
  title: 'Map',
  limitation: 'Not for Navigation',
  keywords: ['FY25', 'US Mapping Coordination', 'NOAA', 'IOCM'],
  metadataStandard: 'ISO 19139 Geographic Information - Metadata - Implementation Specification',
  metadataVersion: '2007',
  serviceUrl: NOAA_MAPPING_COORDINATION_SERVICE,
  itemUrl: NOAA_MAPPING_COORDINATION_ITEM,
};

/**
 * ArcGIS REST layer discovery URL. The service is intentionally kept external;
 * raw source geometries are not silently copied into engineering datasets.
 */
export function noaaLayerUrl(layerId = 0): string {
  return `${NOAA_MAPPING_COORDINATION_SERVICE}/${layerId}`;
}

export function noaaQueryUrl(layerId = 0): string {
  return `${noaaLayerUrl(layerId)}/query?where=1%3D1&outFields=*&returnGeometry=true&f=geojson`;
}
