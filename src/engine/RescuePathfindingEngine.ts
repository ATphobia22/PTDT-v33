import * as THREE from 'three';

export class RescuePathfindingEngine {
  device: GPUDevice;
  rescueAgents: GPUBuffer;
  floodPlane: GPUBuffer;
  highGroundMask: GPUBuffer;
  dtBuffer: GPUBuffer;
  pipeline!: GPUComputePipeline;
  bindGroup!: GPUBindGroup;
  agentCount: number;

  constructor(device: GPUDevice, floodPlane: GPUBuffer, highGroundMask: GPUBuffer, agentCount = 512) {
    this.device = device;
    this.floodPlane = floodPlane;
    this.highGroundMask = highGroundMask;
    this.agentCount = agentCount;

    const size = agentCount * 32;
    this.rescueAgents = device.createBuffer({
      size,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
    });
    this.dtBuffer = device.createBuffer({
      size: 4,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const initData = new Float32Array(agentCount * 8);
    for (let i = 0; i < agentCount; i++) {
      initData[i * 8 + 0] = (Math.random() - 0.5) * 4000;
      initData[i * 8 + 1] = 0;
      initData[i * 8 + 2] = (Math.random() - 0.5) * 4000;
      initData[i * 8 + 3] = 1.0;
      
      initData[i * 8 + 4] = 0;
      initData[i * 8 + 5] = 0;
      initData[i * 8 + 6] = 0;
      initData[i * 8 + 7] = 0;
    }
    device.queue.writeBuffer(this.rescueAgents, 0, initData.buffer);
  }

  async init() {
    const shader = await (await fetch("/shaders/rescue_pathfinding.wgsl")).text();
    this.pipeline = this.device.createComputePipeline({
      layout: "auto",
      compute: {
        module: this.device.createShaderModule({ code: shader }),
        entryPoint: "cs_rescue_pathfinding",
      },
    });

    this.bindGroup = this.device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.rescueAgents } },
        { binding: 1, resource: { buffer: this.floodPlane } },
        { binding: 2, resource: { buffer: this.highGroundMask } },
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
    pass.dispatchWorkgroups(Math.ceil(this.agentCount / 64));
    pass.end();
    this.device.queue.submit([enc.finish()]);
  }
}
