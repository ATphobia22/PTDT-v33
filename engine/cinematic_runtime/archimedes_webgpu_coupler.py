"""Archimedes ≥ WebGPU Compute Coupler — derived shading uniforms only."""
from __future__ import annotations

import json
import struct
from dataclasses import dataclass
from hashlib import sha256
from typing import Any

DEFAULT_BFE_FT = 375.0
DEFAULT_LAG_FT = 377.2
DEFAULT_FFE_FT = 382.5
DEFAULT_N_FLOODPLAIN = 0.045
DEFAULT_SLOPE = 0.00015
DEFAULT_STORAGE_FACTOR = 1.20


@dataclass(frozen=True)
class ArchimedesGpuUniforms:
    manning_n: float = DEFAULT_N_FLOODPLAIN
    river_slope: float = DEFAULT_SLOPE
    storage_factor: float = DEFAULT_STORAGE_FACTOR
    bfe_ft: float = DEFAULT_BFE_FT
    lag_ft: float = DEFAULT_LAG_FT
    ffe_ft: float = DEFAULT_FFE_FT
    clearance_ft: float = DEFAULT_LAG_FT - DEFAULT_BFE_FT
    pad0: float = 0.0
    pad1: float = 0.0
    pad2: float = 0.0
    pad3: float = 0.0
    pad4: float = 0.0
    pad5: float = 0.0
    pad6: float = 0.0
    pad7: float = 0.0
    pad8: float = 0.0

    def validate(self) -> None:
        if not (0.01 <= self.manning_n <= 0.2):
            raise ValueError(f"manning_n out of range: {self.manning_n}")
        if self.river_slope < 0:
            raise ValueError("river_slope must be non-negative")
        if self.storage_factor < 1.0:
            raise ValueError("storage_factor must be >= 1.0")
        if self.lag_ft < self.bfe_ft:
            raise ValueError("LAG must be >= BFE")

    def as_f32_list(self) -> list[float]:
        self.validate()
        return [
            self.manning_n,
            self.river_slope,
            self.storage_factor,
            self.bfe_ft,
            self.lag_ft,
            self.ffe_ft,
            self.clearance_ft,
            self.pad0,
            self.pad1,
            self.pad2,
            self.pad3,
            self.pad4,
            self.pad5,
            self.pad6,
            self.pad7,
            self.pad8,
        ]

    def to_bytes(self) -> bytes:
        return struct.pack("<16f", *self.as_f32_list())

    def seal(self) -> str:
        payload = {
            "manning_n": self.manning_n,
            "river_slope": self.river_slope,
            "storage_factor": self.storage_factor,
            "bfe_ft": self.bfe_ft,
            "lag_ft": self.lag_ft,
            "ffe_ft": self.ffe_ft,
            "clearance_ft": self.clearance_ft,
            "authority": "DERIVED_FROM_ARCHIMEDES_PRESENTATION",
        }
        raw = json.dumps(payload, sort_keys=True, separators=(",", ":"))
        return sha256(raw.encode("utf-8")).hexdigest()


class ArchimedesWebGPUCoupler:
    def from_defaults(self) -> ArchimedesGpuUniforms:
        return ArchimedesGpuUniforms()

    def from_archimedes_dict(self, data: dict[str, Any]) -> ArchimedesGpuUniforms:
        n = float(data.get("manning_n_floodplain", data.get("manning_n", DEFAULT_N_FLOODPLAIN)))
        slope = float(data.get("river_slope", DEFAULT_SLOPE))
        sf = float(data.get("storage_factor", data.get("safety_factor_applied", DEFAULT_STORAGE_FACTOR)))
        bfe = float(data.get("bfe_ft", DEFAULT_BFE_FT))
        lag = float(data.get("lag_ft", DEFAULT_LAG_FT))
        ffe = float(data.get("ffe_ft", DEFAULT_FFE_FT))
        return ArchimedesGpuUniforms(
            manning_n=n,
            river_slope=slope,
            storage_factor=sf,
            bfe_ft=bfe,
            lag_ft=lag,
            ffe_ft=ffe,
            clearance_ft=lag - bfe,
        )

    def pack_for_webgpu(self, uniforms: ArchimedesGpuUniforms) -> dict[str, Any]:
        uniforms.validate()
        return {
            "byteLength": 64,
            "float32": uniforms.as_f32_list(),
            "seal": uniforms.seal(),
            "authority": "PRESENTATION",
            "note": "Derived Archimedes scalars for shading; not LOMA evidence.",
        }
