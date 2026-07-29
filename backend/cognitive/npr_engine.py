# backend/cognitive/npr_engine.py
"""Riprap / shear screening helpers — classical only (no Qiskit / IBM Quantum).

Quantum circuit experiment removed; use PE design manuals for D50.
"""
from __future__ import annotations

from typing import List, Optional


def screen_mean_velocity_fps(boundary_velocities: Optional[List[float]] = None) -> float:
    """Return mean boundary velocity (ft/s) for documentation screens only."""
    if not boundary_velocities:
        return 0.0
    return float(sum(boundary_velocities) / len(boundary_velocities))


class NativeParallelReasoner:
    """Name retained for import compatibility; methods are classical screens."""

    def __init__(self, api_key: str = "") -> None:
        self.api_key = api_key  # unused; no external quantum service

    def optimize_hydraulic_riprap_circuit(self, boundary_velocities: list) -> float:
        """Deprecated name — returns mean velocity only (not D50).

        Real riprap sizing requires PE use of USACE/EM guidance, not this function.
        """
        return screen_mean_velocity_fps(list(boundary_velocities or []))
