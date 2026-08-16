import { SITE } from '../lib/elevationCheck';

export interface TerrainPassHandles {
  device: GPUDevice;
  context: GPUCanvasContext;
  pipeline: GPURenderPipeline;
  bindGroup: GPUBindGroup;
  uniformBuffer: GPUBuffer;
  heightTexture: GPUTexture;
  sampler: GPUSampler;
  format: GPUTextureFormat;
}

export interface TerrainUniformInput {
  viewProj: Float32Array;
  invViewProj: Float32Array;
  cameraPos: [number, number, number];
  time: number;
  lightDir: [number, number, number];
  width: number;
  height: number;
  heightScaleFt?: number;
  heightOffsetFt?: number;
  waterLevelFt?: number;
  wetness?: number;
}

export async function createPhotorealTerrainPass(
  canvas: HTMLCanvasElement,
  heightBitmap: ImageBitmap,
): Promise<TerrainPassHandles | null> {
  if (!navigator.gpu) {
    console.warn('[PTDT] WebGPU unavailable — falling back to Three.js');
    return null;
  }

  const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
  if (!adapter) return null;

  const device = await adapter.requestDevice();
  const context = canvas.getContext('webgpu') as GPUCanvasContext | null;
  if (!context) return null;

  const format = navigator.gpu.getPreferredCanvasFormat();
  context.configure({ device, format, alphaMode: 'premultiplied' });

  const response = await fetch('/shaders/photorealTerrain.wgsl', { cache: 'no-cache' });
  if (!response.ok) throw new Error(`WGSL fetch failed: ${response.status}`);
  const shaderCode = await response.text();
  const module = device.createShaderModule({ code: shaderCode });

  const heightTexture = device.createTexture({
    size: { width: heightBitmap.width, height: heightBitmap.height, depthOrArrayLayers: 1 },
    format: 'rgba8unorm',
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
  });

  device.queue.copyExternalImageToTexture(
    { source: heightBitmap },
    { texture: heightTexture },
    { width: heightBitmap.width, height: heightBitmap.height },
  );

  const sampler = device.createSampler({
    magFilter: 'linear',
    minFilter: 'linear',
    mipmapFilter: 'linear',
    addressModeU: 'clamp-to-edge',
    addressModeV: 'clamp-to-edge',
  });

  // 46 f32 values = 184 bytes; round to a 256-byte uniform allocation for portability.
  const uniformBuffer = device.createBuffer({
    size: 256,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const bgl = device.createBindGroupLayout({
    entries: [
      { binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } },
      { binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: { sampleType: 'float' } },
      { binding: 2, visibility: GPUShaderStage.FRAGMENT, sampler: { type: 'filtering' } },
    ],
  });

  const bindGroup = device.createBindGroup({
    layout: bgl,
    entries: [
      { binding: 0, resource: { buffer: uniformBuffer } },
      { binding: 1, resource: heightTexture.createView() },
      { binding: 2, resource: sampler },
    ],
  });

  const pipeline = device.createRenderPipeline({
    layout: device.createPipelineLayout({ bindGroupLayouts: [bgl] }),
    vertex: { module, entryPoint: 'vs' },
    fragment: { module, entryPoint: 'fs', targets: [{ format }] },
    primitive: { topology: 'triangle-list' },
  });

  return { device, context, pipeline, bindGroup, uniformBuffer, heightTexture, sampler, format };
}

export function writeTerrainUniforms(
  device: GPUDevice,
  buffer: GPUBuffer,
  input: TerrainUniformInput,
): void {
  if (input.viewProj.length !== 16 || input.invViewProj.length !== 16) {
    throw new Error('[PTDT] viewProj and invViewProj must each contain 16 floats');
  }

  const data = new Float32Array(64);
  data.set(input.viewProj, 0);
  data.set(input.invViewProj, 16);
  data[32] = input.cameraPos[0];
  data[33] = input.cameraPos[1];
  data[34] = input.cameraPos[2];
  data[35] = input.time;
  data[36] = input.lightDir[0];
  data[37] = input.lightDir[1];
  data[38] = input.lightDir[2];
  data[39] = SITE.bfe_ft;
  data[40] = input.width;
  data[41] = input.height;
  data[42] = input.heightScaleFt ?? SITE.default_height_scale_ft;
  data[43] = input.heightOffsetFt ?? SITE.default_height_offset_ft;
  data[44] = input.waterLevelFt ?? SITE.bfe_ft;
  data[45] = input.wetness ?? 0.35;

  device.queue.writeBuffer(buffer, 0, data);
}

export function renderTerrainPass(handles: TerrainPassHandles): void {
  const encoder = handles.device.createCommandEncoder({ label: 'PTDT WebGPU Terrain Encoder' });
  const pass = encoder.beginRenderPass({
    colorAttachments: [{
      view: handles.context.getCurrentTexture().createView(),
      clearValue: { r: 0.04, g: 0.09, b: 0.16, a: 1 },
      loadOp: 'clear',
      storeOp: 'store',
    }],
  });

  pass.setPipeline(handles.pipeline);
  pass.setBindGroup(0, handles.bindGroup);
  pass.draw(3);
  pass.end();
  handles.device.queue.submit([encoder.finish()]);
}
