/**
 * WebGPU TurboVec host — coalesced RGBA, cached pipeline, optional profiling.
 * Workgroup 16×16. See docs/ptdt-v33/WGSL_COALESCED_ACCESS.md
 */
import shaderSource from '../shaders/turbovecCompute.wgsl?raw';

export const WORKGROUP = 16;
export const UNIFORM_STRUCT_SIZE = 16;
export const UNIFORM_OFFSET_ALIGNMENT_DEFAULT = 256;
export const STORAGE_OFFSET_ALIGNMENT_DEFAULT = 256;
export const RGBA_STRIDE_BYTES = 16;
export const OUT_STRIDE_BYTES = 4;

function copyFloat32ForGpu(data: Float32Array): Float32Array<ArrayBuffer> {
  const copy = new Float32Array(new ArrayBuffer(data.byteLength));
  copy.set(data);
  return copy;
}

export function assertBufferOffsetAlign(offset: number, align: number, label: string): void {
  if (offset % align !== 0) {
    throw new Error(`WebGPU alignment: ${label} offset ${offset} not multiple of ${align}`);
  }
}

export interface TurboVecInput {
  width: number;
  height: number;
  red: Float32Array;
  nir: Float32Array;
  green: Float32Array;
  blue: Float32Array;
  mixLimit?: number;
  profile?: boolean;
}

export interface TurboVecProfile {
  interleaveMs: number;
  uploadMs: number;
  computeAndReadbackMs: number;
  totalMs: number;
  pixels: number;
  megapixelsPerSec: number;
  bytesUploaded: number;
  workgroup: number;
  dispatchX: number;
  dispatchY: number;
  timestampQuerySupported: boolean;
  gpuComputeMs: number | null;
}

export interface TurboVecResult {
  packed: Uint32Array;
  backend: 'webgpu' | 'cpu';
  width: number;
  height: number;
  bytesUploaded: number;
  profile?: TurboVecProfile;
}

interface DeviceCache {
  device: GPUDevice;
  bindGroupLayout: GPUBindGroupLayout;
  pipeline: GPUComputePipeline;
  hasTimestampQuery: boolean;
  minUniformOffsetAlign: number;
  minStorageOffsetAlign: number;
}

let cache: DeviceCache | null = null;

/** AoS interleave — matches WGSL array<vec4<f32>> coalesced loads. */
export function interleaveRGBA(
  red: Float32Array, nir: Float32Array, green: Float32Array, blue: Float32Array,
): Float32Array {
  const n = red.length;
  const out = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) {
    const o = i * 4;
    out[o] = red[i]!;
    out[o + 1] = nir[i]!;
    out[o + 2] = green[i]!;
    out[o + 3] = blue[i]!;
  }
  return out;
}

function cpuFallback(input: TurboVecInput, interleaveMs = 0): TurboVecResult {
  const t0 = performance.now();
  const { width, height, red, nir, green, blue } = input;
  const mixLimit = input.mixLimit ?? 1.0;
  const n = width * height;
  const packed = new Uint32Array(n);
  const f16 = (v: number) => {
    const c = Math.max(0, Math.min(1, v * 0.5 + 0.5));
    return Math.round(c * 65535) & 0xffff;
  };
  for (let i = 0; i < n; i++) {
    const r = red[i]!, ni = nir[i]!, g = green[i]!, b = blue[i]!;
    if (r + ni + g + b < 1e-8) { packed[i] = 0; continue; }
    const ndvi = Math.abs(ni + r) > 1e-6 ? (ni - r) / (ni + r) : 0;
    const ndwi = Math.abs(g + ni) > 1e-6 ? (g - ni) / (g + ni) : 0;
    const evi = 2.5 * ((ni - r) / (ni + 6 * r - 7.5 * b + 1 + 1e-6));
    const savi = 1.5 * ((ni - r) / (ni + r + 0.5 + 1e-6));
    const mix = Math.max(-mixLimit, Math.min(mixLimit, 0.4 * ndvi + 0.2 * ndwi + 0.2 * evi + 0.2 * savi));
    packed[i] = (f16(mix) << 16) | f16(ndvi);
  }
  const totalMs = performance.now() - t0 + interleaveMs;
  return {
    packed, backend: 'cpu', width, height, bytesUploaded: 0,
    profile: input.profile ? {
      interleaveMs, uploadMs: 0, computeAndReadbackMs: totalMs - interleaveMs, totalMs,
      pixels: n, megapixelsPerSec: n / Math.max(totalMs, 0.001) / 1e3, bytesUploaded: 0,
      workgroup: WORKGROUP, dispatchX: 0, dispatchY: 0, timestampQuerySupported: false, gpuComputeMs: null,
    } : undefined,
  };
}

async function getDeviceCache(): Promise<DeviceCache | null> {
  if (cache) return cache;
  if (!navigator.gpu) return null;
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) return null;
  const hasTimestampQuery = adapter.features.has('timestamp-query');
  const requiredFeatures: GPUFeatureName[] = hasTimestampQuery ? ['timestamp-query'] : [];
  const device = await adapter.requestDevice({ requiredFeatures });
  const bindGroupLayout = device.createBindGroupLayout({
    entries: [
      { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform', minBindingSize: 16 } },
      { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
      { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
    ],
  });
  const pipelineLayout = device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] });
  const module = device.createShaderModule({ code: shaderSource });
  const pipeline = device.createComputePipeline({
    layout: pipelineLayout,
    compute: { module, entryPoint: 'main' },
  });
  cache = {
    device, bindGroupLayout, pipeline, hasTimestampQuery,
    minUniformOffsetAlign: device.limits.minUniformBufferOffsetAlignment,
    minStorageOffsetAlign: device.limits.minStorageBufferOffsetAlignment,
  };
  device.lost.then(() => { cache = null; });
  return cache;
}

export function resetTurboVecDeviceCache(): void {
  cache?.device.destroy();
  cache = null;
}

export async function compactTurboVecGpu(input: TurboVecInput): Promise<TurboVecResult> {
  const totalT0 = performance.now();
  const tInterleave0 = performance.now();
  const rgba = interleaveRGBA(input.red, input.nir, input.green, input.blue);
  const interleaveMs = performance.now() - tInterleave0;

  const dc = await getDeviceCache();
  if (!dc) return cpuFallback(input, interleaveMs);

  const { device, bindGroupLayout, pipeline, hasTimestampQuery } = dc;
  const { width, height } = input;
  const mixLimit = input.mixLimit ?? 1.0;
  const n = width * height;
  const bytesUploaded = rgba.byteLength + 16;
  const dispatchX = Math.ceil(width / WORKGROUP);
  const dispatchY = Math.ceil(height / WORKGROUP);

  const tUpload0 = performance.now();
  const paramData = new ArrayBuffer(16);
  new Uint32Array(paramData, 0, 2).set([width, height]);
  new Float32Array(paramData, 8, 2).set([mixLimit, 0]);

  const paramBuf = device.createBuffer({ size: 16, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
  device.queue.writeBuffer(paramBuf, 0, paramData);
  const rgbaBuf = device.createBuffer({ size: rgba.byteLength, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
  device.queue.writeBuffer(rgbaBuf, 0, copyFloat32ForGpu(rgba));
  const outBuf = device.createBuffer({ size: n * 4, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC });
  const readBuf = device.createBuffer({ size: n * 4, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });
  const uploadMs = performance.now() - tUpload0;

  const bindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [
      { binding: 0, resource: { buffer: paramBuf } },
      { binding: 1, resource: { buffer: rgbaBuf } },
      { binding: 2, resource: { buffer: outBuf } },
    ],
  });

  let querySet: GPUQuerySet | null = null;
  let queryResolveBuf: GPUBuffer | null = null;
  let queryReadBuf: GPUBuffer | null = null;
  if (hasTimestampQuery && input.profile) {
    querySet = device.createQuerySet({ type: 'timestamp', count: 2 });
    queryResolveBuf = device.createBuffer({ size: 16, usage: GPUBufferUsage.QUERY_RESOLVE | GPUBufferUsage.COPY_SRC });
    queryReadBuf = device.createBuffer({ size: 16, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });
  }

  const tCompute0 = performance.now();
  const encoder = device.createCommandEncoder();
  const passDesc: GPUComputePassDescriptor = {};
  if (querySet) {
    passDesc.timestampWrites = { querySet, beginningOfPassWriteIndex: 0, endOfPassWriteIndex: 1 };
  }
  const pass = encoder.beginComputePass(passDesc);
  pass.setPipeline(pipeline);
  pass.setBindGroup(0, bindGroup);
  pass.dispatchWorkgroups(dispatchX, dispatchY);
  pass.end();
  encoder.copyBufferToBuffer(outBuf, 0, readBuf, 0, n * 4);
  if (querySet && queryResolveBuf && queryReadBuf) {
    encoder.resolveQuerySet(querySet, 0, 2, queryResolveBuf, 0);
    encoder.copyBufferToBuffer(queryResolveBuf, 0, queryReadBuf, 0, 16);
  }
  device.queue.submit([encoder.finish()]);
  await readBuf.mapAsync(GPUMapMode.READ);
  const packed = new Uint32Array(readBuf.getMappedRange().slice(0));
  readBuf.unmap();
  const computeAndReadbackMs = performance.now() - tCompute0;

  let gpuComputeMs: number | null = null;
  if (queryReadBuf) {
    await queryReadBuf.mapAsync(GPUMapMode.READ);
    const times = new BigUint64Array(queryReadBuf.getMappedRange().slice(0));
    queryReadBuf.unmap();
    gpuComputeMs = Number(times[1]! - times[0]!) / 1e6;
  }

  paramBuf.destroy();
  rgbaBuf.destroy();
  outBuf.destroy();
  readBuf.destroy();
  querySet?.destroy();
  queryResolveBuf?.destroy();
  queryReadBuf?.destroy();

  const totalMs = performance.now() - totalT0;
  return {
    packed, backend: 'webgpu', width, height, bytesUploaded,
    profile: input.profile ? {
      interleaveMs, uploadMs, computeAndReadbackMs, totalMs,
      pixels: n, megapixelsPerSec: n / Math.max(computeAndReadbackMs, 0.001) / 1e3, bytesUploaded,
      workgroup: WORKGROUP, dispatchX, dispatchY, timestampQuerySupported: hasTimestampQuery, gpuComputeMs,
    } : undefined,
  };
}

export interface TurboVecVarianceReport {
  median_ms: number;
  min_ms: number;
  max_ms: number;
  stdev_ms: number;
  cv_pct: number;
  median_MPs: number;
  runs: number;
  samples: TurboVecProfile[];
  latency: {
    interleave_ms: number;
    upload_ms: number;
    compute_readback_ms: number;
    gpu_pass_ms: number | null;
    driver_plus_sync_proxy_ms: number | null;
    total_ms: number;
  };
}

export async function benchTurboVecVariance(
  input: Omit<TurboVecInput, 'profile'>,
  runs = 5,
): Promise<TurboVecVarianceReport> {
  await compactTurboVecGpu({ ...input, profile: false });
  const samples: TurboVecProfile[] = [];
  for (let i = 0; i < runs; i++) {
    const r = await compactTurboVecGpu({ ...input, profile: true });
    if (r.profile) samples.push(r.profile);
  }
  const xs = samples.map((s) => s.gpuComputeMs ?? s.computeAndReadbackMs).sort((a, b) => a - b);
  const mps = samples.map((s) => s.megapixelsPerSec).sort((a, b) => a - b);
  const mean = xs.reduce((a, b) => a + b, 0) / Math.max(xs.length, 1);
  const variance = xs.length > 1 ? xs.reduce((a, b) => a + (b - mean) ** 2, 0) / (xs.length - 1) : 0;
  const stdev = Math.sqrt(variance);
  const med = (arr: number[]) => {
    if (!arr.length) return 0;
    const s = [...arr].sort((a, b) => a - b);
    return s[Math.floor(s.length / 2)] ?? 0;
  };
  const interleave = samples.map((s) => s.interleaveMs);
  const upload = samples.map((s) => s.uploadMs);
  const compute = samples.map((s) => s.computeAndReadbackMs);
  const total = samples.map((s) => s.totalMs);
  const gpu = samples.map((s) => s.gpuComputeMs).filter((v): v is number => v != null);
  const gpuMed = gpu.length ? med(gpu) : null;
  const computeMed = med(compute);
  return {
    median_ms: xs[Math.floor(xs.length / 2)] ?? 0,
    min_ms: xs[0] ?? 0,
    max_ms: xs[xs.length - 1] ?? 0,
    stdev_ms: stdev,
    cv_pct: mean > 0 ? (100 * stdev) / mean : 0,
    median_MPs: mps[Math.floor(mps.length / 2)] ?? 0,
    runs: samples.length,
    samples,
    latency: {
      interleave_ms: med(interleave),
      upload_ms: med(upload),
      compute_readback_ms: computeMed,
      gpu_pass_ms: gpuMed,
      driver_plus_sync_proxy_ms: gpuMed != null ? Math.max(0, computeMed - gpuMed) : null,
      total_ms: med(total),
    },
  };
}
