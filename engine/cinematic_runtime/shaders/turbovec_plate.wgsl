// turbovec_plate.wgsl — DEM plate + HEC-RAS WSE overlay (derived visualization)
// WSE texture must be seal-verified and UV-aligned to DEM (rasterized if mesh unstructured).

struct VertexInput {
    @location(0) position: vec3<f32>,
    @location(1) uv: vec2<f32>,
};

struct VertexOutput {
    @builtin(position) clip_position: vec4<f32>,
    @location(0) world_pos: vec3<f32>,
    @location(1) uv: vec2<f32>,
};

struct Uniforms {
    view_proj: mat4x4<f32>,
    light_dir: vec3<f32>,
    _pad: f32,
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var dem_texture: texture_2d<f32>;
@group(0) @binding(2) var wse_texture: texture_2d<f32>;
@group(0) @binding(3) var tex_sampler: sampler;

@vertex
fn vs_main(in: VertexInput) -> VertexOutput {
    var out: VertexOutput;
    let dem_elev = textureSampleLevel(dem_texture, tex_sampler, in.uv, 0.0).r;
    let world_p = vec3<f32>(in.position.x, dem_elev, in.position.z);
    out.world_pos = world_p;
    out.clip_position = uniforms.view_proj * vec4<f32>(world_p, 1.0);
    out.uv = in.uv;
    return out;
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
    let dx = dpdx(in.world_pos);
    let dy = dpdy(in.world_pos);
    let normal = normalize(cross(dx, dy));
    let sun_light = max(dot(normal, normalize(uniforms.light_dir)), 0.2);
    let terrain_color = vec3<f32>(0.35, 0.42, 0.28) * sun_light;

    let wse_elev = textureSample(wse_texture, tex_sampler, in.uv).r;
    let dem_elev = in.world_pos.y;

    if (wse_elev > -9000.0 && wse_elev > dem_elev) {
        let water_depth = wse_elev - dem_elev;
        let shallow_color = vec3<f32>(0.2, 0.6, 0.8);
        let deep_color = vec3<f32>(0.05, 0.2, 0.4);
        let depth_blend = clamp(water_depth / 5.0, 0.0, 1.0);
        let water_color = mix(shallow_color, deep_color, depth_blend);
        let alpha = clamp(water_depth * 0.5, 0.4, 0.9);
        let final_color = mix(terrain_color, water_color, alpha);
        return vec4<f32>(final_color, 1.0);
    }
    return vec4<f32>(terrain_color, 1.0);
}
