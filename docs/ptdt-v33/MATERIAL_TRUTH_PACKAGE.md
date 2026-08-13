# Material Truth package structure (forensic evidence)

Anchor: **13101 Bonebank Road**, Point Township, Posey County, IN.

## Doctrine

Replace low-resolution “paper” averages with **5 cm LiDAR** + sealed elevations (NAVD88) for Pure **LOMA** (natural high ground: LAG ≥ BFE).

## Five-folder evidence layout

| Folder | Content | Format |
|---|---|---|
| `01_Topography` | Certified 5 cm LiDAR work map, 1-ft contours, XML metadata | PDF |
| `02_Simulation` | High-res stills / case study; **G1P SHA-256** burned in; no FEMA GO video | PDF / JPG |
| `03_Telemetry` | Raw peaks stage/discharge **03378500** (and ops **03322420** as separate) | CSV |
| `04_Legal` | Recorded deed + Posey tax map | PDF |
| `05_Certification` | FEMA **MT-EZ** / **MT-1** ready for PE cryptographic seal | PDF |

## Cryptographic / PE seal

- SHA-256 immutable audit ledger per artifact  
- HMAC execution signatures where specified  
- Indiana PE seal requirements (licensee-controlled; size per statute guidance in package docs)  
- Any byte change invalidates seal  

## LOMA path

| Check | Value |
|---|---|
| Path | **Pure LOMA** (no artificial fill for elevation) |
| LAG ≥ BFE | **377.2 ≥ 375.0** |
| Community Form 3 contact (per Legal Bonding) | Posey County Building Commissioner — verify current name/address before filing |

## Compensatory storage (fill projects)

$$
V_{\mathrm{cut}} \ge 1.20 \times V_{\mathrm{fill}}
$$

(Indiana 312 IAC 10-5 style net-zero floodway impact for regulated fill.)

## Presentation vs authority

| Layer | Role |
|---|---|
| Houdini / Moonray / UE5 / Box3D | Visual evidence seal only |
| HEC-RAS / TUFLOW | Sealed hydro |
| Archimedes | BFE / storage / governor gates |
| FEMA GO | ≤ 1 GB files; **no** mp4/avi — use PDF + JPG |

## Related

- `docs/ptdt-v33/PRECISION_LOCK_AND_INCONSISTENCIES.md`
- `data/property_flood_triggers.json`
