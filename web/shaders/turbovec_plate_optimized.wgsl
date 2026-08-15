// PTDT-v33: plate fragment — optimized sampling rules
// DEM/WSE/depth: textureLoad only (r32float unfilterable)
// Basemap/color: textureSample allowed on rgba8unorm filterable

struct VertexInput {
  @location(0) position: vec3<f32>,
  @location(1) uv: vec2<f32>,
}

struct VertexOutput {
  @builtin(position) clip_pos: vec4<f32>,
  @location(0) uv: vec2<f32>,
  @location(1) world_pos: vec3<f32>,
}

struct FrameUniforms {
  view_proj: mat4x4<f32>,
  light_dir: vec3<f32>,
  _pad: f32,
  map_size: vec2<u32>,
  _pad2: vec2<u32>,
}

@group(0) @binding(0) var<uniform> uniforms: FrameUniforms;
@group(0) @binding(1) var dem_tex: texture_2d<f32>;
@group(0) @binding(2) var depth_tex: texture_2d<f32>;
@group(0) @binding(3) var color_tex: texture_2d<f32>;
@group(0) @binding(4) var color_sampler: sampler;

fn load_dem(uv: vec2<f32>) -> f32 {
  let dims = textureDimensions(dem_tex);
  let c = vec2<i32>(
    i32(clamp(uv.x, 0.0, 1.0) * f32(dims.x - 1u)),
    i32(clamp(uv.y, 0.0, 1.0) * f32(dims.y - 1u))
  );
  return textureLoad(dem_tex, c, 0).r;
}

fn load_depth(uv: vec2<f32>) -> f32 {
  let dims = textureDimensions(depth_tex);
  let c = vec2<i32>(
    i32(clamp(uv.x, 0.0, 1.0) * f32(dims.x - 1u)),
    i32(clamp(uv.y, 0.0, 1.0) * f32(dims.y - 1u))
  );
  return textureLoad(depth_tex, c, 0).r;
}

@vertex
fn vs_main(in: VertexInput) -> VertexOutput {
  var out: VertexOutput;
  let dem_elev = load_dem(in.uv);
  // Render-origin relative: position.xy already local; z from DEM
  let world = vec3<f32>(in.position.x, dem_elev, in.position.z);
  out.clip_pos = uniforms.view_proj * vec4<f32>(world, 1.0);
  out.uv = in.uv;
  out.world_pos = world;
  return out;
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
  let terrain = textureSample(color_tex, color_sampler, in.uv).rgb;
  let water_depth = load_depth(in.uv);

  if (water_depth <= 0.001) {
    return vec4<f32>(terrain, 1.0);
  }

  let shallow = vec3<f32>(0.2, 0.55, 0.65);
  let deep = vec3<f32>(0.05, 0.15, 0.35);
  let t = clamp(water_depth / 5.0, 0.0, 1.0);
  let water = mix(shallow, deep, t);
  let alpha = clamp(water_depth * 0.5, 0.4, 0.9);
  let color = mix(terrain, water, alpha);

  let n = vec3<f32>(0.0, 1.0, 0.0);
  let half_v = normalize(uniforms.light_dir + vec3<f32>(0.0, 1.0, 0.0));
  let spec = pow(max(dot(n, half_v), 0.0), 32.0) * 0.45;
  return vec4<f32>(color + vec3<f32>(spec), 1.0);
}
