// GPU bake nearest-cell ids into r32uint storage texture (write-only).
struct BakeParams {
    width: u32,
    height: u32,
    cell_count: u32,
    nodata_id: u32,
    origin_x: f32,
    origin_y: f32,
    pixel_size: f32,
    _pad: f32,
};
struct CellXY { x: f32, y: f32, };

@group(0) @binding(0) var out_map: texture_storage_2d<r32uint, write>;
@group(0) @binding(1) var<storage, read> cells: array<CellXY>;
@group(0) @binding(2) var<uniform> params: BakeParams;

@compute @workgroup_size(16, 16, 1)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
    if (gid.x >= params.width || gid.y >= params.height) { return; }
    let wx = params.origin_x + (f32(gid.x) + 0.5) * params.pixel_size;
    let wy = params.origin_y - (f32(gid.y) + 0.5) * params.pixel_size;
    var best_d2 = 1e30;
    var best_id = params.nodata_id;
    for (var i = 0u; i < params.cell_count; i++) {
        let c = cells[i];
        let dx = wx - c.x;
        let dy = wy - c.y;
        let d2 = dx * dx + dy * dy;
        if (d2 < best_d2) {
            best_d2 = d2;
            best_id = i;
        }
    }
    textureStore(out_map, vec2<i32>(i32(gid.x), i32(gid.y)), vec4<u32>(best_id, 0u, 0u, 1u));
}
