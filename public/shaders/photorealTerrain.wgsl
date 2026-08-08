struct Uniforms {
  viewProj: mat4x4<f32>,
  invViewProj: mat4x4<f32>,
  cameraPos: vec3<f32>,
  time: f32,
  lightDir: vec3<f32>,
  bfeFt: f32,
  resolution: vec2<f32>,
  heightScaleFt: f32,
  heightOffsetFt: f32,
  waterLevelFt: f32,
  wetness: f32,
};

@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(1) var heightTex: texture_2d<f32>;
@group(0) @binding(2) var heightSampler: sampler;

struct VSOut { @builtin(position) pos: vec4<f32>, @location(0) uv: vec2<f32> };

@vertex fn vs(@builtin(vertex_index) i: u32) -> VSOut {
  var p = array<vec2<f32>, 3>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>( 3.0, -1.0),
    vec2<f32>(-1.0,  3.0)
  );
  var o: VSOut;
  o.pos = vec4<f32>(p[i], 0.0, 1.0);
  o.uv = p[i] * 0.5 + 0.5;
  o.uv.y = 1.0 - o.uv.y;
  return o;
}

fn hash21(p: vec2<f32>) -> f32 {
  return fract(sin(dot(p, vec2<f32>(127.1, 311.7))) * 43758.5453123);
}

fn noise2(p: vec2<f32>) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let u = f * f * (3.0 - 2.0 * f);
  let a = hash21(i);
  let b = hash21(i + vec2<f32>(1.0, 0.0));
  let c = hash21(i + vec2<f32>(0.0, 1.0));
  let d = hash21(i + vec2<f32>(1.0, 1.0));
  return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
}

fn terrainHeight(uv: vec2<f32>) -> f32 {
  let h = textureSampleLevel(heightTex, heightSampler, clamp(uv, vec2<f32>(0.001), vec2<f32>(0.999)), 0.0).r;
  let macro = noise2(uv * 180.0) * 0.015;
  return u.heightOffsetFt + (h + macro) * u.heightScaleFt;
}

fn worldFromDepth(uv: vec2<f32>, depth: f32) -> vec3<f32> {
  let clip = vec4<f32>(uv * 2.0 - 1.0, depth, 1.0);
  let worldH = u.invViewProj * clip;
  return worldH.xyz / max(worldH.w, 0.00001);
}

fn rayDirection(uv: vec2<f32>) -> vec3<f32> {
  let farP = worldFromDepth(uv, 1.0);
  return normalize(farP - u.cameraPos);
}

fn terrainNormal(uv: vec2<f32>) -> vec3<f32> {
  let e = 1.0 / max(u.resolution.x, 1024.0);
  let hx = terrainHeight(uv + vec2<f32>(e,0.0));
  let hz = terrainHeight(uv + vec2<f32>(0.0,e));
  let h0 = terrainHeight(uv);
  return normalize(vec3<f32>((h0-hx) * 3.0, 1.0, (h0-hz) * 3.0));
}

fn skyColor(rd: vec3<f32>) -> vec3<f32> {
  let sun = pow(max(dot(rd, normalize(-u.lightDir)), 0.0), 700.0);
  let horizon = pow(1.0 - max(rd.y, 0.0), 2.0);
  return mix(vec3<f32>(0.025,0.07,0.13), vec3<f32>(0.18,0.34,0.48), horizon * 0.7) + vec3<f32>(1.0,0.72,0.38) * sun;
}

fn aces(x: vec3<f32>) -> vec3<f32> {
  let a = 2.51; let b = 0.03; let c = 2.43; let d = 0.59; let e = 0.14;
  return clamp((x*(a*x+b))/(x*(c*x+d)+e), vec3<f32>(0.0), vec3<f32>(1.0));
}

@fragment fn fs(v: VSOut) -> @location(0) vec4<f32> {
  let rd = rayDirection(v.uv);
  var ro = u.cameraPos;
  var t = 20.0;
  var hit = false;
  var hitP = ro;
  var hitUv = v.uv;

  for (var i: u32 = 0u; i < 72u; i++) {
    let p = ro + rd * t;
    let uv = p.xz / 10000.0 + vec2<f32>(0.5);
    if (any(uv < vec2<f32>(0.0)) || any(uv > vec2<f32>(1.0))) { break; }
    let h = terrainHeight(uv);
    let d = p.y - h;
    if (d < 0.0) {
      hit = true; hitP = p; hitUv = uv; break;
    }
    t += max(4.0, d * 0.42);
  }

  var color = skyColor(rd);
  if (hit) {
    let n = terrainNormal(hitUv);
    let l = normalize(-u.lightDir);
    let ndl = max(dot(n,l),0.0);
    let vdir = normalize(u.cameraPos-hitP);
    let fresnel = pow(1.0-max(dot(n,vdir),0.0),5.0);
    let elevation = terrainHeight(hitUv);
    let aboveBfe = smoothstep(u.bfeFt - 1.0, u.bfeFt + 1.0, elevation);
    let wet = clamp(u.wetness + (1.0-aboveBfe)*0.65, 0.0, 1.0);
    let grain = noise2(hitUv*900.0)*0.06;
    let vegetation = mix(vec3<f32>(0.16,0.20,0.12), vec3<f32>(0.28,0.33,0.18), aboveBfe);
    var terrain = vegetation * (0.22 + 0.78*ndl) + vec3<f32>(grain);
    terrain *= 1.0 - wet*0.18;

    let water = vec3<f32>(0.025,0.12,0.16) + vec3<f32>(0.08,0.16,0.18)*fresnel;
    let submerged = smoothstep(u.bfeFt + 0.25, u.bfeFt - 0.25, elevation);
    color = mix(terrain, water, submerged);

    let fog = 1.0-exp(-t*0.000035);
    color = mix(color, skyColor(rd), fog);
  }

  let vignette = 1.0 - 0.22*pow(length(v.uv-vec2<f32>(0.5))*1.4142,2.0);
  color *= vignette;
  color = aces(color);
  color = pow(color, vec3<f32>(1.0/2.2));
  return vec4<f32>(color,1.0);
}
