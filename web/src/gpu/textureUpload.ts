/**
 * PTDT-v33 WebGPU texture / buffer upload helpers
 * - r32float DEM/depth: unfilterable-float + textureLoad in WGSL
 * - r32uint cell_index_map: uint sample type + textureLoad
 * - bytesPerRow must be multiple of 256
 */

export const NODATA_CELL = 0xffffffff;
export const NODATA_WSE_MM = -9999;

function alignBytesPerRow(width: number, bytesPerTexel: number): number {
  const raw = width * bytesPerTexel;
  return Math.ceil(raw / 256) * 256;
}

export async function uploadR32UintTexture(
  device: GPUDevice,
  data: Uint32Array,
  width: number,
  height: number,
): Promise<GPUTexture> {
  if (data.length !== width * height) {
    throw new Error(`cell_index_map size mismatch: ${data.length} vs ${width * height}`);
  }

  const texture = device.createTexture({
    size: [width, height],
    format: "r32uint",
    usage:
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.COPY_DST |
      GPUTextureUsage.STORAGE_BINDING,
  });

  const bytesPerRow = alignBytesPerRow(width, 4);
  const padded = new Uint8Array(bytesPerRow * height);
  const src = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  for (let y = 0; y < height; y++) {
    padded.set(src.subarray(y * width * 4, (y + 1) * width * 4), y * bytesPerRow);
  }

  device.queue.writeTexture(
    { texture },
    padded,
    { bytesPerRow, rowsPerImage: height },
    { width, height, depthOrArrayLayers: 1 },
  );
  return texture;
}

export async function uploadR32FloatTexture(
  device: GPUDevice,
  data: Float32Array,
  width: number,
  height: number,
): Promise<GPUTexture> {
  if (data.length !== width * height) {
    throw new Error(`float texture size mismatch: ${data.length} vs ${width * height}`);
  }

  const texture = device.createTexture({
    size: [width, height],
    format: "r32float",
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
  });

  const bytesPerRow = alignBytesPerRow(width, 4);
  const padded = new Uint8Array(bytesPerRow * height);
  const src = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  for (let y = 0; y < height; y++) {
    padded.set(src.subarray(y * width * 4, (y + 1) * width * 4), y * bytesPerRow);
  }

  device.queue.writeTexture(
    { texture },
    padded,
    { bytesPerRow, rowsPerImage: height },
    { width, height, depthOrArrayLayers: 1 },
  );
  return texture;
}

export function createWseStorageBuffer(
  device: GPUDevice,
  cellCount: number,
): GPUBuffer {
  return device.createBuffer({
    size: Math.max(4, cellCount * 4),
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
}

export function uploadWseMm(
  device: GPUDevice,
  buffer: GPUBuffer,
  wseMm: Int32Array,
): void {
  device.queue.writeBuffer(buffer, 0, wseMm);
}
