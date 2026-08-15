// headField.wgsl — groundwater head visualization (PRESENTATION only)
// MODFLOW6 exclusive authority; dry sentinel skips inactive cells.

struct HeadUniforms {
    view_proj: mat4x4<f32>,
    light_dir: vec3<f32>,
    _pad0: f32,
    head_min_ft: f32,
    head_max_ft: f32,
    dry_sentinel: f32,
    opacity: f32,
    show_water_table: u32,
    _pad1: u32,
    _pad2: u32,
    _pad3: u32,
};

struct VertexInput {
    @location(0) position: vec3<f32>,
    @location(1) uv: vec2<f32>,
};

struct VertexOutput {
    @builtin(position) clip_position: vec4<f32>,
    @location(0) world_pos: vec3<f32>,
    @location(1) uv: vec2<f32>,
    @location(2) dem_elev: f32,
};

@group(0) @binding(0) var<uniform> u: HeadUniforms;
@group(0) @binding(1) var dem_texture: texture_2d<f32>;
@group(0) @binding(2) var dem_sampler: sampler;
@group(0) @binding(3) var head_texture: texture_2d<f32>;
@group(0) @binding(4) var head_sampler: sampler;

fn turbo_ramp(t: f32) -> vec3<f32> {
    let x = clamp(t, 0.0, 1.0);
    return vec3<f32>(
        clamp(1.5 - abs(2.2 * x - 1.6), 0.0, 1.0),
        clamp(1.5 - abs(2.2 * x - 1.0), 0.0, 1.0),
        clamp(1.5 - abs(2.2 * x - 0.4), 0.0, 1.0)
    );
}

@vertex
fn vs_main(in: VertexInput) -> VertexOutput {
    var out: VertexOutput;
    let dem_elev = textureSampleLevel(dem_texture, dem_sampler, in.uv, 0.0).r;
    let world_p = vec3<f32>(in.position.x, dem_elev, in.position.z);
    out.world_pos = world_p;
    out.clip_position = u.view_proj * vec4<f32>(world_p, 1.0);
    out.uv = in.uv;
    out.dem_elev = dem_elev;
    return out;
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
    let terrain_base = vec3<f32>(0.32, 0.38, 0.28);
    let dx = dpdx(in.world_pos);
    let dy = dpdy(in.world_pos);
    let nrm = normalize(cross(dx, dy));
    let lit = max(dot(nrm, normalize(u.light_dir)), 0.15);
    let terrain = terrain_base * lit;

    let head = textureSample(head_texture, head_sampler, in.uv).r;
    if (head <= u.dry_sentinel + 1.0 || !(head == head)) {
        return vec4<f32>(terrain, 1.0);
    }

    let span = max(u.head_max_ft - u.head_min_ft, 1e-3);
    let t = clamp((head - u.head_min_ft) / span, 0.0, 1.0);
    var head_color = turbo_ramp(t);

    if (u.show_water_table != 0u && head > in.dem_elev) {
        let depth = head - in.dem_elev;
        let water = mix(
            vec3<f32>(0.15, 0.45, 0.65),
            vec3<f32>(0.05, 0.2, 0.4),
            clamp(depth / 5.0, 0.0, 1.0)
        );
        head_color = mix(head_color, water, 0.55);
    }

    let a = clamp(u.opacity, 0.0, 1.0);
    return vec4<f32>(mix(terrain, head_color, a), 1.0);
}
