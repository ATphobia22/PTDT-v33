import * as gisService from '../services/gisService';

export interface StandardizedFeature {
  id: string;
  type: 'house' | 'barn' | 'tree' | 'road' | 'water' | 'historic';
  coordinates: [number, number] | [number, number][];
  properties: any;
}

export interface RegionData {
  features: StandardizedFeature[];
  fema: any;
  historic: any;
  dnr: any;
  legislative: any;
}

export class GeoSpatialDataStreamer {
  private cache: Map<string, RegionData> = new Map();

  async fetchRegionData(bbox: [number, number, number, number]): Promise<RegionData> {
    const cacheKey = bbox.map(v => v.toFixed(3)).join(',');
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey)!;

    try {
      const [fema, historic, dnr, legislative] = await Promise.all([
        gisService.fetchFemaFloodZones(bbox),
        gisService.fetchIndianaHistoricSites(bbox),
        gisService.fetchDnrFloodplain(bbox),
        gisService.fetchStateLegislativeDistricts(bbox)
      ]);

      const features: StandardizedFeature[] = [];

      // Process Historic Sites (Points)
      if (historic?.features) {
        historic.features.forEach((f: any, i: number) => {
          features.push({
            id: `historic-${i}-${f.properties.OBJECTID || i}`,
            type: 'historic',
            coordinates: f.geometry.coordinates as [number, number],
            properties: f.properties
          });
        });
      }

      // Process FEMA/DNR (Polygons/Points)
      [fema, dnr].forEach((source, sIdx) => {
        if (source?.features) {
          source.features.forEach((f: any, i: number) => {
            const type = sIdx === 0 ? 'water' : 'barn'; // Abstracting DNR as potentially agricultural context for now
            features.push({
              id: `gis-${sIdx}-${i}`,
              type: type as any,
              coordinates: f.geometry.coordinates,
              properties: f.properties
            });
          });
        }
      });

      const regionData: RegionData = {
        features,
        fema,
        historic,
        dnr,
        legislative
      };

      // Limit cache size
      if (this.cache.size > 50) {
        const firstKey = this.cache.keys().next().value;
        if (firstKey) this.cache.delete(firstKey);
      }

      this.cache.set(cacheKey, regionData);
      return regionData;
    } catch (error) {
      console.error('Error streaming geospatial data:', error);
      return { features: [], fema: null, historic: null, dnr: null, legislative: null };
    }
  }
}

export const dataStreamer = new GeoSpatialDataStreamer();
