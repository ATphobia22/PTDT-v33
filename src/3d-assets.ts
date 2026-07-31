import * as THREE from 'three';

// Mock class for the 3D asset loader as suggested
export class PDT3DAssets {
  createTree(position: [number, number, number], scale: number = 1) {
    const group = new THREE.Group();
    
    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.2 * scale, 0.3 * scale, 1.5 * scale, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: '#5D4037' });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 0.75 * scale;
    group.add(trunk);
    
    // Canopy
    const canopyGeo = new THREE.ConeGeometry(1.2 * scale, 3 * scale, 8);
    const canopyMat = new THREE.MeshStandardMaterial({ color: '#2E7D32' });
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.y = 2.5 * scale;
    group.add(canopy);
    
    group.position.set(...position);
    return group;
  }

  createHouse(position: [number, number, number], scale: number = 1) {
    const group = new THREE.Group();
    
    // Base
    const baseGeo = new THREE.BoxGeometry(4 * scale, 3 * scale, 4 * scale);
    const baseMat = new THREE.MeshStandardMaterial({ color: '#ECEFF1' });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 1.5 * scale;
    group.add(base);
    
    // Roof
    const roofGeo = new THREE.ConeGeometry(3.5 * scale, 2 * scale, 4);
    const roofMat = new THREE.MeshStandardMaterial({ color: '#37474F' });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 4 * scale;
    roof.rotation.y = Math.PI / 4;
    group.add(roof);
    
    group.position.set(...position);
    return group;
  }

  createBarn(position: [number, number, number], scale: number = 1) {
    const group = new THREE.Group();
    
    // Base
    const baseGeo = new THREE.BoxGeometry(6 * scale, 4 * scale, 10 * scale);
    const baseMat = new THREE.MeshStandardMaterial({ color: '#D32F2F' }); // Barn Red
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 2 * scale;
    group.add(base);
    
    // Gambrel Roof (Simplified as a stretched box + prism)
    const roofGeo = new THREE.CylinderGeometry(4 * scale, 4 * scale, 10 * scale, 3);
    const roofMat = new THREE.MeshStandardMaterial({ color: '#455A64' });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 5 * scale;
    roof.rotation.z = Math.PI / 2;
    roof.rotation.x = Math.PI / 2;
    group.add(roof);
    
    group.position.set(...position);
    return group;
  }
}

export const createBerm = (point: THREE.Vector3, height: number, material: string) => {
  const geo = new THREE.CylinderGeometry(1, 1, height, 16);
  const mat = new THREE.MeshStandardMaterial({ color: material === 'soil' ? '#8b5a2b' : '#333333' });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(point);
  mesh.position.y += height / 2;
  return mesh;
};
