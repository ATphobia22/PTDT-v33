import * as THREE from 'three';

// A simple projection from Lon/Lat to Scene Coordinates
// Centered roughly on Point Township, IN (Posey County)
export const SCENE_ORIGIN = { lon: -88.0, lat: 37.9 };
export const SCALE = 15000; // Adjust for scene scale

export function projectLonLat(lon: number, lat: number): THREE.Vector3 {
  const dx = (lon - SCENE_ORIGIN.lon) * Math.cos(SCENE_ORIGIN.lat * Math.PI / 180);
  const dz = lat - SCENE_ORIGIN.lat;
  
  return new THREE.Vector3(dx * SCALE, 0, -dz * SCALE); // -dz because Z goes negative "up" on map
}

export function createPolygonMesh(coordinates: number[][][], color: number, height: number = 0, opacity: number = 0.5): THREE.Mesh {
  const shape = new THREE.Shape();
  
  const points = coordinates[0]; // Outer ring
  for (let i = 0; i < points.length; i++) {
    const projected = projectLonLat(points[i][0], points[i][1]);
    if (i === 0) {
      shape.moveTo(projected.x, projected.z);
    } else {
      shape.lineTo(projected.x, projected.z);
    }
  }

  // Handle holes (subsequent rings)
  for (let j = 1; j < coordinates.length; j++) {
    const holePath = new THREE.Path();
    const holePoints = coordinates[j];
    for (let i = 0; i < holePoints.length; i++) {
      const projected = projectLonLat(holePoints[i][0], holePoints[i][1]);
      if (i === 0) {
        holePath.moveTo(projected.x, projected.z);
      } else {
        holePath.lineTo(projected.x, projected.z);
      }
    }
    shape.holes.push(holePath);
  }

  const geometry = new THREE.ShapeGeometry(shape);
  geometry.rotateX(Math.PI / 2); // Rotate to lie flat on XZ plane
  
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    side: THREE.DoubleSide,
    depthWrite: false
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = height;
  return mesh;
}

export function parseGeoJSONToGroup(geojson: any, colorMap: (feature: any) => number, height: number = 0): THREE.Group {
  const group = new THREE.Group();

  if (!geojson || !geojson.features) return group;

  for (const feature of geojson.features) {
    if (!feature.geometry) continue;

    const color = colorMap(feature);

    if (feature.geometry.type === 'Polygon') {
      const mesh = createPolygonMesh(feature.geometry.coordinates, color, height);
      group.add(mesh);
    } else if (feature.geometry.type === 'MultiPolygon') {
      for (const coords of feature.geometry.coordinates) {
        const mesh = createPolygonMesh(coords, color, height);
        group.add(mesh);
      }
    } else if (feature.geometry.type === 'Point') {
        const pos = projectLonLat(feature.geometry.coordinates[0], feature.geometry.coordinates[1]);
        const geom = new THREE.CylinderGeometry(1, 0, 5, 8);
        const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.5 });
        const mesh = new THREE.Mesh(geom, mat);
        mesh.position.set(pos.x, height + 2.5, pos.z);
        group.add(mesh);
    }
  }

  return group;
}
