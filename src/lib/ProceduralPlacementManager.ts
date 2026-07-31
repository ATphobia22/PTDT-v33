import * as THREE from 'three';
import maplibregl from 'maplibre-gl';
import { PDT3DAssets } from '../3d-assets';

export class ProceduralPlacementManager {
  private loader: PDT3DAssets;
  private scene: THREE.Scene;
  private map: maplibregl.Map;
  private placedFeatures: Set<string> = new Set();
  private maxAssets: number = 3000;

  constructor(scene: THREE.Scene, map: maplibregl.Map) {
    this.loader = new PDT3DAssets();
    this.scene = scene;
    this.map = map;
  }

  update(features: maplibregl.MapGeoJSONFeature[]) {
    features.forEach(feature => {
      const id = feature.id || `${feature.layer.id}-${JSON.stringify(feature.properties)}`;
      if (this.placedFeatures.has(id.toString())) return;

      let type: 'house' | 'barn' | 'tree' | 'road' | null = null;
      if (feature.layer.id === '3d-houses') type = 'house';
      else if (feature.layer.id === '3d-barns') type = 'barn';
      else if (feature.layer.id === '3d-canopy') type = 'tree';
      else if (feature.layer.id === '3d-roads-highspeed') type = 'road';

      if (!type) return;

      const getElevation = (lngLat: [number, number]) => {
        return (this.map as any).queryTerrainElevation ? (this.map as any).queryTerrainElevation(lngLat) : 0;
      };

      if (feature.geometry.type === 'Point') {
        const coords = (feature.geometry as any).coordinates;
        if (type !== 'road') this.placeAsset(type, coords, getElevation(coords), id.toString());
      } else if (feature.geometry.type === 'LineString' && type === 'road') {
        const coords = (feature.geometry as any).coordinates;
        this.placeRoadSpline(coords, getElevation(coords[0]), id.toString());
      } else if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
        const coords = feature.geometry.type === 'Polygon' 
          ? (feature.geometry as any).coordinates[0][0] 
          : (feature.geometry as any).coordinates[0][0][0];
        if (type !== 'road') this.placeAsset(type, coords, getElevation(coords), id.toString());
      }
    });

    this.cleanup();
  }

  public placeAsset(type: 'house' | 'barn' | 'tree', lngLat: [number, number], elevation: number, id: string) {
    const scale = type === 'tree' ? 0.8 + Math.random() : 1;
    const rotation = Math.random() * Math.PI;
    const asset = this.loader.createLODAsset(type, [0, 0, 0], scale, rotation);
    asset.userData = { lngLat, elevation, id };
    this.scene.add(asset);
    this.placedFeatures.add(id);
  }

  private placeRoadSpline(lngLatPoints: [number, number][], elevation: number, id: string) {
    const points = lngLatPoints.map(() => new THREE.Vector3(0, 0, 0));
    const road = this.loader.createRoadSpline(points, 0.6);
    road.userData = { lngLatPoints, elevation, id };
    this.scene.add(road);
    this.placedFeatures.add(id);
  }

  private cleanup() {
    if (this.scene.children.length > this.maxAssets) {
      const center = this.map.getCenter();
      const childrenWithDist = this.scene.children
        .filter(c => c.userData.id)
        .map(c => {
          const p = c.userData.lngLat || (c.userData.lngLatPoints ? c.userData.lngLatPoints[0] : [0,0]);
          const dx = p[0] - center.lng;
          const dy = p[1] - center.lat;
          return { child: c, distSq: dx*dx + dy*dy };
        })
        .sort((a, b) => b.distSq - a.distSq);

      const toRemove = childrenWithDist.slice(0, childrenWithDist.length - this.maxAssets);
      toRemove.forEach(item => {
        this.placedFeatures.delete(item.child.userData.id);
        this.scene.remove(item.child);
      });
    }
  }

  render(camera: THREE.Camera) {
    this.scene.children.forEach((child: any) => {
      if (child.userData.lngLat) {
        const coord = maplibregl.MercatorCoordinate.fromLngLat(child.userData.lngLat, child.userData.elevation || 0);
        const l = new THREE.Matrix4()
          .makeTranslation(coord.x, coord.y, coord.z || 0)
          .scale(new THREE.Vector3(coord.meterInMercatorCoordinateUnits(), -coord.meterInMercatorCoordinateUnits(), coord.meterInMercatorCoordinateUnits()))
          .multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2));
        
        child.matrixAutoUpdate = false;
        child.matrix = l;

        if (child instanceof THREE.LOD) {
          child.update(camera);
        }
      } else if (child.userData.lngLatPoints) {
        const coord = maplibregl.MercatorCoordinate.fromLngLat(child.userData.lngLatPoints[0], child.userData.elevation || 0);
        const l = new THREE.Matrix4()
          .makeTranslation(coord.x, coord.y, coord.z || 0)
          .scale(new THREE.Vector3(coord.meterInMercatorCoordinateUnits(), -coord.meterInMercatorCoordinateUnits(), coord.meterInMercatorCoordinateUnits()))
          .multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2));
        child.matrixAutoUpdate = false;
        child.matrix = l;
      }
    });
  }
}
