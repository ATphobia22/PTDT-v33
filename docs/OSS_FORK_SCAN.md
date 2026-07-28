# ATphobia22 fork scan — vite & three.js

## https://github.com/ATphobia22/vite

| Item | Detail |
|------|--------|
| **What** | Full upstream **vitejs/vite** monorepo (`@vitejs/vite-monorepo`) |
| **Package manager** | **pnpm only** (`preinstall: only-allow pnpm`) |
| **Useful for PTDT?** | **No** as a dependency — do not `npm install` from this git URL |
| **Use instead** | Published **`vite@^6.2`** from npm (already in `package.json`) |

Do **not** point `package.json` at the fork; CI and Docker expect the npm release.

## https://github.com/ATphobia22/three.js

| Item | Detail |
|------|--------|
| **What** | Upstream **mrdoob/three.js** at **0.185.0** |
| **Exports** | `"."`, `"./webgpu"` → `build/three.webgpu.js`, `"./tsl"` → `build/three.tsl.js`, `"./addons/*"` |
| **Useful for PTDT?** | Confirms **npm `three@0.185`** correctly exposes WebGPU/TSL subpaths |
| **Use instead** | Published **`three@^0.185.1`** from npm (already pinned) |

### Build rule for Tri-State

- **Do not** statically import `three/webgpu` or `three/tsl` unless the path is actively used and tested under Vite.
- Current twin 3D path: **`@react-three/fiber` + `three` WebGL** (`WebGPU3DValley.tsx`).
- Dead `DigitalTwinView` WebGPU/TSL imports were removed in commit `9eb9a5c`.

## Recommendation

| Fork | Action |
|------|--------|
| vite | Ignore for product builds |
| three.js | Reference only; keep npm pin |
| TypeScript / typescript-sdk (prior scan) | Same — upstream forks, no product code |
