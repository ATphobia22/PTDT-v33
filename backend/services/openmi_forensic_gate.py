"""OpenMI-style flux exchange forensic gate.

OpenMI 2.0 is pull-based IBaseLinkableComponent exchange of in-memory value sets.
Not OS mmap. Gate is PTDT engineering fail-closed — not an unverified IDNR statute.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass, field

logger = logging.getLogger("PTDT.OpenMIGate")


@dataclass
class OpenMIForensicGate:
    tolerance_percent: float = 0.1
    system_locked: bool = False
    lock_reason: str = ""
    lock_events: list[dict] = field(default_factory=list)

    def __post_init__(self) -> None:
        self.tolerance = self.tolerance_percent / 100.0

    def validate_flux_exchange(self, surface_flux: float, groundwater_flux: float) -> bool:
        if self.system_locked:
            return False
        net = abs(surface_flux - groundwater_flux)
        total = max(abs(surface_flux), abs(groundwater_flux), 1e-9)
        err = net / total
        if err > self.tolerance:
            self.system_locked = True
            self.lock_reason = (
                f"mass_balance_divergence err={err*100:.4f}% "
                f"> tol={self.tolerance_percent}%"
            )
            self.lock_events.append(
                {
                    "surface_flux": surface_flux,
                    "groundwater_flux": groundwater_flux,
                    "error_fraction": err,
                    "reason": self.lock_reason,
                }
            )
            logger.critical("OPENMI GATE LOCK: %s", self.lock_reason)
            return False
        return True
