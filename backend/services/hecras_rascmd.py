"""Headless HEC-RAS via rascmd — soft-fail when binary or license absent."""
from __future__ import annotations

import os
import shutil
import subprocess
from dataclasses import dataclass
from typing import Optional


@dataclass(frozen=True)
class RasCmdResult:
    status: str  # OK | SKIPPED | FAILED
    message: str
    returncode: Optional[int] = None


def resolve_rascmd() -> Optional[str]:
    env = os.environ.get("RASCMD") or os.environ.get("HEC_RAS_CMD")
    if env and os.path.isfile(env) and os.access(env, os.X_OK):
        return env
    which = shutil.which("rascmd")
    return which


def run_rascmd_compute(project_path: str, *, silent: bool = True) -> RasCmdResult:
    """
    Invoke licensed HEC-RAS controller if present.
    Never fabricates DSS/HDF results when binary is missing.
    """
    cmd = resolve_rascmd()
    if not cmd:
        return RasCmdResult(
            status="SKIPPED",
            message="rascmd not on PATH and RASCMD/HEC_RAS_CMD unset — headless RAS skipped",
        )
    if not os.path.exists(project_path):
        return RasCmdResult(
            status="FAILED",
            message=f"HEC-RAS project not found: {project_path}",
        )
    args = [cmd, project_path, "-compute"]
    if silent:
        args.append("-silent")
    try:
        proc = subprocess.run(args, check=False, capture_output=True, text=True, timeout=3600)
    except subprocess.TimeoutExpired:
        return RasCmdResult(status="FAILED", message="rascmd timed out after 3600s", returncode=None)
    except OSError as exc:
        return RasCmdResult(status="FAILED", message=f"rascmd OS error: {exc}", returncode=None)
    if proc.returncode != 0:
        return RasCmdResult(
            status="FAILED",
            message=(proc.stderr or proc.stdout or "rascmd non-zero exit")[:2000],
            returncode=proc.returncode,
        )
    return RasCmdResult(status="OK", message="compute completed", returncode=0)
