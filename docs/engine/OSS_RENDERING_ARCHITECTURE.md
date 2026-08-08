# Tri-County OSS Rendering Architecture

## Locked stack

- Three.js / React Three Fiber — rasterized cinematic fallback
- MapLibre GL — geospatial base/layer rendering
- WebGPU + WGSL — fullscreen DEM ray-march photoreal path
- h5py / PDAL / GDAL — local DEM and point-cloud ingestion
- Archimedes elevation contract — shared BFE/LAG inputs
- Electron + electron-builder — optional Windows portable shell

No proprietary rendering SDK is required by the rendering stack.

## WebGPU-first integration

```ts
import * as THREE from 'three';
import { createTriCountyTerrainExperience } from './cgi/TriCountyTerrainExperience';

const canvas = document.querySelector<HTMLCanvasElement>('#terrain-webgpu');
if (!canvas) throw new Error('terrain canvas missing');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(52, 16 / 9, 0.1, 500000);
const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

const terrain = await createTriCountyTerrainExperience({
  canvas,
  scene,
  camera,
  renderer,
  heightPreviewUrl: '/tiles/posey_height_preview.png',
  terrainSize: 10000,
  terrainResolution: 256,
});

const start = performance.now();
function frame(now: number) {
  terrain.render((now - start) / 1000);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
```

## Fallback behavior

1. Check `navigator.gpu`.
2. Request a high-performance adapter/device.
3. Load `/shaders/photorealTerrain.wgsl`.
4. Upload the same DEM preview used by the Three.js path.
5. Render the fullscreen ray-march path.
6. If any WebGPU initialization step fails, continue with the DEM-displaced Three.js scene and cinematic post-processing.

## DEM preprocessing

```bash
python scripts/dem/build_posey_height_preview.py \
  data/posey_dem.tif \
  public/tiles/posey_height_preview.png \
  --width 2048 \
  --height 2048
```

For point-cloud source data:

```bash
bash scripts/dem/pdal_to_cog.sh \
  data/posey_lidar.laz \
  data/posey_dem.tif \
  3
```

The preview is a visualization asset. The original COG/point-cloud/HDF5 data remains the quantitative engineering source.

## Build

```bash
npm run build:tri-county
```

Windows portable package:

```bash
npm run electron:portable
```

## Engineering separation

The renderer consumes BFE/LAG values but does not certify regulatory compliance. Archimedes, source provenance, datum metadata, and the underlying DEM remain the authoritative engineering/evidence layer.
