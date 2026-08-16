struct RescueAgent {
 pos : vec4<f32>,
 vel : vec4<f32>,
};

@group(0) @binding(0) var<storage, read_write> rescueAgents : array<RescueAgent>;
@group(0) @binding(1) var<storage, read> floodPlane : array<f32>;
@group(0) @binding(2) var<storage, read> highGroundMask : array<f32>;
@group(0) @binding(3) var<uniform> dt : f32;

fn idx(x: u32, y: u32, w: u32) -> u32 {
 return y * w + x;
}

@compute @workgroup_size(64)
fn cs_rescue_pathfinding(@builtin(global_invocation_id) gid: vec3<u32>) {
 let i = gid.x;
 if (i >= arrayLength(&rescueAgents)) { return; }

 var agent = rescueAgents[i];
 let w = 256u;
 let h = 256u;

 let sx = clamp((agent.pos.x + 2000.0) / 4000.0 * f32(w - 1u), 0.0, f32(w - 1u));
 let sz = clamp((agent.pos.z + 2000.0) / 4000.0 * f32(h - 1u), 0.0, f32(h - 1u));
 let ix = u32(sx);
 let iz = u32(sz);

 let floodDepth = floodPlane[idx(ix, iz, w)];
 let highGround = highGroundMask[idx(ix, iz, w)];

 let avoidHazard = floodDepth * 1.5;
 let seekSafe = highGround * 2.0;

 var vx = (seekSafe - avoidHazard) * 1.2;
 var vz = (seekSafe - avoidHazard) * 1.2;

 agent.pos.x += vx * dt;
 agent.pos.z += vz * dt;

 rescueAgents[i] = agent;
}
