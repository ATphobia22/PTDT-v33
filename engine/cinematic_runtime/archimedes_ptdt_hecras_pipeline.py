"""Archimedes ≥ PTDT ≥ HEC-RAS Unified Pipeline"""
from __future__ import annotations

import json
import time
from dataclasses import dataclass, field
from hashlib import sha256
from typing import Any

from engine.cinematic_runtime.archimedes_webgpu_coupler import ArchimedesWebGPUCoupler


@dataclass
class UnifiedPipelineStep:
    name: str
    authority: str
    status: str
    detail: dict[str, Any] = field(default_factory=dict)
    seal: str = ""


@dataclass
class UnifiedPipelineResult:
    pipeline_version: str = "v33.0"
    sequence: int = 0
    steps: list[UnifiedPipelineStep] = field(default_factory=list)
    archimedes_uniforms: dict[str, Any] | None = None
    hecras_wse_sequence: int | None = None
    pipeline_seal: str = ""
    timestamp_unix: float = 0.0

    def as_dict(self) -> dict[str, Any]:
        return {
            "pipeline_version": self.pipeline_version,
            "sequence": self.sequence,
            "steps": [
                {"name": s.name, "authority": s.authority, "status": s.status,
                 "detail": s.detail, "seal": s.seal}
                for s in self.steps
            ],
            "archimedes_uniforms": self.archimedes_uniforms,
            "hecras_wse_sequence": self.hecras_wse_sequence,
            "timestamp_unix": self.timestamp_unix,
            "pipeline_seal": self.pipeline_seal,
        }


def _seal(obj: dict[str, Any]) -> str:
    raw = json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    return sha256(raw.encode("utf-8")).hexdigest()


class ArchimedesPtdtHecrasPipeline:
    def __init__(self, pipeline_version: str = "v33.0") -> None:
        self.pipeline_version = pipeline_version
        self._seq = 0
        self._arch = ArchimedesWebGPUCoupler()

    def run(
        self,
        *,
        archimedes_dict: dict[str, Any] | None = None,
        hecras_hdf: str | None = None,
        hecras_time_index: int = 0,
        soft_fail_hecras: bool = True,
    ) -> UnifiedPipelineResult:
        self._seq += 1
        result = UnifiedPipelineResult(
            pipeline_version=self.pipeline_version,
            sequence=self._seq,
            timestamp_unix=time.time(),
        )
        try:
            uniforms = (
                self._arch.from_archimedes_dict(archimedes_dict)
                if archimedes_dict
                else self._arch.from_defaults()
            )
            pack = self._arch.pack_for_webgpu(uniforms)
            result.steps.append(UnifiedPipelineStep(
                name="archimedes_pack", authority="ENGINEERING", status="OK",
                detail={"byteLength": pack["byteLength"], "manning_n": uniforms.manning_n},
                seal=pack["seal"],
            ))
            result.archimedes_uniforms = pack
        except Exception as e:
            result.steps.append(UnifiedPipelineStep(
                name="archimedes_pack", authority="ENGINEERING", status="FAILED",
                detail={"error": str(e)},
            ))

        if hecras_hdf:
            try:
                result.hecras_wse_sequence = hecras_time_index
                result.steps.append(UnifiedPipelineStep(
                    name="hecras_bind", authority="ENGINEERING", status="OK",
                    detail={"hdf": hecras_hdf, "time_index": hecras_time_index},
                    seal=_seal({"hdf": hecras_hdf, "t": hecras_time_index}),
                ))
            except Exception as e:
                status = "SKIPPED" if soft_fail_hecras else "FAILED"
                result.steps.append(UnifiedPipelineStep(
                    name="hecras_bind", authority="ENGINEERING", status=status,
                    detail={"error": str(e), "soft_fail": soft_fail_hecras},
                ))
        else:
            result.steps.append(UnifiedPipelineStep(
                name="hecras_bind", authority="ENGINEERING", status="SKIPPED",
                detail={"reason": "no hdf path"},
            ))

        handoff = {
            "archimedes_seal": (result.archimedes_uniforms or {}).get("seal"),
            "hecras_wse_sequence": result.hecras_wse_sequence,
            "sequence": result.sequence,
        }
        result.steps.append(UnifiedPipelineStep(
            name="ptdt_handoff", authority="PRESENTATION", status="OK",
            detail=handoff, seal=_seal(handoff),
        ))
        payload = result.as_dict()
        payload.pop("pipeline_seal", None)
        result.pipeline_seal = _seal(payload)
        return result
