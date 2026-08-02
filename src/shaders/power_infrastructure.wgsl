@group(0) @binding(0) var<storage, read_write> powerGridStatus : array<f32>;
@group(0) @binding(1) var<storage, read> floodPlane : array<f32>;
@group(0) @binding(2) var<storage, read> substationMask : array<f32>;
@group(0) @binding(3) var<uniform> dt : f32;

fn idx(x: u32, y: u32, w: u32) -> u32 {
 return y * w + x;
}

@compute @workgroup_size(8, 8)
fn cs_power_failure(@builtin(global_invocation_id) gid: vec3<u32>) {
 let w = 256u;
 let h = 256u;
 if (gid.x >= w || gid.y >= h) { return; }

 let i = idx(gid.x, gid.y, w);
 let flood = floodPlane[i];
 let mask = substationMask[i];
 let status = powerGridStatus[i];

 var failureRate = 0.0;
 if (flood > 0.5 && mask > 0.5) {
  failureRate = 0.95;
 }

 let newStatus = clamp(status + (failureRate - 0.001) * dt, 0.0, 1.0);
 powerGridStatus[i] = newStatus;
}
