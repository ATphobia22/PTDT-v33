"""USD SceneState Validation Suite"""
from __future__ import annotations
from dataclasses import dataclass, field
from typing import Any
from engine.cinematic_runtime.usd_scene_state_generator import PtdtSceneState, UsdSceneStateGenerator

@dataclass
class ValidationIssue:
    code: str
    message: str
    severity: str

@dataclass
class ValidationReport:
    ok: bool
    issues: list[ValidationIssue] = field(default_factory=list)
    scene_state_seal: str = ""
    def as_dict(self) -> dict[str, Any]:
        return {"ok": self.ok, "scene_state_seal": self.scene_state_seal,
                "issues": [{"code": i.code, "message": i.message, "severity": i.severity} for i in self.issues]}

class UsdSceneStateValidationSuite:
    REQUIRED_PATHS = ("/World/Terrain", "/World/Hydraulics/WseOverlay", "/World/Buildings", "/World/Cameras/Cinematic_A")
    def __init__(self) -> None:
        self.gen = UsdSceneStateGenerator()
    def validate(self, state: PtdtSceneState | None = None) -> ValidationReport:
        if state is None:
            state = self.gen.build_default_bonebank()
        issues: list[ValidationIssue] = []
        if state.vertical_datum != "NAVD88":
            issues.append(ValidationIssue("DATUM", f"expected NAVD88 got {state.vertical_datum}", "ERROR"))
        if state.authority != "PRESENTATION":
            issues.append(ValidationIssue("AUTHORITY", f"must be PRESENTATION (got {state.authority})", "ERROR"))
        if state.meters_per_unit <= 0:
            issues.append(ValidationIssue("UNITS", "meters_per_unit must be > 0", "ERROR"))
        paths = {p.path for p in state.prims}
        for req in self.REQUIRED_PATHS:
            if req not in paths:
                issues.append(ValidationIssue("PRIM", f"missing required prim {req}", "ERROR"))
        if not state.prims:
            issues.append(ValidationIssue("EMPTY", "no prims", "ERROR"))
        for p in state.prims:
            if not p.path.startswith("/"):
                issues.append(ValidationIssue("PATH", f"prim path must be absolute: {p.path}", "ERROR"))
        seal = self.gen.seal(state)
        ok = not any(i.severity == "ERROR" for i in issues)
        return ValidationReport(ok=ok, issues=issues, scene_state_seal=seal)
