/**
 * TurboVec hydraulic texture upload — seal-verified WSE only.
 * writeTexture is a GPU copy (not shared-memory zero-copy).
 * bytesPerRow must be 256-byte aligned. Unstructured meshes need rasterization.
 */

export function milliToFloatWse(wseMilli: number[]): Float32Array {
  const out = new Float32Array(wseMilli.length);
  for (let i = 0; i < wseMilli.length; i++) {
    const mm = wseMilli[i];
    out[i] = mm === -9999 ? -9999.0 : mm / 1000.0;
  }
  return out;
}

export function paddedWidthForR32Float(width: number): number {
  const bytes = width * 4;
  const aligned = Math.ceil(bytes / 256) * 256;
  return aligned / 4;
}

export function uploadWseTexture(
  device: GPUDevice,
  texture: GPUTexture,
  wseFloat: Float32Array,
  width: number,
  height: number,
): void {
  if (wseFloat.length < width * height) {
    throw new Error(
      `WSE length ${wseFloat.length} < width*height ${width * height}. ` +
        `Unstructured cell arrays cannot reshape without rasterization.`,
    );
  }
  const padW = paddedWidthForR32Float(width);
  let data = wseFloat;
  if (padW !== width) {
    const padded = new Float32Array(padW * height);
    for (let y = 0; y < height; y++) {
      padded.set(wseFloat.subarray(y * width, (y + 1) * width), y * padW);
    }
    data = padded;
  }
  device.queue.writeTexture(
    { texture },
    data,
    { bytesPerRow: padW * 4 },
    { width, height, depthOrArrayLayers: 1 },
  );
}
