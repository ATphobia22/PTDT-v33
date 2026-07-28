// PTDT v33 — Flood freeboard water surface (WGSL)
struct Uniforms {
  viewProj : mat4x4<f32>,
  time : f32,
  depthM : f32,
  freeboardFt : f32,
  waveAmp : f32,
};

@group(0) @binding(0) var<uniform> u : Uniforms;

struct VSOut {
  @builtin(position) pos : vec4<f32>,
  @location(0) worldXZ : vec2<f32>,
  @location(1) elev : f32,
};

@vertex
fn vs_main(@location(0) position : vec3<f32>) -> VSOut {
  var out : VSOut;
  let x = position.x;
  let z = position.z;
  let phase = u.time * 1.4 + x * 0.15 + z * 0.11;
  let y = u.depthM * 0.1 + sin(phase) * u.waveAmp + cos(phase * 0.7) * u.waveAmp * 0.5;
  let world = vec4<f32>(x, y, z, 1.0);
  out.pos = u.viewProj * world;
  out.worldXZ = vec2<f32>(x, z);
  out.elev = y;
  return out;
}

@fragment
fn fs_main(in : VSOut) -> @location(0) vec4<f32> {
  let deep = vec3<f32>(0.02, 0.18, 0.28);
  let mid = vec3<f32>(0.05, 0.45, 0.55);
  let foam = vec3<f32>(0.75, 0.9, 0.95);
  let t = clamp(in.elev * 2.0, 0.0, 1.0);
  var rgb = mix(deep, mid, t);
  if (u.freeboardFt >= 4.0) {
    rgb = mix(rgb, foam, 0.08);
  }
  return vec4<f32>(rgb, 0.72);
}
