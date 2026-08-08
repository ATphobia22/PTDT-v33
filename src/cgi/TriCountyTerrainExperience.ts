import * as THREE from 'three';
import { createTerrainRenderer, loadHeightPreview, type TerrainRenderer } from './TerrainRendererSwitch';
import { createCinematicComposer } from '../engine/PostProcessing';
import { loadHeightTexture, createDemTerrain } from '../engine/TerrainDisplacement';

export interface TriCountyTerrainExperience {
  mode: 'webgpu' | 'threejs';
  render(timeSeconds: number): void;
  dispose(): void;
}

export async function createTriCountyTerrainExperience(options: {
  canvas: HTMLCanvasElement;
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  heightPreviewUrl?: string;
  terrainSize?: number;
  terrainResolution?: number;
}): Promise<TriCountyTerrainExperience> {
  const heightPreview = await loadHeightPreview(options.heightPreviewUrl);
  const threeComposer = createCinematicComposer(options.renderer, options.scene, options.camera);
  const heightTexture = await loadHeightTexture(options.heightPreviewUrl);
  const terrain = createDemTerrain(heightTexture, {
    size: options.terrainSize ?? 10000,
    resolution: options.terrainResolution ?? 256,
  });
  options.scene.add(terrain);

  const water = new THREE.Mesh(
    new THREE.PlaneGeometry(options.terrainSize ?? 10000, options.terrainSize ?? 10000),
    new THREE.MeshPhysicalMaterial({
      color: 0x0b4658,
      roughness: 0.12,
      metalness: 0.02,
      transmission: 0.55,
      thickness: 1.5,
      transparent: true,
      opacity: 0.82,
    }),
  );
  water.rotation.x = -Math.PI / 2;
  options.scene.add(water);

  const disposeFallback = () => {
    options.scene.remove(terrain, water);
    terrain.geometry.dispose();
    (terrain.material as THREE.Material).dispose();
    water.geometry.dispose();
    (water.material as THREE.Material).dispose();
  };

  const fallbackRender = (timeSeconds: number) => {
    water.position.y = Math.sin(timeSeconds * 0.45) * 0.08;
    threeComposer.render(timeSeconds);
  };

  let terrainRenderer: TerrainRenderer | null = await createTerrainRenderer({
    canvas: options.canvas,
    heightBitmap: heightPreview,
    camera: options.camera,
    fallbackRender,
    fallbackDispose: disposeFallback,
  });
  const activeMode = terrainRenderer.mode;

  if (activeMode === 'webgpu') disposeFallback();

  return {
    mode: activeMode,
    render: (timeSeconds) => terrainRenderer?.render(timeSeconds),
    dispose: () => {
      terrainRenderer?.dispose();
      terrainRenderer = null;
      if (activeMode === 'threejs') disposeFallback();
      heightPreview.close();
      heightTexture.dispose();
      threeComposer.dispose();
    },
  };
}
