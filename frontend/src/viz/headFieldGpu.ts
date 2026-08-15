/** HeadField GPU host — MODFLOW6 heads → r32float. Fail-closed on STALE. */

export const HEAD_DRY_SENTINEL = -999.0;

export interface HeadFieldUpload {
  heads: Float32Array;
  width: number;
  height: number;
  headMin: number;
  headMax: number;
  status: "OK" | "STALE" | "FAILED";
}

export class HeadFieldGpuManager {
  readonly device: GPUDevice;
  headTexture: GPUTexture | null = null;
  uniformsBuffer: GPUBuffer;

  constructor(device: GPUDevice) {
    this.device = device;
    this.uniformsBuffer = device.createBuffer({
      label: "ptdt-headfield-uniforms",
      size: 128,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
  }

  upload(payload: HeadFieldUpload, allowStale = false): void {
    if (payload.status !== "OK" && !allowStale) {
      throw new Error(`HeadField refuse upload status=${payload.status}`);
    }
    if (payload.heads.length !== payload.width * payload.height) {
      throw new Error(`heads length mismatch`);
    }
    if (this.headTexture) {
      this.headTexture.destroy();
      this.headTexture = null;
    }
    this.headTexture = this.device.createTexture({
      label: "ptdt-headfield",
      size: [payload.width, payload.height, 1],
      format: "r32float",
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
    });
    const bytesPerRowUnpadded = payload.width * 4;
    const bytesPerRow = Math.ceil(bytesPerRowUnpadded / 256) * 256;
    if (bytesPerRow === bytesPerRowUnpadded) {
      this.device.queue.writeTexture(
        { texture: this.headTexture },
        payload.heads,
        { bytesPerRow, rowsPerImage: payload.height },
        { width: payload.width, height: payload.height, depthOrArrayLayers: 1 },
      );
    } else {
      const padded = new Float32Array((bytesPerRow / 4) * payload.height);
      for (let y = 0; y < payload.height; y++) {
        padded.set(
          payload.heads.subarray(y * payload.width, (y + 1) * payload.width),
          y * (bytesPerRow / 4),
        );
      }
      this.device.queue.writeTexture(
        { texture: this.headTexture },
        padded,
        { bytesPerRow, rowsPerImage: payload.height },
        { width: payload.width, height: payload.height, depthOrArrayLayers: 1 },
      );
    }
  }

  destroy(): void {
    this.uniformsBuffer.destroy();
    this.headTexture?.destroy();
    this.headTexture = null;
  }
}
