import * as THREE from 'three';

export class PDT3DAssets {
  private materialCache: Map<string, THREE.Material> = new Map();

  private getMaterial(color: string, wireframe: boolean = false): THREE.Material {
    const key = `${color}-${wireframe}`;
    if (!this.materialCache.has(key)) {
      this.materialCache.set(key, new THREE.MeshStandardMaterial({ color, wireframe }));
    }
    return this.materialCache.get(key)!;
  }

  createLODAsset(type: 'house' | 'barn' | 'tree' | 'road', position: [number, number, number], scale: number = 1, rotation: number = 0): THREE.LOD {
    const lod = new THREE.LOD();
    
    // Level 0: High Detail (Close)
    const highDetail = this.createDetailedMesh(type, scale, 0);
    highDetail.rotation.y = rotation;
    lod.addLevel(highDetail, 0);

    // Level 1: Medium Detail (Mid-range)
    const midDetail = this.createDetailedMesh(type, scale, 1);
    midDetail.rotation.y = rotation;
    lod.addLevel(midDetail, 100);

    // Level 2: Low Detail (Far - Placeholder/Proxy)
    const lowDetail = this.createDetailedMesh(type, scale, 2);
    lowDetail.rotation.y = rotation;
    lod.addLevel(lowDetail, 300);

    lod.position.set(...position);
    return lod;
  }

  private createDetailedMesh(type: 'house' | 'barn' | 'tree' | 'road', scale: number, detailLevel: number): THREE.Object3D {
    const group = new THREE.Group();
    
    if (type === 'tree') {
      // ... (existing tree logic)
      const segments = detailLevel === 0 ? 12 : (detailLevel === 1 ? 6 : 4);
      
      const trunkGeo = new THREE.CylinderGeometry(0.2 * scale, 0.3 * scale, 1.5 * scale, segments);
      const trunk = new THREE.Mesh(trunkGeo, this.getMaterial('#5D4037'));
      trunk.position.y = 0.75 * scale;
      group.add(trunk);
      
      const canopyGeo = new THREE.ConeGeometry(1.2 * scale, 3 * scale, segments);
      const canopy = new THREE.Mesh(canopyGeo, this.getMaterial('#2E7D32'));
      canopy.position.y = 2.5 * scale;
      group.add(canopy);
    } else if (type === 'house') {
      // ... (existing house logic)
      const baseGeo = new THREE.BoxGeometry(4 * scale, 3 * scale, 4 * scale);
      const base = new THREE.Mesh(baseGeo, this.getMaterial('#ECEFF1'));
      base.position.y = 1.5 * scale;
      group.add(base);
      
      if (detailLevel < 2) {
        const roofGeo = new THREE.ConeGeometry(3.5 * scale, 2 * scale, 4);
        const roof = new THREE.Mesh(roofGeo, this.getMaterial('#37474F'));
        roof.position.y = 4 * scale;
        roof.rotation.y = Math.PI / 4;
        group.add(roof);
      }
    } else if (type === 'barn') {
      // ... (existing barn logic)
      const baseGeo = new THREE.BoxGeometry(6 * scale, 4 * scale, 10 * scale);
      const base = new THREE.Mesh(baseGeo, this.getMaterial('#D32F2F'));
      base.position.y = 2 * scale;
      group.add(base);
      
      if (detailLevel < 2) {
        const roofGeo = new THREE.CylinderGeometry(4 * scale, 4 * scale, 10 * scale, 3);
        const roof = new THREE.Mesh(roofGeo, this.getMaterial('#455A64'));
        roof.position.y = 5 * scale;
        roof.rotation.z = Math.PI / 2;
        roof.rotation.x = Math.PI / 2;
        group.add(roof);
      }
    } else if (type === 'road') {
      // If we had coordinates here, we'd use TubeGeometry.
      // Since we're using a generic segment, we'll keep the plane for now
      // but styled better.
      const width = 6 * scale;
      const length = 10 * scale;
      const roadGeo = new THREE.PlaneGeometry(width, length);
      const roadMat = this.getMaterial('#334155'); // Asphalt Slate
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.rotation.x = -Math.PI / 2; // Flat on ground
      group.add(road);

      if (detailLevel === 0) {
        // Add road markings
        const stripeGeo = new THREE.PlaneGeometry(0.4 * scale, 2 * scale);
        const stripeMat = this.getMaterial('#FDE047'); // Yellow
        const stripe = new THREE.Mesh(stripeGeo, stripeMat);
        stripe.position.y = 0.05;
        stripe.rotation.x = -Math.PI / 2;
        group.add(stripe);
      }
    }

    return group;
  }

  createRoadSpline(points: THREE.Vector3[], scale: number = 1): THREE.Object3D {
    if (points.length < 2) return new THREE.Group();
    
    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.TubeGeometry(curve, 20, 3 * scale, 8, false);
    const material = this.getMaterial('#334155');
    const mesh = new THREE.Mesh(geometry, material);
    
    return mesh;
  }

  // Legacy support for older calls
  createTree(pos: [number, number, number], scale: number = 1) { return this.createLODAsset('tree', pos, scale); }
  createHouse(pos: [number, number, number], scale: number = 1) { return this.createLODAsset('house', pos, scale); }
  createBarn(pos: [number, number, number], scale: number = 1) { return this.createLODAsset('barn', pos, scale); }
}

export const createBerm = (point: THREE.Vector3, height: number, material: string) => {
  const geo = new THREE.CylinderGeometry(1, 1, height, 16);
  const mat = new THREE.MeshStandardMaterial({ color: material === 'soil' ? '#8b5a2b' : '#333333' });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(point);
  mesh.position.y += height / 2;
  return mesh;
};
