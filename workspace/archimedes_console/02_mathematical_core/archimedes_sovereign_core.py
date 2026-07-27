"""
PTDT v32 Sovereign Core — thin wrapper that re-exports the unified root engine.
Canonical implementation lives at repo root: archimedes_engine.py
"""
import sys
from pathlib import Path

# Ensure repo root is on path so archimedes_engine is importable
_ROOT = Path(__file__).resolve().parents[3]
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from archimedes_engine import (  # noqa: E402
    ArchimedesEngine,
    HydraulicState,
    GovernanceState,
    generate_unified_regulatory_package,
    get_reportlab_styles,
    app,
)

# Back-compat alias used by older docs
ArchimedesHydroEngine = ArchimedesEngine

__all__ = [
    "ArchimedesEngine",
    "ArchimedesHydroEngine",
    "HydraulicState",
    "GovernanceState",
    "generate_unified_regulatory_package",
    "get_reportlab_styles",
    "app",
]

if __name__ == "__main__":
    import json
    import uvicorn

    print("=== PTDT v32 Sovereign Core (delegates to archimedes_engine.py) ===")
    out = "05_final_portal_package"
    res = generate_unified_regulatory_package(out)
    print(json.dumps(res, indent=2))
    print("Launching FastAPI on port 8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
