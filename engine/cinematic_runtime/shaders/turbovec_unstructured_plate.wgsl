// UINT cell index map: textureLoad only (no filtered sample)
struct VertexOutput {
    @builtin(position) clip_position: vec4<f32>,
    @location(0) world_pos: vec3<f32>,
    @location(1) uv: vec2<f32>,
};
struct PlateParams {
    map_size: vec2<u32>,
    cell_count: u32,
    _pad: u32,
};
@group(0) @binding(0) var dem_texture: texture_2d<f32>;
@group(0) @binding(1) var cell_index_map: texture_2d<u32>;
@group(0) @binding(2) var<storage, read> wse_array: array<f32>;
@group(0) @binding(3) var tex_sampler: sampler;
@group(0) @binding(4) var<uniform> params: PlateParams;

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
    let dims = vec2<i32>(params.map_size);
    let px = vec2<i32>(
        i32(clamp(in.uv.x, 0.0, 1.0) * f32(dims.x - 1u)),
        i32(clamp(in.uv.y, 0.0, 1.0) * f32(dims.y - 1u))
    );
    let cell_id = textureLoad(cell_index_map, px, 0).r;
    let terrain_color = vec3<f32>(0.3, 0.4, 0.2);
    if (cell_id == 0xffffffffu || cell_id >= params.cell_count) {
        return vec4<f32>(terrain_color, 1.0);
    }
    let wse_elev = wse_array[cell_id];
    let dem_elev = in.world_pos.y;
    if (wse_elev > -9000.0 && wse_elev > dem_elev) {
        let water_depth = wse_elev - dem_elev;
        let water_color = mix(
            vec3<f32>(0.2, 0.6, 0.8),
            vec3<f32>(0.05, 0.2, 0.4),
            clamp(water_depth / 5.0, 0.0, 1.0)
        );
        let alpha = clamp(water_depth * 0.5, 0.4, 0.9);
        return vec4<f32>(mix(terrain_color, water_color, alpha), 1.0);
    }
    return vec4<f32>(terrain_color, 1.0);
}
