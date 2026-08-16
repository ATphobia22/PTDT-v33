export const CELL_NODATA_ID = 0xffffffff;
export const MAX_TEXTURE_DIM_FALLBACK = 8192;

function copyUint32ForGpu(data: Uint32Array): Uint32Array<ArrayBuffer> {
  const copy = new Uint32Array(new ArrayBuffer(data.byteLength));
  copy.set(data);
  return copy;
}

function copyFloat32ForGpu(data: Float32Array): Float32Array<ArrayBuffer> {
  const copy = new Float32Array(new ArrayBuffer(data.byteLength));
  copy.set(data);
  return copy;
}

export class TurboVecHostError extends Error {
  constructor(
    message: string,
    readonly code: "INVALID_ARG" | "DEVICE_LOST" | "SIZE_LIMIT" | "UPLOAD_FAILED" | "STATE",
  ) {
    super(`[TurboVecUnstructured] ${message}`);
    this.name = "TurboVecHostError";
  }
}

function assertFinitePositiveInt(n: number, label: string): number {
  if (!Number.isInteger(n) || n <= 0 || !Number.isFinite(n)) {
    throw new TurboVecHostError(`${label} must be a positive integer (got ${n})`, "INVALID_ARG");
  }
  return n;
}

export class TurboVecUnstructuredManager {
  readonly device: GPUDevice;
  readonly maxCells: number;
  readonly wseStorageBuffer: GPUBuffer;
  cellIndexTexture: GPUTexture | null = null;
  plateParamsBuffer: GPUBuffer;
  private mapWidth = 0;
  private mapHeight = 0;
  private destroyed = false;
  private lastCellCount = 0;

  constructor(device: GPUDevice, maxCells: number) {
    if (!device) throw new TurboVecHostError("GPUDevice is required", "INVALID_ARG");
    assertFinitePositiveInt(maxCells, "maxCells");
    if (maxCells * 4 > device.limits.maxStorageBufferBindingSize) {
      throw new TurboVecHostError(
        `maxCells*4 exceeds maxStorageBufferBindingSize`,
        "SIZE_LIMIT",
      );
    }
    this.device = device;
    this.maxCells = maxCells;
    try {
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
    } catch (e) {
      throw new TurboVecHostError(
        `buffer allocation failed: ${e instanceof Error ? e.message : String(e)}`,
        "UPLOAD_FAILED",
      );
    }
  }

  private ensureAlive(): void {
    if (this.destroyed) throw new TurboVecHostError("manager destroyed", "STATE");
  }

  uploadCellIndexMap(data: Uint32Array, width: number, height: number): void {
    this.ensureAlive();
    assertFinitePositiveInt(width, "width");
    assertFinitePositiveInt(height, "height");
    if (!(data instanceof Uint32Array)) {
      throw new TurboVecHostError("data must be Uint32Array", "INVALID_ARG");
    }
    if (data.length !== width * height) {
      throw new TurboVecHostError(
        `index map length ${data.length} != ${width * height}`,
        "INVALID_ARG",
      );
    }
    const maxDim = this.device.limits.maxTextureDimension2D || MAX_TEXTURE_DIM_FALLBACK;
    if (width > maxDim || height > maxDim) {
      throw new TurboVecHostError(`texture exceeds maxTextureDimension2D ${maxDim}`, "SIZE_LIMIT");
    }
    if (this.cellIndexTexture) {
      this.cellIndexTexture.destroy();
      this.cellIndexTexture = null;
    }
    try {
      this.cellIndexTexture = this.device.createTexture({
        label: "ptdt-cell-index-map",
        size: [width, height, 1],
        format: "r32uint",
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
      });
    } catch (e) {
      throw new TurboVecHostError(
        `createTexture failed: ${e instanceof Error ? e.message : String(e)}`,
        "UPLOAD_FAILED",
      );
    }
    const bytesPerRowUnpadded = width * 4;
    const bytesPerRow = Math.ceil(bytesPerRowUnpadded / 256) * 256;
    const source = copyUint32ForGpu(data);
    try {
      if (bytesPerRow === bytesPerRowUnpadded) {
        this.device.queue.writeTexture(
          { texture: this.cellIndexTexture },
          source,
          { bytesPerRow, rowsPerImage: height },
          { width, height, depthOrArrayLayers: 1 },
        );
      } else {
        const padded = new Uint32Array(new ArrayBuffer((bytesPerRow / 4) * height * 4));
        for (let y = 0; y < height; y++) {
          padded.set(source.subarray(y * width, (y + 1) * width), y * (bytesPerRow / 4));
        }
        this.device.queue.writeTexture(
          { texture: this.cellIndexTexture },
          padded,
          { bytesPerRow, rowsPerImage: height },
          { width, height, depthOrArrayLayers: 1 },
        );
      }
    } catch (e) {
      this.cellIndexTexture.destroy();
      this.cellIndexTexture = null;
      throw new TurboVecHostError(
        `writeTexture failed: ${e instanceof Error ? e.message : String(e)}`,
        "UPLOAD_FAILED",
      );
    }
    this.mapWidth = width;
    this.mapHeight = height;
    this.writePlateParams(this.lastCellCount);
  }

  createStorageBakeTexture(width: number, height: number): GPUTexture {
    this.ensureAlive();
    assertFinitePositiveInt(width, "width");
    assertFinitePositiveInt(height, "height");
    try {
      return this.device.createTexture({
        label: "ptdt-cell-index-bake-storage",
        size: [width, height, 1],
        format: "r32uint",
        usage:
          GPUTextureUsage.STORAGE_BINDING |
          GPUTextureUsage.COPY_SRC |
          GPUTextureUsage.TEXTURE_BINDING,
      });
    } catch (e) {
      throw new TurboVecHostError(
        `storage texture create failed: ${e instanceof Error ? e.message : String(e)}`,
        "UPLOAD_FAILED",
      );
    }
  }

  applyHydraulicPayload(wse1dMm: number[]): void {
    this.ensureAlive();
    if (!wse1dMm || typeof wse1dMm.length !== "number") {
      throw new TurboVecHostError("wse1dMm must be array-like", "INVALID_ARG");
    }
    const len = wse1dMm.length;
    if (len === 0) throw new TurboVecHostError("wse1dMm is empty", "INVALID_ARG");
    if (len > this.maxCells) {
      throw new TurboVecHostError(`cell count ${len} > maxCells ${this.maxCells}`, "SIZE_LIMIT");
    }
    const floatArray = new Float32Array(new ArrayBuffer(len * 4));
    for (let i = 0; i < len; i++) {
      const mm = Number(wse1dMm[i]);
      if (!Number.isFinite(mm) || mm === -9999) {
        floatArray[i] = -9999.0;
      } else {
        floatArray[i] = mm / 1000.0;
      }
    }
    try {
      this.device.queue.writeBuffer(
        this.wseStorageBuffer,
        0,
        copyFloat32ForGpu(floatArray).buffer,
      );
    } catch (e) {
      throw new TurboVecHostError(
        `writeBuffer WSE failed: ${e instanceof Error ? e.message : String(e)}`,
        "UPLOAD_FAILED",
      );
    }
    this.lastCellCount = len;
    this.writePlateParams(len);
  }

  private writePlateParams(cellCount: number): void {
    const u32 = new Uint32Array(new ArrayBuffer(16));
    u32.set([
      this.mapWidth >>> 0,
      this.mapHeight >>> 0,
      cellCount >>> 0,
      CELL_NODATA_ID >>> 0,
    ]);
    try {
      this.device.queue.writeBuffer(this.plateParamsBuffer, 0, u32);
    } catch (e) {
      throw new TurboVecHostError(
        `writeBuffer plate params failed: ${e instanceof Error ? e.message : String(e)}`,
        "UPLOAD_FAILED",
      );
    }
  }

  createBindGroup(
    layout: GPUBindGroupLayout,
    uniformsBuffer: GPUBuffer,
    demTexture: GPUTexture,
    demSampler: GPUSampler,
  ): GPUBindGroup {
    this.ensureAlive();
    if (!this.cellIndexTexture) {
      throw new TurboVecHostError("uploadCellIndexMap before createBindGroup", "STATE");
    }
    if (!layout || !uniformsBuffer || !demTexture || !demSampler) {
      throw new TurboVecHostError("bind group resources missing", "INVALID_ARG");
    }
    try {
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
    } catch (e) {
      throw new TurboVecHostError(
        `createBindGroup failed: ${e instanceof Error ? e.message : String(e)}`,
        "UPLOAD_FAILED",
      );
    }
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    try { this.wseStorageBuffer.destroy(); } catch { /* ignore */ }
    try { this.plateParamsBuffer.destroy(); } catch { /* ignore */ }
    try { this.cellIndexTexture?.destroy(); } catch { /* ignore */ }
    this.cellIndexTexture = null;
  }
}
