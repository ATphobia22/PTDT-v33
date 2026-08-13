// water_particle_compute.wgsl — browser copy (same as engine/cinematic_runtime/shaders/)
// Derived VFX only. RigidBody buffer immutable. See docs/ptdt-v33/WEBGPU_WATER_PARTICLE_KERNEL.md

struct Particle {
  pos: vec3<f32>,
  inv_mass: f32,
  vel: vec3<f32>,
  pad0: f32,
};

struct RigidBody {
  center: vec3<f32>,
  half_extents: f32,
  half_xyz: vec3<f32>,
  restitution: f32,
};

struct SimParams {
  dt: f32,
  gravity: f32,
  damping: f32,
  body_count: u32,
  particle_count: u32,
  _pad0: u32,
  _pad1: u32,
  _pad2: u32,
};

@group(0) @binding(0) var<storage, read_write> particles: array<Particle>;
@group(0) @binding(1) var<storage, read> bodies: array<RigidBody>;
@group(0) @binding(2) var<uniform> params: SimParams;

fn resolve_sphere_aabb(p: ptr<function, Particle>, b: RigidBody) {
  let min_b = b.center - b.half_xyz;
  let max_b = b.center + b.half_xyz;
  let q = clamp((*p).pos, min_b, max_b);
  var diff = (*p).pos - q;
  var d2 = dot(diff, diff);
  let r = 0.05;
  if (d2 < 1e-12) { return; }
  let d = sqrt(d2);
  if (d < r) {
    let n = diff / d;
    (*p).pos = (*p).pos + n * (r - d);
    let vn = dot((*p).vel, n);
    if (vn < 0.0) {
      (*p).vel = (*p).vel - (1.0 + b.restitution) * vn * n;
    }
  }
}

@compute @workgroup_size(256, 1, 1)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let i = gid.x;
  if (i >= params.particle_count) { return; }
  var p = particles[i];
  p.vel.y = p.vel.y + params.gravity * params.dt;
  p.vel = p.vel * params.damping;
  p.pos = p.pos + p.vel * params.dt;
  for (var b_i = 0u; b_i < params.body_count; b_i++) {
    resolve_sphere_aabb(&p, bodies[b_i]);
  }
  if (p.pos.y < 0.05) {
    p.pos.y = 0.05;
    if (p.vel.y < 0.0) { p.vel.y = -p.vel.y * 0.3; }
  }
  particles[i] = p;
}
