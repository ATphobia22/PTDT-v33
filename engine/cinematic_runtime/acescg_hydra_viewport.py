"""ACEScg Hydra Viewport — presentation color pipeline."""
from __future__ import annotations

import json
from dataclasses import dataclass, field
from hashlib import sha256
from typing import Any, Literal

ColorSpace = Literal["ACEScg", "ACES2065-1", "sRGB", "linear-sRGB"]
DisplayOdt = Literal["ACES-sRGB", "ACES-Rec709", "ACES-P3-D65", "Un-tone-mapped"]


@dataclass
class ACEScgHydraViewportConfig:
    working_space: ColorSpace = "ACEScg"
    display_odt: DisplayOdt = "ACES-sRGB"
    exposure: float = 0.0
    gamma_preview: float = 1.0
    hydra_delegate: str = "HdStorm"
    enable_dome_light: bool = True
    dome_intensity: float = 1.0
    clear_color_acescg: tuple[float, float, float, float] = (0.02, 0.02, 0.025, 1.0)
    datum_label: str = "NAVD88"
    crs_label: str = "EPSG:2966"
    notes: list[str] = field(
        default_factory=lambda: [
            "ACEScg is scene-referred linear AP1.",
            "Do not encode engineering elevations as display-referred sRGB.",
            "Hydra renders presentation; LOMA/BFE remain Material Truth.",
        ]
    )

    def validate(self) -> None:
        if not (-8.0 <= self.exposure <= 8.0):
            raise ValueError("exposure must be in [-8, 8]")
        if self.gamma_preview <= 0:
            raise ValueError("gamma_preview must be positive")
        if self.dome_intensity < 0:
            raise ValueError("dome_intensity must be non-negative")

    def to_hydra_settings(self) -> dict[str, Any]:
        self.validate()
        return {
            "colorManagement": {
                "workingSpace": self.working_space,
                "displayODT": self.display_odt,
                "exposure": self.exposure,
            },
            "delegate": self.hydra_delegate,
            "lighting": {
                "domeLight": self.enable_dome_light,
                "domeIntensity": self.dome_intensity,
            },
            "clearColorACEScg": list(self.clear_color_acescg),
            "hud": {"datum": self.datum_label, "crs": self.crs_label},
            "authority": "PRESENTATION",
        }


def seal_viewport_config(cfg: ACEScgHydraViewportConfig) -> str:
    body = json.dumps(cfg.to_hydra_settings(), sort_keys=True, separators=(",", ":"))
    return sha256(body.encode("utf-8")).hexdigest()
