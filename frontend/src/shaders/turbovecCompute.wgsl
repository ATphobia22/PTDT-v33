// PTDT v34 — TurboVec compute (memory-coalesced)
// Interleaved RGBA storage: consecutive threads hit consecutive 16-byte addresses.
// Workgroup 16×16 (256 threads). See docs/WEBGPU_TURBOVEC_TUNING.md

struct TurboVecParams {
  width     : u32,
  height    : u32,
  mix_limit : f32,
  _pad      : f32,
};

// rgba[idx] = vec4(r, nir, g, b) — AoS layout for coalesced loads
@group(0) @binding(0) var<uniform> params : TurboVecParams;
@group(0) @binding(1) var<storage, read>  rgba   : array<vec4<f32>>;
@group(0) @binding(2) var<storage, read_write> out_f16 : array<u32>;

fn safe_div(a: f32, b: f32) -> f32 {
  return select(0.0, a / b, abs(b) > 1e-6);
}

fn clip01(v: f32) -> f32 {
  return clamp(v * 0.5 + 0.5, 0.0, 1.0);
}

fn f32_to_f16(v: f32) -> u32 {
  let bits = bitcast<u32>(v);
  let sign = (bits >> 16u) & 0x8000u;
  let exp  = (bits >> 23u) & 0xffu;
  let mant = bits & 0x7fffffu;
  if (exp == 255u) {
    return sign | 0x7c00u | select(0u, 0x200u, mant != 0u);
  }
  let new_exp = i32(exp) - 112;
  if (new_exp >= 31) { return sign | 0x7c00u; }
  if (new_exp <= 0)  { return sign; }
  let rounded = mant + 0x1000u;
  return sign | (u32(new_exp) << 10u) | (rounded >> 13u);
}

@compute @workgroup_size(16, 16, 1)
fn main(
  @builtin(global_invocation_id) gid : vec3<u32>,
  @builtin(local_invocation_id)  lid : vec3<u32>,
) {
  if (gid.x >= params.width || gid.y >= params.height) {
    return;
  }
  let idx = gid.y * params.width + gid.x;

  let px = rgba[idx];
  let r = px.x;
  let n = px.y;
  let g = px.z;
  let b = px.w;

  if (r + n + g + b < 1e-8) {
    out_f16[idx] = 0u;
    return;
  }

  let ndvi = safe_div(n - r, n + r);
  let ndwi = safe_div(g - n, g + n);
  let evi  = 2.5 * safe_div(n - r, n + 6.0 * r - 7.5 * b + 1.0);
  let savi = 1.5 * safe_div(n - r, n + r + 0.5);

  var mix = 0.4 * ndvi + 0.2 * ndwi + 0.2 * evi + 0.2 * savi;
  mix = clamp(mix, -params.mix_limit, params.mix_limit);

  let a = f32_to_f16(clip01(ndvi));
  let m = f32_to_f16(clip01(mix));
  out_f16[idx] = (m << 16u) | a;
}
