import { queryArcGISLayer, type ArcGISFeatureCollection } from './ArcGISSpatialQuery';
import type { MappingFootprintContext } from './EngineeringContextGraph';

export const NOAA_MAPPING_COORDINATION = 'https://services2.arcgis.com/C8EMgrsFcRFL6LrL/ArcGIS/rest/services/US_MappingCoordination_WFL1/FeatureServer';

export interface NoaaFootprint {
  id: string | number;
  geometry: unknown;
  attributes: Record<string, unknown>;
}

export async function queryNoaaFootprints(
  layerUrl: string,
  options: Parameters<typeof queryArcGISLayer>[1],
  signal?: AbortSignal,
): Promise<NoaaFootprint[]> {
  const collection: ArcGISFeatureCollection = await queryArcGISLayer(layerUrl, options, signal);
  return collection.features.map((feature, index) => {
    const properties = (feature.properties ?? {}) as Record<string, unknown>;
    const id = properties.OBJECTID ?? properties.ObjectID ?? properties.FID ?? index;
    return { id: id as string | number, geometry: feature.geometry, attributes: properties };
  });
}

export function toMappingContext(footprint: NoaaFootprint): MappingFootprintContext {
  return {
    sourceId: 'noaa-us-mapping-coordination',
    limitation: 'Not for Navigation',
    footprintId: footprint.id,
    geometry: footprint.geometry,
    attributes: footprint.attributes,
  };
}
