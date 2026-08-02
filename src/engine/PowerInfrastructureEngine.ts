import * as THREE from 'three';

export class PowerInfrastructureEngine {
  device: GPUDevice;
  powerGridStatus: GPUBuffer;
  floodPlane: GPUBuffer;
  substationMask: GPUBuffer;
  dtBuffer: GPUBuffer;
  pipeline!: GPUComputePipeline;
  bindGroup!: GPUBindGroup;

  constructor(device: GPUDevice, floodPlane: GPUBuffer, substationMask: GPUBuffer) {
    this.device = device;
    this.floodPlane = floodPlane;
    this.substationMask = substationMask;

    const size = 256 * 256 * 4;
    this.powerGridStatus = device.createBuffer({
      size,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
    });
    this.dtBuffer = device.createBuffer({
      size: 4,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const init = new Float32Array(256 * 256).fill(0.0);
    device.queue.writeBuffer(this.powerGridStatus, 0, init.buffer);
  }

  async init() {
    const shader = await (await fetch("/shaders/power_infrastructure.wgsl")).text();
    this.pipeline = this.device.createComputePipeline({
      layout: "auto",
      compute: {
        module: this.device.createShaderModule({ code: shader }),
        entryPoint: "cs_power_failure",
      },
    });

    this.bindGroup = this.device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.powerGridStatus } },
        { binding: 1, resource: { buffer: this.floodPlane } },
        { binding: 2, resource: { buffer: this.substationMask } },
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
