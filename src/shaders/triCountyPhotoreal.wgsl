struct Camera { viewProj: mat4x4<f32>, cameraPos: vec3<f32>, time: f32 };
struct Params { sunDir: vec3<f32>, exposure: f32, wetness: f32, floodStage: f32, terrainScale: f32, waterLevel: f32 };
@group(0) @binding(0) var<uniform> camera: Camera;
@group(0) @binding(1) var<uniform> params: Params;
@group(1) @binding(0) var terrainTex: texture_2d<f32>;
@group(1) @binding(1) var terrainSampler: sampler;

struct VSIn { @location(0) position: vec3<f32>, @location(1) normal: vec3<f32>, @location(2) uv: vec2<f32>; };
struct VSOut { @builtin(position) position: vec4<f32>, @location(0) worldPos: vec3<f32>, @location(1) normal: vec3<f32>, @location(2) uv: vec2<f32>; };

@vertex fn vs_main(v: VSIn) -> VSOut {
  var o: VSOut;
  o.worldPos = v.position * params.terrainScale;
  o.normal = normalize(v.normal);
  o.uv = v.uv;
  o.position = camera.viewProj * vec4<f32>(o.worldPos, 1.0);
  return o;
}

fn hash21(p: vec2<f32>) -> f32 { let h = dot(p, vec2<f32>(127.1, 311.7)); return fract(sin(h) * 43758.5453); }
fn noise(p: vec2<f32>) -> f32 {
  let i = floor(p); let f = fract(p); let u = f*f*(3.0-2.0*f);
  return mix(mix(hash21(i), hash21(i+vec2<f32>(1,0)), u.x), mix(hash21(i+vec2<f32>(0,1)), hash21(i+vec2<f32>(1,1)), u.x), u.y);
}

@fragment fn fs_main(v: VSOut) -> @location(0) vec4<f32> {
  let n = normalize(v.normal);
  let l = normalize(-params.sunDir);
  let ndl = max(dot(n,l), 0.0);
  let tex = textureSample(terrainTex, terrainSampler, v.uv).rgb;
  let macroNoise = noise(v.worldPos.xz * 0.018);
  let microNoise = noise(v.worldPos.xz * 0.19);
  let terrain = tex * (0.72 + 0.28 * macroNoise) * (0.92 + 0.08 * microNoise);
  let wet = clamp(params.wetness, 0.0, 1.0);
  let viewDir = normalize(camera.cameraPos - v.worldPos);
  let fresnel = pow(1.0 - max(dot(viewDir,n),0.0), 5.0);
  let flood = smoothstep(params.waterLevel - 0.25, params.waterLevel + 0.25, v.worldPos.y);
  let riverTint = vec3<f32>(0.035, 0.16, 0.20);
  var color = terrain * (0.18 + 0.82 * ndl);
  color = mix(color, color * (0.72 + 0.28 * wet), wet);
  color = mix(color, riverTint + vec3<f32>(0.03,0.06,0.08)*fresnel, flood * 0.35);
  color += vec3<f32>(0.12,0.16,0.14) * pow(ndl, 24.0);
  color *= exp2(params.exposure);
  color = color / (color + vec3<f32>(1.0));
  color = pow(color, vec3<f32>(1.0/2.2));
  return vec4<f32>(color, 1.0);
}