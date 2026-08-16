import * as THREE from 'three';

export class VehicleDriftEngine {
  device: GPUDevice;
  vehicles: GPUBuffer;
  floodPlane: GPUBuffer;
  dtBuffer: GPUBuffer;
  pipeline!: GPUComputePipeline;
  bindGroup!: GPUBindGroup;
  vehicleCount: number;

  constructor(device: GPUDevice, floodPlane: GPUBuffer, vehicleCount = 1024) {
    this.device = device;
    this.floodPlane = floodPlane;
    this.vehicleCount = vehicleCount;

    const size = vehicleCount * 32; // 2 * vec4<f32> = 32 bytes
    this.vehicles = device.createBuffer({
      size,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
    });
    this.dtBuffer = device.createBuffer({
      size: 4,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const initData = new Float32Array(vehicleCount * 8);
    for (let i = 0; i < vehicleCount; i++) {
      initData[i * 8 + 0] = (Math.random() - 0.5) * 4000;
      initData[i * 8 + 1] = 0;
      initData[i * 8 + 2] = (Math.random() - 0.5) * 4000;
      initData[i * 8 + 3] = 1.0;
      
      initData[i * 8 + 4] = 0;
      initData[i * 8 + 5] = 0;
      initData[i * 8 + 6] = 0;
      initData[i * 8 + 7] = 0;
    }
    device.queue.writeBuffer(this.vehicles, 0, initData.buffer);
  }

  async init() {
    const shader = await (await fetch("/shaders/vehicle_drift.wgsl")).text();
    this.pipeline = this.device.createComputePipeline({
      layout: "auto",
      compute: {
        module: this.device.createShaderModule({ code: shader }),
        entryPoint: "cs_vehicle_drift",
      },
    });

    this.bindGroup = this.device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.vehicles } },
        { binding: 1, resource: { buffer: this.floodPlane } },
        { binding: 2, resource: { buffer: this.dtBuffer } },
      ],
    });
  }

  step(dt: number) {
    this.device.queue.writeBuffer(this.dtBuffer, 0, new Float32Array([dt]).buffer);
    const enc = this.device.createCommandEncoder();
    const pass = enc.beginComputePass();
    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, this.bindGroup);
    pass.dispatchWorkgroups(Math.ceil(this.vehicleCount / 64));
    pass.end();
    this.device.queue.submit([enc.finish()]);
  }
}
