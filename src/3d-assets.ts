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

  createLODAsset(type: 'house' | 'barn' | 'tree', position: [number, number, number], scale: number = 1): THREE.LOD {
    const lod = new THREE.LOD();
    
    // Level 0: High Detail (Close)
    const highDetail = this.createDetailedMesh(type, scale, 0);
    lod.addLevel(highDetail, 0);

    // Level 1: Medium Detail (Mid-range)
    const midDetail = this.createDetailedMesh(type, scale, 1);
    lod.addLevel(midDetail, 150);

    // Level 2: Low Detail (Far - Placeholder/Proxy)
    const lowDetail = this.createDetailedMesh(type, scale, 2);
    lod.addLevel(lowDetail, 400);

    lod.position.set(...position);
    return lod;
  }

  private createDetailedMesh(type: 'house' | 'barn' | 'tree', scale: number, detailLevel: number): THREE.Object3D {
    const group = new THREE.Group();
    
    if (type === 'tree') {
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
    }

    return group;
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
