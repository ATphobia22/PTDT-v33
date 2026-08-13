/**
 * Derived WebGPU water particles — PTDT bodies are read-only uniforms/storage.
 * Never write particle state into the sealed physics envelope.
 */
export const WATER_WG = 256;

export function dispatchWaterParticles(
  pass: GPUComputePassEncoder,
  pipeline: GPUComputePipeline,
  bindGroup: GPUBindGroup,
  particleCount: number,
): void {
  pass.setPipeline(pipeline);
  pass.setBindGroup(0, bindGroup);
  pass.dispatchWorkgroups(Math.ceil(particleCount / WATER_WG));
}

/** Pack Box3D / envelope bodies into RigidBody storage buffer (render-origin). */
export function packRigidBodies(
  bodies: Array<{ x: number; y: number; z: number; halfX: number; halfY: number; halfZ: number }>,
): Float32Array {
  const stride = 8;
  const out = new Float32Array(bodies.length * stride);
  for (let i = 0; i < bodies.length; i++) {
    const b = bodies[i];
    const o = i * stride;
    out[o] = b.x;
    out[o + 1] = b.y;
    out[o + 2] = b.z;
    out[o + 3] = Math.max(b.halfX, b.halfY, b.halfZ);
    out[o + 4] = b.halfX;
    out[o + 5] = b.halfY;
    out[o + 6] = b.halfZ;
    out[o + 7] = 0.2;
  }
  return out;
}
