import * as THREE from 'three';
import {
  createPhotorealTerrainPass,
  renderTerrainPass,
  writeTerrainUniforms,
  type TerrainPassHandles,
} from './WebGPUTerrainPass';

export type TerrainRendererMode = 'webgpu' | 'threejs';

export interface TerrainRenderer {
  mode: TerrainRendererMode;
  handles: TerrainPassHandles | null;
  render: (timeSeconds: number) => void;
  dispose: () => void;
}

/**
 * WebGPU-first renderer selection. If WebGPU, adapter creation, shader load,
 * or texture upload fails, callers can continue with the existing Three.js
 * cinematic scene without changing their camera or DEM source.
 */
export async function createTerrainRenderer(options: {
  canvas: HTMLCanvasElement;
  heightBitmap: ImageBitmap;
  camera: THREE.Camera;
  fallbackRender: (timeSeconds: number) => void;
  fallbackDispose?: () => void;
  heightScaleFt?: number;
  heightOffsetFt?: number;
  waterLevelFt?: number;
  wetness?: number;
}): Promise<TerrainRenderer> {
  try {
    const handles = await createPhotorealTerrainPass(options.canvas, options.heightBitmap);
    if (!handles) {
      options.fallbackDispose?.();
      return {
        mode: 'threejs',
        handles: null,
        render: options.fallbackRender,
        dispose: () => options.fallbackDispose?.(),
      };
    }

    const render = (timeSeconds: number) => {
      const camera = options.camera;
      camera.updateMatrixWorld(true);
      camera.updateProjectionMatrix();

      const view = camera.matrixWorldInverse.clone();
      const projection = camera.projectionMatrix.clone();
      const viewProj = projection.multiply(view);
      const invViewProj = viewProj.clone().invert();

      const viewProjArray = new Float32Array(16);
      const invViewProjArray = new Float32Array(16);
      viewProjArray.set(viewProj.elements);
      invViewProjArray.set(invViewProj.elements);

      const p = camera.position;
      writeTerrainUniforms(handles.device, handles.uniformBuffer, {
        viewProj: viewProjArray,
        invViewProj: invViewProjArray,
        cameraPos: [p.x, p.y, p.z],
        time: timeSeconds,
        lightDir: [0.4, 0.8, 0.3],
        width: options.canvas.width,
        height: options.canvas.height,
        heightScaleFt: options.heightScaleFt,
        heightOffsetFt: options.heightOffsetFt,
        waterLevelFt: options.waterLevelFt,
        wetness: options.wetness,
      });
      renderTerrainPass(handles);
    };

    return {
      mode: 'webgpu',
      handles,
      render,
      dispose: () => {
        handles.heightTexture.destroy();
        handles.uniformBuffer.destroy();
      },
    };
  } catch (error) {
    console.warn('[PTDT] WebGPU terrain initialization failed — Three.js fallback:', error);
    options.fallbackDispose?.();
    return {
      mode: 'threejs',
      handles: null,
      render: options.fallbackRender,
      dispose: () => options.fallbackDispose?.(),
    };
  }
}

export async function loadHeightPreview(url = '/tiles/posey_height_preview.png'): Promise<ImageBitmap> {
  const image = new Image();
  image.decoding = 'async';
  image.src = url;
  await image.decode();
  return createImageBitmap(image);
}
