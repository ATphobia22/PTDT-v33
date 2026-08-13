export const CELL_NODATA_ID = 0xffffffff;

export class TurboVecUnstructuredManager {
  readonly device: GPUDevice;
  readonly maxCells: number;
  readonly wseStorageBuffer: GPUBuffer;
  cellIndexTexture: GPUTexture | null = null;
  plateParamsBuffer: GPUBuffer;
  private mapWidth = 0;
  private mapHeight = 0;

  constructor(device: GPUDevice, maxCells: number) {
    if (maxCells <= 0) throw new Error("maxCells must be positive");
    this.device = device;
    this.maxCells = maxCells;
    this.wseStorageBuffer = device.createBuffer({
      label: "ptdt-wse-1d",
      size: maxCells * 4,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });
    this.plateParamsBuffer = device.createBuffer({
      label: "ptdt-plate-params",
      size: 16,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
  }

  uploadCellIndexMap(data: Uint32Array, width: number, height: number): void {
    if (data.length !== width * height) {
      throw new Error(`index map length ${data.length} != ${width * height}`);
    }
    if (this.cellIndexTexture) this.cellIndexTexture.destroy();
    this.cellIndexTexture = this.device.createTexture({
      label: "ptdt-cell-index-map",
      size: [width, height, 1],
      format: "r32uint",
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
    });
    const bytesPerRowUnpadded = width * 4;
    const bytesPerRow = Math.ceil(bytesPerRowUnpadded / 256) * 256;
    if (bytesPerRow === bytesPerRowUnpadded) {
      this.device.queue.writeTexture(
        { texture: this.cellIndexTexture },
        data,
        { bytesPerRow, rowsPerImage: height },
        { width, height, depthOrArrayLayers: 1 },
      );
    } else {
      const padded = new Uint32Array((bytesPerRow / 4) * height);
      for (let y = 0; y < height; y++) {
        padded.set(data.subarray(y * width, (y + 1) * width), y * (bytesPerRow / 4));
      }
      this.device.queue.writeTexture(
        { texture: this.cellIndexTexture },
        padded,
        { bytesPerRow, rowsPerImage: height },
        { width, height, depthOrArrayLayers: 1 },
      );
    }
    this.mapWidth = width;
    this.mapHeight = height;
    this.writePlateParams(0);
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
      floatArray.buffer as ArrayBuffer,
      floatArray.byteOffset,
      floatArray.byteLength,
    );
    this.writePlateParams(wse1dMm.length);
  }

  private writePlateParams(cellCount: number): void {
    const u32 = new Uint32Array([
      this.mapWidth >>> 0,
      this.mapHeight >>> 0,
      cellCount >>> 0,
      CELL_NODATA_ID >>> 0,
    ]);
    this.device.queue.writeBuffer(this.plateParamsBuffer, 0, u32);
  }

  createBindGroup(
    layout: GPUBindGroupLayout,
    uniformsBuffer: GPUBuffer,
    demTexture: GPUTexture,
    demSampler: GPUSampler,
  ): GPUBindGroup {
    if (!this.cellIndexTexture) {
      throw new Error("uploadCellIndexMap before createBindGroup");
    }
    return this.device.createBindGroup({
      label: "ptdt-unstructured-plate",
      layout,
      entries: [
        { binding: 0, resource: { buffer: uniformsBuffer } },
        { binding: 1, resource: demTexture.createView() },
        { binding: 2, resource: demSampler },
        { binding: 3, resource: this.cellIndexTexture.createView() },
        { binding: 4, resource: { buffer: this.wseStorageBuffer } },
        { binding: 5, resource: { buffer: this.plateParamsBuffer } },
      ],
    });
  }

  destroy(): void {
    this.wseStorageBuffer.destroy();
    this.plateParamsBuffer.destroy();
    this.cellIndexTexture?.destroy();
  }
}
