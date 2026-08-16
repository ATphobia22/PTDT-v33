import * as THREE from 'three';
import { SITE } from '../lib/elevationCheck';

export interface TerrainDisplacementOptions {
  size?: number;
  resolution?: number;
  heightScaleFt?: number;
  heightOffsetFt?: number;
  centerY?: number;
}

export async function loadHeightTexture(url = '/tiles/posey_height_preview.png'): Promise<THREE.Texture> {
  const loader = new THREE.TextureLoader();
  const texture = await loader.loadAsync(url);
  texture.colorSpace = THREE.NoColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

export function createDemTerrain(
  heightTexture: THREE.Texture,
  options: TerrainDisplacementOptions = {},
): THREE.Mesh {
  const size = options.size ?? 10000;
  const resolution = options.resolution ?? 256;
  const heightScale = options.heightScaleFt ?? SITE.default_height_scale_ft;
  const heightOffset = options.heightOffsetFt ?? SITE.default_height_offset_ft;
  const centerY = options.centerY ?? 0;

  const geometry = new THREE.PlaneGeometry(size, size, resolution, resolution);
  geometry.rotateX(-Math.PI / 2);

  const image = heightTexture.image as HTMLImageElement | ImageBitmap | undefined;
  if (!image) throw new Error('[PTDT] Height texture image is unavailable');

  const width = image.width;
  const height = image.height;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('[PTDT] Could not create DEM sampling context');
  ctx.drawImage(image as CanvasImageSource, 0, 0);
  const pixels = ctx.getImageData(0, 0, width, height).data;
  const sample = (u: number, v: number) => {
    const x = Math.min(width - 1, Math.max(0, Math.floor(u * (width - 1))));
    const y = Math.min(height - 1, Math.max(0, Math.floor((1 - v) * (height - 1))));
    return pixels[(y * width + x) * 4] / 255;
  };

  const pos = geometry.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) / size + 0.5;
    const z = pos.getZ(i) / size + 0.5;
    const elevationFt = heightOffset + sample(x, z) * heightScale;
    pos.setY(i, elevationFt - SITE.bfe_ft + centerY);
  }

  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();

  const material = new THREE.MeshStandardMaterial({
    color: 0x55705a,
    roughness: 0.88,
    metalness: 0.02,
    map: null,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'TriCounty_DEM_Terrain';
  mesh.receiveShadow = true;
  mesh.castShadow = false;
  return mesh;
}
