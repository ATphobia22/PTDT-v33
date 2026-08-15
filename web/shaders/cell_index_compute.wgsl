// PTDT-v33: HEC-RAS unstructured cell index + WSE depth bake
// r32float DEM / r32uint cell map require textureLoad (unfilterable)
// WSE authority: HEC-RAS only; soft-fail if missing

struct Params {
  map_size: vec2<u32>,
  nodata_cell: u32,
  nodata_wse_mm: i32,
}

@group(0) @binding(0) var dem_tex: texture_2d<f32>;
@group(0) @binding(1) var cell_index_map: texture_2d<u32>;
@group(0) @binding(2) var<storage, read> wse_mm: array<i32>;
@group(0) @binding(3) var depth_out: texture_storage_2d<r32float, write>;
@group(0) @binding(4) var<uniform> params: Params;

@compute @workgroup_size(16, 16, 1)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  if (gid.x >= params.map_size.x || gid.y >= params.map_size.y) {
    return;
  }
  let coord = vec2<i32>(i32(gid.x), i32(gid.y));

  // textureLoad: required for r32float (unfilterable-float) and r32uint
  let dem = textureLoad(dem_tex, coord, 0).r;
  let cell = textureLoad(cell_index_map, coord, 0).r;

  var depth: f32 = 0.0;
  if (cell != params.nodata_cell) {
    let mm = wse_mm[cell];
    if (mm > params.nodata_wse_mm) {
      let wse = f32(mm) * 0.001;
      depth = max(wse - dem, 0.0);
    }
  }
  textureStore(depth_out, coord, vec4<f32>(depth, 0.0, 0.0, 1.0));
}
