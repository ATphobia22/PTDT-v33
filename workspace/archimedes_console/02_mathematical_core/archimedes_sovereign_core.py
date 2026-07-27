import sys
import os

# Ensure the root directory is in the path to import archimedes_engine
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
if root_path not in sys.path:
    sys.path.append(root_path)

from archimedes_engine import (
    ArchimedesEngine,
    HydraulicState,
    GovernanceState,
    app as root_app
)

# Thin re-export to maintain path compatibility
ArchimedesHydroEngine = ArchimedesEngine
app = root_app

if __name__ == "__main__":
    import uvicorn
    print("Launching PTDT v32 Sovereign Master Engine (via Canonical Re-export)...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
