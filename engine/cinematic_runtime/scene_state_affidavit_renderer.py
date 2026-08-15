"""USD SceneState ≥ Cinematic Affidavit Renderer"""
from __future__ import annotations

from engine.cinematic_runtime.cinematic_affidavit import (
    CinematicAffidavit,
    CinematicAffidavitGenerator,
)
from engine.cinematic_runtime.usd_scene_state_generator import UsdSceneStateGenerator


class SceneStateAffidavitRenderer:
    def __init__(self) -> None:
        self.usd = UsdSceneStateGenerator()
        self.aff = CinematicAffidavitGenerator()

    def render(
        self,
        *,
        frame_seal: str = "",
        composition_stack_sha256: str = "",
        archimedes_uniform_seal: str = "",
    ) -> tuple[CinematicAffidavit, str]:
        state = self.usd.build_default_bonebank()
        scene_seal = self.usd.seal(state)
        affidavit = self.aff.generate(
            frame_seal=frame_seal,
            scene_state_seal=scene_seal,
            composition_stack_sha256=composition_stack_sha256,
            archimedes_uniform_seal=archimedes_uniform_seal,
        )
        md = self.aff.to_markdown(affidavit)
        return affidavit, md
