"""MODFLOW6 runner — fail-closed STALE on any execution failure."""
from __future__ import annotations

import shutil
from dataclasses import dataclass
from typing import Any, Optional


@dataclass(frozen=True)
class ModflowResult:
    status: str  # OK | STALE | FAILED
    heads: Optional[list[float]]
    message: str
    provenance: dict[str, Any]


def run_modflow6(
    workspace: str,
    *,
    last_good_heads: Optional[list[float]] = None,
) -> ModflowResult:
    """Execute mf6 if present; never invent heads."""
    if not shutil.which("mf6"):
        return ModflowResult(
            status="STALE",
            heads=list(last_good_heads) if last_good_heads else None,
            message="mf6 executable not on PATH — preserving prior heads",
            provenance={"engine": "MODFLOW6", "fail_closed": True},
        )
    try:
        # Placeholder: integrate FloPy / subprocess to workspace nam file.
        # On success, parse heads and return OK.
        raise RuntimeError("MODFLOW workspace integration pending")
    except Exception as exc:  # noqa: BLE001 — fail closed
        return ModflowResult(
            status="STALE",
            heads=list(last_good_heads) if last_good_heads else None,
            message=f"MODFLOW execution failed: {exc}",
            provenance={"engine": "MODFLOW6", "fail_closed": True},
        )
