// cell_index_compute.wgsl
// Rule 1: HEC-RAS WSE is absolute truth; depth is derived presentation only.
// Rule 14: All vertical calculations represent NAVD88.
//
// Coalesced access pattern (workgroup 16x16):
//   - Adjacent threads load adjacent texels → cache-line friendly textureLoad
//   - WSE storage buffer indexed by cell id (random but sparse vs full-grid scan)
//   - Prefer this path after CPU-sealed cell_index_map (rasterio) exists
//   - O(N_cells) nearest bake (cell_index_bake.wgsl) is OPTIONAL and gated

struct Params {
    map_size: vec2<u32>,
    nodata_cell: u32,      // 0xFFFFFFFF
    nodata_wse_mm: i32,    // -9999
}

@group(0) @binding(0) var dem_tex: texture_2d<f32>;
@group(0) @binding(1) var cell_index_map: texture_2d<u32>;
@group(0) @binding(2) var<storage, read> wse_mm: array<i32>;
@group(0) @binding(3) var depth_out: texture_storage_2d<r32float, write>;
@group(0) @binding(4) var<uniform> params: Params;

@compute @workgroup_size(16, 16, 1)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
    // Bounds check — early exit preserves occupancy on edge tiles
    if (gid.x >= params.map_size.x || gid.y >= params.map_size.y) {
        return;
    }

    let coord = vec2<i32>(i32(gid.x), i32(gid.y));

    // Coalesced 2D texture loads (same LOD, sequential coords in wavefront)
    let dem_val = textureLoad(dem_tex, coord, 0).r;
    let cell_id = textureLoad(cell_index_map, coord, 0).r;

    var depth: f32 = 0.0;

    // Nodata / dry cell → depth 0 (presentation only; never invent WSE)
    if (cell_id != params.nodata_cell) {
        let wse_i = wse_mm[cell_id];
        if (wse_i != params.nodata_wse_mm) {
            // mm → meters; dem assumed meters NAVD88
            let wse_m = f32(wse_i) * 0.001;
            // Finite check without isNan/isInf (Naga-safe)
            if (wse_m == wse_m && dem_val == dem_val && wse_m > dem_val) {
                depth = wse_m - dem_val;
            }
        }
    }

    textureStore(depth_out, coord, vec4<f32>(depth, 0.0, 0.0, 1.0));
}
