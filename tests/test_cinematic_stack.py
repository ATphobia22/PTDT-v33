from engine.cinematic_runtime.acescg_hydra_viewport import (
    ACEScgHydraViewportConfig,
    seal_viewport_config,
)
from engine.cinematic_runtime.webgpu_cinematic_frame_emitter import (
    WebGPUCinematicFrameEmitter,
    verify_frame_seal,
)
from engine.cinematic_runtime.usd_scene_state_generator import UsdSceneStateGenerator
from engine.cinematic_runtime.archimedes_webgpu_coupler import (
    ArchimedesWebGPUCoupler,
    DEFAULT_LAG_FT,
    DEFAULT_BFE_FT,
)


def test_viewport_seal_stable():
    cfg = ACEScgHydraViewportConfig()
    assert seal_viewport_config(cfg) == seal_viewport_config(cfg)


def test_frame_emitter_seal():
    em = WebGPUCinematicFrameEmitter()
    fr = em.emit(width=1920, height=1080, plate_ids=["plate-0"], dem_sha256="abc")
    assert verify_frame_seal(fr)
    fr.sequence = 99
    assert not verify_frame_seal(fr)


def test_usd_scene_state_bonebank():
    gen = UsdSceneStateGenerator()
    state = gen.build_default_bonebank()
    d = gen.to_dict(state)
    assert d["verticalDatum"] == "NAVD88"
    assert len(gen.seal(state)) == 64


def test_archimedes_gpu_pack():
    c = ArchimedesWebGPUCoupler()
    u = c.from_defaults()
    pack = c.pack_for_webgpu(u)
    assert pack["byteLength"] == 64
    assert len(u.to_bytes()) == 64
    assert abs(u.clearance_ft - (DEFAULT_LAG_FT - DEFAULT_BFE_FT)) < 1e-9
