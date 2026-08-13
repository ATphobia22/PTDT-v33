# WebGPU compute shader pipelines (PTDT)

## Lifecycle

```ts
const module = device.createShaderModule({ code: wgsl });
const pipeline = device.createComputePipeline({
  layout: "auto",
  compute: { module, entryPoint: "main" },
});
const pass = encoder.beginComputePass();
pass.setPipeline(pipeline);
pass.setBindGroup(0, bindGroup);
pass.dispatchWorkgroups(cx, cy, cz);
pass.end();
```

## PTDT kernels

| Kernel | Workgroup | Dispatch |
|---|---|---|
| Water particles | 256×1×1 | ceil(N/256) |
| Cell index bake | 16×16×1 | ceil(W/16)×ceil(H/16) |

## Error handling snippet

```ts
import {
  createShaderModuleChecked,
  createComputePipelineChecked,
  withValidationScope,
  dispatchWorkgroupsChecked,
} from "./webgpuErrorHandling";

const module = createShaderModuleChecked(device, wgsl, "cell-index-bake");
const pipeline = createComputePipelineChecked(device, module);
await withValidationScope(device, () => {
  const pass = encoder.beginComputePass();
  pass.setPipeline(pipeline);
  pass.setBindGroup(0, bindGroup);
  dispatchWorkgroupsChecked(pass, device, Math.ceil(w/16), Math.ceil(h/16));
  pass.end();
});
```
