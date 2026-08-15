// preprocess_dem_wse.wgsl — GPU depth pre-pass (presentation copies only)
struct PreprocessParams {
    width: u32,
    height: u32,
    nodata_wse: f32,
    _pad: f32,
};

@group(0) @binding(0) var<uniform> params: PreprocessParams;
@group(0) @binding(1) var dem_tex: texture_2d<f32>;
@group(0) @binding(2) var wse_tex: texture_2d<f32>;
@group(0) @binding(3) var depth_out: texture_storage_2d<r32float, write>;

@compute @workgroup_size(16, 16, 1)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
    if (gid.x >= params.width || gid.y >= params.height) { return; }
    let coord = vec2<i32>(i32(gid.x), i32(gid.y));
    let dem = textureLoad(dem_tex, coord, 0).r;
    let wse = textureLoad(wse_tex, coord, 0).r;
    var depth = 0.0;
    if (wse > params.nodata_wse + 1.0 && wse == wse && dem == dem && wse > dem) {
        depth = wse - dem;
    }
    textureStore(depth_out, coord, vec4<f32>(depth, 0.0, 0.0, 1.0));
}
