import * as THREE from 'three';

export class CollapsePropagationEngine {
  device: GPUDevice;
  collapseField: GPUBuffer;
  stressField: GPUBuffer;
  assetMask: GPUBuffer;
  dtBuffer: GPUBuffer;
  pipeline!: GPUComputePipeline;
  bindGroup!: GPUBindGroup;

  constructor(device: GPUDevice, stressField: GPUBuffer, assetMask: GPUBuffer) {
    this.device = device;
    this.stressField = stressField;
    this.assetMask = assetMask;

    const size = 256 * 256 * 4;
    this.collapseField = device.createBuffer({
      size,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
    });
    this.dtBuffer = device.createBuffer({
      size: 4,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const init = new Float32Array(256 * 256).fill(0.0);
    device.queue.writeBuffer(this.collapseField, 0, init.buffer);
  }

  async init() {
    const shader = await (await fetch("/shaders/collapse_propagation.wgsl")).text();
    this.pipeline = this.device.createComputePipeline({
      layout: "auto",
      compute: {
        module: this.device.createShaderModule({ code: shader }),
        entryPoint: "cs_collapse_propagation",
      },
    });

    this.bindGroup = this.device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.collapseField } },
        { binding: 1, resource: { buffer: this.stressField } },
        { binding: 2, resource: { buffer: this.assetMask } },
        { binding: 3, resource: { buffer: this.dtBuffer } },
      ],
    });
  }

  step(dt: number) {
    this.device.queue.writeBuffer(this.dtBuffer, 0, new Float32Array([dt]).buffer);
    const enc = this.device.createCommandEncoder();
    const pass = enc.beginComputePass();
    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, this.bindGroup);
    pass.dispatchWorkgroups(32, 32);
    pass.end();
    this.device.queue.submit([enc.finish()]);
  }
}
