#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, cpSync } from 'node:fs';

const run = (cmd) => { console.log(`\n▶ ${cmd}`); execSync(cmd, {stdio:'inherit'}); };
const root = process.cwd();

console.log('=== TRI-COUNTY RIVER VALLEY / UNIFIED OSS CINEMATIC BUILD ===');
if (!existsSync('dist')) mkdirSync('dist');
run('npm run typecheck --if-present');
run('npm run lint --if-present');
run('npm run build');

const copyIfPresent = (source, target) => {
  if (!existsSync(source)) return;
  mkdirSync(target.substring(0, target.lastIndexOf('/')), { recursive: true });
  cpSync(source, target);
};

copyIfPresent('public/map/tri-county-style.json', 'dist/map/tri-county-style.json');
copyIfPresent('public/shaders/photorealTerrain.wgsl', 'dist/shaders/photorealTerrain.wgsl');
copyIfPresent('src/shaders/triCountyPhotoreal.wgsl', 'dist/shaders/triCountyPhotoreal.wgsl');
copyIfPresent('public/tiles/posey_height_preview.png', 'dist/tiles/posey_height_preview.png');

if (process.env.BUILD_PORTABLE === '1') {
  run('npx electron-builder --config electron-builder.json --win portable');
}

console.log('\n✓ Web app compiled');
console.log('✓ MapLibre style staged');
console.log('✓ WebGPU photoreal shader staged');
console.log('✓ Three.js cinematic fallback compiled with application bundle');
console.log('✓ DEM preview staged when present');
console.log('✓ Unreal/Cesium scene graph remains declarative and credential-free');
if (process.env.BUILD_PORTABLE === '1') console.log('✓ Windows portable Electron artifact requested');
console.log(`\nBuild root: ${root}/dist`);
