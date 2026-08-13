export class TurboVecUnstructuredManager {
  readonly device: GPUDevice;
  readonly wseStorageBuffer: GPUBuffer;
  readonly maxCells: number;

  constructor(device: GPUDevice, maxCells: number) {
    this.device = device;
    this.maxCells = maxCells;
    this.wseStorageBuffer = device.createBuffer({
      size: maxCells * 4,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });
  }

  applyHydraulicPayload(wse1dMm: number[]): void {
    if (wse1dMm.length > this.maxCells) {
      throw new Error(`cell count ${wse1dMm.length} > maxCells ${this.maxCells}`);
    }
    const floatArray = new Float32Array(wse1dMm.length);
    for (let i = 0; i < wse1dMm.length; i++) {
      const mm = wse1dMm[i];
      floatArray[i] = mm === -9999 ? -9999.0 : mm / 1000.0;
    }
    this.device.queue.writeBuffer(
      this.wseStorageBuffer,
      0,
      floatArray.buffer,
      floatArray.byteOffset,
      floatArray.byteLength,
    );
  }
}

export function uploadCellIndexTexture(
  device: GPUDevice,
  texture: GPUTexture,
  data: Uint32Array,
  width: number,
  height: number,
): void {
  if (data.length !== width * height) {
    throw new Error(`index map length ${data.length} != ${width * height}`);
  }
  device.queue.writeTexture(
    { texture },
    data,
    { bytesPerRow: width * 4 },
    { width, height, depthOrArrayLayers: 1 },
  );
}
