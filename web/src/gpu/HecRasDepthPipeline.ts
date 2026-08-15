/// <reference types="@webgpu/types" />

/**
 * HEC-RAS → WebGPU depth bake pipeline.
 * - DEM / depth: r32float unfilterable → textureLoad
 * - cell_index_map: r32uint → textureLoad
 * - wse_mm: read-only storage buffer (mm integers)
 * Rule 1: WSE authoritative; depth is presentation only.
 */

const WGSL = `
struct Params {
    map_size: vec2<u32>,
    nodata_cell: u32,
    nodata_wse_mm: i32,
}

@group(0) @binding(0) var dem_tex: texture_2d<f32>;
@group(0) @binding(1) var cell_index_map: texture_2d<u32>;
@group(0) @binding(2) var<storage, read> wse_mm: array<i32>;
@group(0) @binding(3) var depth_out: texture_storage_2d<r32float, write>;
@group(0) @binding(4) var<uniform> params: Params;

@compute @workgroup_size(16, 16, 1)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
    if (gid.x >= params.map_size.x || gid.y >= params.map_size.y) { return; }
    let coord = vec2<i32>(i32(gid.x), i32(gid.y));
    let dem_val = textureLoad(dem_tex, coord, 0).r;
    let cell_val = textureLoad(cell_index_map, coord, 0).r;
    var depth: f32 = 0.0;
    if (cell_val != params.nodata_cell) {
        let mm = wse_mm[cell_val];
        if (mm > params.nodata_wse_mm) {
            depth = max(f32(mm) * 0.001 - dem_val, 0.0);
        }
    }
    textureStore(depth_out, coord, vec4<f32>(depth, 0.0, 0.0, 1.0));
}
`;

function alignBytesPerRow(width: number, bytesPerTexel: number): number {
  return Math.ceil((width * bytesPerTexel) / 256) * 256;
}

function padTextureData(
  data: ArrayBufferView,
  width: number,
  height: number,
  bytesPerTexel: number,
): Uint8Array {
  const bytesPerRow = alignBytesPerRow(width, bytesPerTexel);
  const src = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  if (bytesPerRow === width * bytesPerTexel) {
    return src;
  }
  const padded = new Uint8Array(bytesPerRow * height);
  const rowBytes = width * bytesPerTexel;
  for (let y = 0; y < height; y++) {
    padded.set(src.subarray(y * rowBytes, (y + 1) * rowBytes), y * bytesPerRow);
  }
  return padded;
}

export class HecRasDepthPipeline {
  private device: GPUDevice;
  private pipeline: GPUComputePipeline;
  private bindGroupLayout: GPUBindGroupLayout;

  private demTexture: GPUTexture | null = null;
  private cellIndexTexture: GPUTexture | null = null;
  private wseBuffer: GPUBuffer | null = null;
  private paramsBuffer: GPUBuffer;
  public depthOutTexture: GPUTexture | null = null;

  private width = 0;
  private height = 0;

  constructor(device: GPUDevice) {
    this.device = device;

    this.paramsBuffer = this.device.createBuffer({
      size: 16,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    this.bindGroupLayout = this.device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.COMPUTE,
          texture: { sampleType: "unfilterable-float" },
        },
        {
          binding: 1,
          visibility: GPUShaderStage.COMPUTE,
          texture: { sampleType: "uint" },
        },
        {
          binding: 2,
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: "read-only-storage" },
        },
        {
          binding: 3,
          visibility: GPUShaderStage.COMPUTE,
          storageTexture: { format: "r32float", access: "write-only" },
        },
        {
          binding: 4,
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: "uniform" },
        },
      ],
    });

    const pipelineLayout = this.device.createPipelineLayout({
      bindGroupLayouts: [this.bindGroupLayout],
    });

    const shaderModule = this.device.createShaderModule({ code: WGSL });
    this.pipeline = this.device.createComputePipeline({
      layout: pipelineLayout,
      compute: { module: shaderModule, entryPoint: "main" },
    });
  }

  public async uploadDem(
    width: number,
    height: number,
    demData: Float32Array,
  ): Promise<void> {
    if (demData.length !== width * height) {
      throw new Error(`DEM size mismatch: ${demData.length} vs ${width * height}`);
    }
    this.width = width;
    this.height = height;

    if (this.demTexture) this.demTexture.destroy();
    this.demTexture = this.device.createTexture({
      size: [width, height],
      format: "r32float",
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
    });

    const bytesPerRow = alignBytesPerRow(width, 4);
    const padded = padTextureData(demData, width, height, 4);

    this.device.queue.writeTexture(
      { texture: this.demTexture },
      padded,
      { bytesPerRow, rowsPerImage: height },
      { width, height, depthOrArrayLayers: 1 },
    );

    this.initDepthOutTexture();
    this.updateParams();
  }

  public async uploadCellIndexMap(
    width: number,
    height: number,
    data: Uint32Array,
  ): Promise<void> {
    if (data.length !== width * height) {
      throw new Error(
        `cell_index_map size mismatch: ${data.length} vs ${width * height}`,
      );
    }
    if (this.cellIndexTexture) this.cellIndexTexture.destroy();
    this.cellIndexTexture = this.device.createTexture({
      size: [width, height],
      format: "r32uint",
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
    });

    const bytesPerRow = alignBytesPerRow(width, 4);
    const padded = padTextureData(data, width, height, 4);

    this.device.queue.writeTexture(
      { texture: this.cellIndexTexture },
      padded,
      { bytesPerRow, rowsPerImage: height },
      { width, height, depthOrArrayLayers: 1 },
    );
  }

  public uploadWseMm(wseMm: Int32Array): void {
    const byteLength = Math.max(4, wseMm.byteLength);
    if (!this.wseBuffer || this.wseBuffer.size < byteLength) {
      if (this.wseBuffer) this.wseBuffer.destroy();
      this.wseBuffer = this.device.createBuffer({
        size: byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      });
    }
    this.device.queue.writeBuffer(this.wseBuffer, 0, wseMm);
  }

  private initDepthOutTexture(): void {
    if (this.depthOutTexture) this.depthOutTexture.destroy();
    this.depthOutTexture = this.device.createTexture({
      size: [this.width, this.height],
      format: "r32float",
      usage:
        GPUTextureUsage.STORAGE_BINDING |
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.COPY_SRC,
    });
  }

  private updateParams(): void {
    const paramsArray = new ArrayBuffer(16);
    const dataView = new DataView(paramsArray);
    dataView.setUint32(0, this.width, true);
    dataView.setUint32(4, this.height, true);
    dataView.setUint32(8, 0xffffffff, true);
    dataView.setInt32(12, -9999, true);
    this.device.queue.writeBuffer(this.paramsBuffer, 0, paramsArray);
  }

  public dispatchDepthBake(): GPUTexture {
    if (
      !this.demTexture ||
      !this.cellIndexTexture ||
      !this.wseBuffer ||
      !this.depthOutTexture
    ) {
      throw new Error("Pipeline incomplete: missing DEM, cell map, WSE, or depth");
    }

    const bindGroup = this.device.createBindGroup({
      layout: this.bindGroupLayout,
      entries: [
        { binding: 0, resource: this.demTexture.createView() },
        { binding: 1, resource: this.cellIndexTexture.createView() },
        { binding: 2, resource: { buffer: this.wseBuffer } },
        { binding: 3, resource: this.depthOutTexture.createView() },
        { binding: 4, resource: { buffer: this.paramsBuffer } },
      ],
    });

    const commandEncoder = this.device.createCommandEncoder();
    const passEncoder = commandEncoder.beginComputePass();
    passEncoder.setPipeline(this.pipeline);
    passEncoder.setBindGroup(0, bindGroup);
    passEncoder.dispatchWorkgroups(
      Math.ceil(this.width / 16),
      Math.ceil(this.height / 16),
      1,
    );
    passEncoder.end();
    this.device.queue.submit([commandEncoder.finish()]);

    return this.depthOutTexture;
  }
}
