# OSM building materials & textures → Unity / deck.gl

**Goal:** Plausible **PBR massing**, not invented photoreal faces. Rural Posey tags are sparse — defaults apply.

## Facade & roof tags

| Key | Purpose | Common values |
|---|---|---|
| `building:material` | Outer wall surface | `brick`, `wood`, `plaster`, `concrete`, `metal`, `glass`, `cement_block` |
| `roof:material` | Outer roof surface | `roof_tiles`, `metal`, `asphalt`, `concrete`, `slate` |
| `building:colour` / `roof:colour` | CSS-like colour | `#c4a574`, `white`, `grey` |
| `roof:shape` | LOD roof | `gabled`, `hipped`, `flat`, `skillion` |

Wiki: Simple 3D Buildings · `building:material` · `roof:material`.

## Default rural mapping (Point Township)

| Condition | Unity / PBR action |
|---|---|
| No material tags | Neutral painted wood / vinyl albedo; metal roof option |
| `building:material=wood` | Weathered wood albedo + roughness |
| `building:material=brick` | Brick albedo; avoid synthetic red if ortho contradicts |
| `roof:material=metal` | Galvanized / painted metal roughness |
| Ortho available | Sample roof colour from COG; clamp saturation |

**Never** invent high-frequency facade windows from OSM alone. Window rows only if `building:levels` present and studio QG allows procedural trim.

## Pipeline order

1. Footprint (Overture / MS / OSM)  
2. Height (`height` → levels×3 m → 4.5 m default)  
3. Material tags → material ID  
4. DEM base elevation (NAVD88 relative)  
5. Optional ortho roof tint  
6. Studio QG export (env naming, LOD0–3) if asset enters cinematic path  

Presentation meshes **do not** write sealed hydro.

## Related

- `docs/ptdt-v33/OSM_OVERTURE_UNITY_BUILDINGS.md`
- `docs/ptdt-v33` 3D Environment Art QG (studio checklist)
