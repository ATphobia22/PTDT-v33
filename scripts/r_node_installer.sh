#!/usr/bin/env bash
# PTDT R-Node Installer — sovereign runtime node bootstrap
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
mkdir -p "$ROOT/artifacts"
echo "=== PTDT R-Node Installer ==="
echo "root=$ROOT"
python3 -c 'import sys; assert sys.version_info >= (3,11), sys.version'
if [[ ! -d .venv ]]; then python3 -m venv .venv; fi
source .venv/bin/activate
python -m pip install --upgrade pip
[[ -f requirements.txt ]] && pip install -r requirements.txt
pip install pydantic pytest redis h5py 2>/dev/null || true
mkdir -p data/flood_xs data/geo data/cog data/geol artifacts docs/ptdt-v33 engine/cinematic_runtime backend/services tests scripts
python -c "from engine.cinematic_runtime.archimedes_webgpu_coupler import ArchimedesWebGPUCoupler; from engine.cinematic_runtime.usd_scene_state_generator import UsdSceneStateGenerator; c=ArchimedesWebGPUCoupler().from_defaults(); assert len(c.to_bytes())==64; g=UsdSceneStateGenerator().build_default_bonebank(); print('smoke_ok', len(g.prims), 'prims')"
echo "=== R-Node install complete ==="
