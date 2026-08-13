export type WebGpuErrorCode =
  | "INVALID_ARG"
  | "DEVICE_LOST"
  | "SIZE_LIMIT"
  | "UPLOAD_FAILED"
  | "PIPELINE"
  | "VALIDATION"
  | "STATE";

export class WebGpuHostError extends Error {
  constructor(
    message: string,
    readonly code: WebGpuErrorCode,
    readonly cause?: unknown,
  ) {
    super(`[PTDT.WebGPU] ${message}`);
    this.name = "WebGpuHostError";
  }
}

export async function withValidationScope<T>(
  device: GPUDevice,
  fn: () => T | Promise<T>,
): Promise<T> {
  device.pushErrorScope("validation");
  try {
    const result = await fn();
    const err = await device.popErrorScope();
    if (err) throw new WebGpuHostError(err.message, "VALIDATION", err);
    return result;
  } catch (e) {
    try {
      const err = await device.popErrorScope();
      if (err && !(e instanceof WebGpuHostError)) {
        throw new WebGpuHostError(err.message, "VALIDATION", err);
      }
    } catch {
      /* ignore */
    }
    if (e instanceof WebGpuHostError) throw e;
    throw new WebGpuHostError(
      e instanceof Error ? e.message : String(e),
      "UPLOAD_FAILED",
      e,
    );
  }
}

export function createComputePipelineChecked(
  device: GPUDevice,
  module: GPUShaderModule,
  entryPoint = "main",
): GPUComputePipeline {
  try {
    return device.createComputePipeline({
      layout: "auto",
      compute: { module, entryPoint },
    });
  } catch (e) {
    throw new WebGpuHostError(
      `createComputePipeline(${entryPoint}): ${e instanceof Error ? e.message : String(e)}`,
      "PIPELINE",
      e,
    );
  }
}

export function createShaderModuleChecked(
  device: GPUDevice,
  code: string,
  label: string,
): GPUShaderModule {
  if (!code?.trim()) throw new WebGpuHostError(`empty WGSL for ${label}`, "INVALID_ARG");
  try {
    return device.createShaderModule({ label, code });
  } catch (e) {
    throw new WebGpuHostError(
      `createShaderModule(${label}): ${e instanceof Error ? e.message : String(e)}`,
      "PIPELINE",
      e,
    );
  }
}

export function dispatchWorkgroupsChecked(
  pass: GPUComputePassEncoder,
  device: GPUDevice,
  x: number,
  y = 1,
  z = 1,
): void {
  const lim = device.limits.maxComputeWorkgroupsPerDimension;
  if (x < 1 || y < 1 || z < 1) {
    throw new WebGpuHostError(`invalid dispatch ${x},${y},${z}`, "INVALID_ARG");
  }
  pass.dispatchWorkgroups(
    Math.min(Math.ceil(x), lim),
    Math.min(Math.ceil(y), lim),
    Math.min(Math.ceil(z), lim),
  );
}
