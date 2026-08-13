#!/bin/bash
# Stage and push Box3D cinematic runtime integration.
set -euo pipefail

BRANCH="${1:-feature/cinematic-runtime-core-fixes}"

echo "Deploying Box3D Integration to ${BRANCH}..."

git fetch origin
git checkout -B "${BRANCH}"
git pull origin "${BRANCH}" 2>/dev/null || echo "Branch local or new."

echo "Staging Unity package..."
git add integrations/box3d-unity/package.json
git add integrations/box3d-unity/Runtime/

echo "Staging Python cinematic runtime..."
git add engine/cinematic_runtime/box3d_contract.py
git add engine/cinematic_runtime/state_diff.py
git add engine/cinematic_runtime/physics_stream_broadcaster.py
git add engine/cinematic_runtime/__init__.py
git add engine/cinematic_runtime/turbovec_diff_wgsl.md
git add tests/test_box3d_contract.py
git add docs/ptdt-v33/PHYSICS_STATE_DIFF.md
git add docs/ptdt-v33/BOX3D_PHYSICS_SEAL.md

echo "Staging CI..."
git add .github/workflows/cinematic-runtime-ci.yml
git add scripts/deploy_box3d_integration.sh

git commit -m "feat(physics): Box3D Unity runtime, state diff, Redis/WS bridge" \
           -m "Sealed envelopes remain authoritative; Box3D is derived VFX/collision only." \
           -m "Adds diff_states, pytest coverage, cinematic-runtime CI." || echo "Nothing to commit."

git push -u origin "${BRANCH}"
echo "Success — pushed ${BRANCH}"
