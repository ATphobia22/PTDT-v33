// Optimized UV→texel: clamp + floor + min(w-1), u32 coords for textureLoad
struct Uniforms {
    view_proj: mat4x4<f32>,
    light_dir: vec3<f32>,
    _pad0: f32,
};
struct PlateParams {
    map_width: u32,
    map_height: u32,
    cell_count: u32,
    nodata_id: u32,
};
struct VertexInput {
    @location(0) position: vec3<f32>,
    @location(1) uv: vec2<f32>,
};
struct VertexOutput {
    @builtin(position) clip_position: vec4<f32>,
    @location(0) world_pos: vec3<f32>,
    @location(1) uv: vec2<f32>,
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var dem_texture: texture_2d<f32>;
@group(0) @binding(2) var dem_sampler: sampler;
@group(0) @binding(3) var cell_index_map: texture_2d<u32>;
@group(0) @binding(4) var<storage, read> wse_array: array<f32>;
@group(0) @binding(5) var<uniform> plate: PlateParams;

fn uv_to_texel_u32(uv: vec2<f32>, width: u32, height: u32) -> vec2<u32> {
    let u = clamp(uv.x, 0.0, 1.0);
    let v = clamp(uv.y, 0.0, 1.0);
    let wm = max(width, 1u);
    let hm = max(height, 1u);
    let x = min(u32(floor(u * f32(wm))), wm - 1u);
    let y = min(u32(floor(v * f32(hm))), hm - 1u);
    return vec2<u32>(x, y);
}

@vertex
fn vs_main(in: VertexInput) -> VertexOutput {
    var out: VertexOutput;
    let dem_elev = textureSampleLevel(dem_texture, dem_sampler, in.uv, 0.0).r;
    let world_p = vec3<f32>(in.position.x, dem_elev, in.position.z);
    out.world_pos = world_p;
    out.clip_position = uniforms.view_proj * vec4<f32>(world_p, 1.0);
    out.uv = in.uv;
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

    if (plate.map_width == 0u || plate.map_height == 0u || plate.cell_count == 0u) {
        return vec4<f32>(terrain_color, 1.0);
    }

    let px = uv_to_texel_u32(in.uv, plate.map_width, plate.map_height);
    let cell_id = textureLoad(cell_index_map, px, 0).r;

    if (cell_id == plate.nodata_id || cell_id >= plate.cell_count) {
        return vec4<f32>(terrain_color, 1.0);
    }

    let wse_elev = wse_array[cell_id];
    let dem_elev = in.world_pos.y;

    if (wse_elev > -9000.0 && wse_elev > dem_elev) {
        let depth = wse_elev - dem_elev;
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
