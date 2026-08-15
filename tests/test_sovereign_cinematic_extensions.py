from engine.cinematic_runtime.archimedes_ptdt_hecras_pipeline import ArchimedesPtdtHecrasPipeline
from engine.cinematic_runtime.cinematic_affidavit import CinematicAffidavitGenerator, verify_affidavit
from engine.cinematic_runtime.usd_webgpu_sovereign_renderer import UsdWebGpuSovereignRenderer
from engine.cinematic_runtime.scene_state_webgpu_buffers import SceneStateWebGpuBufferGenerator
from engine.cinematic_runtime.ptdt_archimedes_usd_coupler import PtdtArchimedesUsdCoupler
from engine.cinematic_runtime.scene_state_affidavit_renderer import SceneStateAffidavitRenderer
from engine.cinematic_runtime.usd_scene_state_validation import UsdSceneStateValidationSuite

def test_unified_pipeline_defaults():
    r = ArchimedesPtdtHecrasPipeline().run()
    assert r.pipeline_seal
    assert any(s.name == "archimedes_pack" and s.status == "OK" for s in r.steps)

def test_affidavit_seal():
    aff = CinematicAffidavitGenerator().generate(frame_seal="abc")
    assert verify_affidavit(aff)
    aff.frame_seal = "mutated"
    assert not verify_affidavit(aff)

def test_sovereign_render_plan():
    plan = UsdWebGpuSovereignRenderer().build_plan()
    assert plan.plan_seal
    assert plan.webgpu_buffers["archimedes_uniforms"]["byteLength"] == 64

def test_webgpu_buffers():
    bufs = SceneStateWebGpuBufferGenerator().generate()
    assert len(bufs) == 2 and bufs[0].size == 64

def test_ptdt_arch_usd_coupler():
    out = PtdtArchimedesUsdCoupler().couple()
    assert out["scene_state_seal"] and out["archimedes"]["byteLength"] == 64

def test_scene_affidavit_renderer():
    aff, md = SceneStateAffidavitRenderer().render()
    assert verify_affidavit(aff) and "Cinematic Affidavit" in md

def test_usd_validation_suite():
    report = UsdSceneStateValidationSuite().validate()
    assert report.ok and report.scene_state_seal
