"""Cinematic Affidavit Generator — presentation forensic record (not LOMA)."""
from __future__ import annotations
import json, time
from dataclasses import dataclass, field
from hashlib import sha256
from typing import Any

@dataclass
class CinematicAffidavit:
    schema_version: int = 1
    pipeline_state_version: str = "v33.0"
    property_label: str = "13101 Bonebank Road, Point Township, Posey County, IN"
    vertical_datum: str = "NAVD88"
    bfe_ft: float = 375.0
    lag_ft: float = 377.2
    ffe_ft: float = 382.5
    frame_seal: str = ""
    scene_state_seal: str = ""
    composition_stack_sha256: str = ""
    archimedes_uniform_seal: str = ""
    authority: str = "PRESENTATION_AFFIDAVIT"
    statements: list[str] = field(default_factory=list)
    timestamp_unix: float = 0.0
    cryptographic_seal: str = ""
    def payload_for_seal(self) -> dict[str, Any]:
        return {"schema_version": self.schema_version, "pipeline_state_version": self.pipeline_state_version,
                "property_label": self.property_label, "vertical_datum": self.vertical_datum,
                "bfe_ft": self.bfe_ft, "lag_ft": self.lag_ft, "ffe_ft": self.ffe_ft,
                "frame_seal": self.frame_seal, "scene_state_seal": self.scene_state_seal,
                "composition_stack_sha256": self.composition_stack_sha256,
                "archimedes_uniform_seal": self.archimedes_uniform_seal, "authority": self.authority,
                "statements": list(self.statements), "timestamp_unix": self.timestamp_unix}

def seal_affidavit(aff: CinematicAffidavit) -> str:
    raw = json.dumps(aff.payload_for_seal(), sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    return sha256(raw.encode("utf-8")).hexdigest()

def verify_affidavit(aff: CinematicAffidavit) -> bool:
    return aff.cryptographic_seal == seal_affidavit(aff)

class CinematicAffidavitGenerator:
    DEFAULT_STATEMENTS = [
        "This record binds cinematic presentation outputs to sealed pipeline inputs.",
        "It does not constitute LOMA, No-Rise, or PE-sealed engineering evidence.",
        "Vertical datum for labeled elevations is NAVD88.",
        "HEC-RAS and Material Truth remain authoritative for regulatory claims.",
    ]
    def generate(self, *, frame_seal: str = "", scene_state_seal: str = "",
                 composition_stack_sha256: str = "", archimedes_uniform_seal: str = "",
                 pipeline_state_version: str = "v33.0", extra_statements: list[str] | None = None) -> CinematicAffidavit:
        stmts = list(self.DEFAULT_STATEMENTS) + (extra_statements or [])
        aff = CinematicAffidavit(pipeline_state_version=pipeline_state_version, frame_seal=frame_seal,
            scene_state_seal=scene_state_seal, composition_stack_sha256=composition_stack_sha256,
            archimedes_uniform_seal=archimedes_uniform_seal, statements=stmts, timestamp_unix=time.time())
        aff.cryptographic_seal = seal_affidavit(aff)
        return aff
    def to_markdown(self, aff: CinematicAffidavit) -> str:
        lines = ["# PTDT Cinematic Affidavit (Presentation)", "",
            f"**Seal:** `{aff.cryptographic_seal}`", f"**Pipeline:** {aff.pipeline_state_version}",
            f"**Property:** {aff.property_label}", f"**Datum:** {aff.vertical_datum}",
            f"**BFE / LAG / FFE:** {aff.bfe_ft} / {aff.lag_ft} / {aff.ffe_ft} ft", "",
            "## Bound seals", f"- frame: `{aff.frame_seal or '—'}`",
            f"- scene_state: `{aff.scene_state_seal or '—'}`",
            f"- composition_stack: `{aff.composition_stack_sha256 or '—'}`",
            f"- archimedes_uniforms: `{aff.archimedes_uniform_seal or '—'}`", "", "## Statements"]
        for s in aff.statements:
            lines.append(f"- {s}")
        lines.append("")
        return chr(10).join(lines)
