// water_particle_compute.wgsl
// PTDT derived VFX only — particles are non-authoritative.
// RigidBody buffer is a STRICT immutable snapshot from a seal-verified envelope.
// GPU must never write back into authoritative PTDT / HEC-RAS / NAVD88 state.

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
  if (d2 < 1e-12) {
    let to_min = (*p).pos - min_b;
    let to_max = max_b - (*p).pos;
    let nx = select(-1.0, 1.0, to_min.x < to_max.x);
    let ny = select(-1.0, 1.0, to_min.y < to_max.y);
    let nz = select(-1.0, 1.0, to_min.z < to_max.z);
    let ax = min(to_min.x, to_max.x);
    let ay = min(to_min.y, to_max.y);
    let az = min(to_min.z, to_max.z);
    if (ax <= ay && ax <= az) {
      (*p).pos.x += nx * (r + ax);
      (*p).vel.x = -(*p).vel.x * b.restitution;
    } else if (ay <= az) {
      (*p).pos.y += ny * (r + ay);
      (*p).vel.y = -(*p).vel.y * b.restitution;
    } else {
      (*p).pos.z += nz * (r + az);
      (*p).vel.z = -(*p).vel.z * b.restitution;
    }
    return;
  }
  let d = sqrt(d2);
  if (d < r) {
    let n = diff / d;
    let pen = r - d;
    (*p).pos = (*p).pos + n * pen;
    let vn = dot((*p).vel, n);
    if (vn < 0.0) {
      (*p).vel = (*p).vel - (1.0 + b.restitution) * vn * n;
    }
  }
}

@compute @workgroup_size(256, 1, 1)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let i = gid.x;
  if (i >= params.particle_count) {
    return;
  }

  var p = particles[i];
  p.vel.y = p.vel.y + params.gravity * params.dt;
  p.vel = p.vel * params.damping;
  p.pos = p.pos + p.vel * params.dt;

  for (var b_i = 0u; b_i < params.body_count; b_i++) {
    resolve_sphere_aabb(&p, bodies[b_i]);
  }

  if (p.pos.y < 0.05) {
    p.pos.y = 0.05;
    if (p.vel.y < 0.0) {
      p.vel.y = -p.vel.y * 0.3;
    }
  }

  particles[i] = p;
}
