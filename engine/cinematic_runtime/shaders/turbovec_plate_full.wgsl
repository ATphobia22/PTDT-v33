// Full vertex + fragment — render-origin relative positions only
// r32float DEM/WSE are unfilterable in WebGPU; use textureLoad, not textureSample.
struct Uniforms {
    view_proj: mat4x4<f32>,
    light_dir: vec3<f32>,
    _pad0: f32,
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

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var dem_texture: texture_2d<f32>;
@group(0) @binding(2) var wse_texture: texture_2d<f32>;

fn uv_to_coord(tex: texture_2d<f32>, uv: vec2<f32>) -> vec2<i32> {
    let dims = textureDimensions(tex);
    let max_coord = vec2<u32>(max(dims.x, 1u) - 1u, max(dims.y, 1u) - 1u);
    let clamped_uv = clamp(uv, vec2<f32>(0.0), vec2<f32>(1.0));
    return vec2<i32>(
        i32(clamped_uv.x * f32(max_coord.x)),
        i32(clamped_uv.y * f32(max_coord.y))
    );
}

@vertex
fn vs_main(in: VertexInput) -> VertexOutput {
    var out: VertexOutput;
    let dem_elev = textureLoad(dem_texture, uv_to_coord(dem_texture, in.uv), 0).r;
    let world_p = vec3<f32>(in.position.x, dem_elev, in.position.z);
    out.world_pos = world_p;
    out.clip_position = uniforms.view_proj * vec4<f32>(world_p, 1.0);
    out.uv = in.uv;
    out.dem_elev = dem_elev;
    return out;
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
    let terrain_base = vec3<f32>(0.35, 0.42, 0.28);
    let dx = dpdx(in.world_pos);
    let dy = dpdy(in.world_pos);
    let nrm = normalize(cross(dx, dy));
    let lit = max(dot(nrm, normalize(uniforms.light_dir)), 0.18);
    let terrain_color = terrain_base * lit;

    let wse = textureLoad(wse_texture, uv_to_coord(wse_texture, in.uv), 0).r;
    if (wse > -9000.0 && wse > in.dem_elev) {
        let depth = wse - in.dem_elev;
        let water = mix(
            vec3<f32>(0.2, 0.6, 0.8),
            vec3<f32>(0.05, 0.2, 0.4),
            clamp(depth * 0.2, 0.0, 1.0)
        );
        let alpha = clamp(depth * 0.5, 0.4, 0.9);
        return vec4<f32>(mix(terrain_color, water, alpha), 1.0);
    }
    return vec4<f32>(terrain_color, 1.0);
}
