import * as gisService from '../services/gisService';

export interface StandardizedFeature {
  id: string;
  type: 'house' | 'barn' | 'tree' | 'road' | 'water' | 'historic';
  coordinates: [number, number];
  properties: any;
}

export class GeoSpatialDataStreamer {
  private cache: Map<string, StandardizedFeature[]> = new Map();

  async fetchRegionData(bbox: [number, number, number, number]): Promise<StandardizedFeature[]> {
    const cacheKey = bbox.join(',');
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey)!;

    try {
      const [fema, historic, dnr] = await Promise.all([
        gisService.fetchFemaFloodZones(bbox),
        gisService.fetchIndianaHistoricSites(bbox),
        gisService.fetchDnrFloodplain(bbox)
      ]);

      const features: StandardizedFeature[] = [];

      // Process Historic Sites
      if (historic?.features) {
        historic.features.forEach((f: any, i: number) => {
          features.push({
            id: `historic-${i}`,
            type: 'historic',
            coordinates: f.geometry.coordinates as [number, number],
            properties: f.properties
          });
        });
      }

      // Process DNR (as water/flood context)
      if (dnr?.features) {
        dnr.features.forEach((f: any, i: number) => {
          if (f.geometry.type === 'Point') {
            features.push({
              id: `dnr-${i}`,
              type: 'water',
              coordinates: f.geometry.coordinates as [number, number],
              properties: f.properties
            });
          }
        });
      }

      this.cache.set(cacheKey, features);
      return features;
    } catch (error) {
      console.error('Error streaming geospatial data:', error);
      return [];
    }
  }
}

export const dataStreamer = new GeoSpatialDataStreamer();
