# Tri-State Digital Twin (PTDT) & Tucker Cognitive OS

Sovereign Engineering & Flood Defense Platform for the Tri-State River Basin Anchor
Node: 13101 Bonebank Road, Point Township, Posey County, Indiana (EPSG:3857 / NAVD88)

## 1. System Overview & Executive Summary
The Tri-State Digital Twin (PTDT v32) and Tucker Cognitive OS replace static, low-resolution
regional flood maps with a real-time, mathematically rigorous, and legally defensible single
source of truth. Anchored at the confluence of the Wabash and Ohio rivers, this monorepo
infrastructure integrates high-performance multi-physics modeling (HEC-RAS, MODFLOW,
SWMM) with quantum-safe cryptographic ledgers and automated AI-driven agentic governance.
Its core objective is to provide Evidence-Grade Technical Data—backed by 5cm LiDAR work
maps and deterministic fluid mechanics—to successfully execute Letters of Map Amendment
(LOMA) with FEMA, secure "Zero-Rise" floodway permits under Indiana DNR (312 IAC 10), and
protect ancestral family holdings from bureaucratic land devaluation.

## 2. Repository Directory Structure
```
archimedes_console/
├── 01_visual_twin/ # WebGPU / CesiumJS 3D spatial renderers
│ └── tri_river_simulator.html # Interactive 3D flood stage simulator
├── 02_mathematical_core/ # Certified hydrodynamic engines & PDF generators
│ └── archimedes_sovereign_core.py # Master Python physics & FastAPI core
├── 03_fema_portal_wizard/ # Automated FEMA MT-1 data mapping sheets
├── 04_reality_mesh/ # Photogrammetry pipeline configs & USD assets
├── 05_final_portal_package/ # Sealed P.E. transmittal letters & BCA narratives
├── infra/ # Docker-compose stacks (Redis LangCache & ChromaDB)
├── v32_OpenMI_ICD.proto # OpenMI 2.0 gRPC solver integration contract
├── v32_Evidence_Manifest.json # Daubert-compliant JSON evidence schema
└── README.md # Sovereign System Documentation
```

## 3. Mathematical Core & Hydrodynamic Proofs
To satisfy federal and state judicial scrutiny under the Daubert Standard, all hydraulic
computations are executed via deterministic governing equations:

### A. Open-Channel Velocity (Manning's Equation)
Localized flood velocities are computed across the floodplain channel to prove sub-critical flow
dynamics and eliminate scour risks:
V = \frac{1.486}{n} R_h^{2/3} S^{1/2}
Where n = 0.045 (heavy brush/agricultural floodplain roughness), R_h is the hydraulic radius
approximated by flow depth, and S = 0.00015 (energy slope).

### B. Net-Zero Volumetric Displacement (IDNR 312 IAC 10-5)
To comply with strict Indiana floodway regulations, structural earthen fill (V_{fill}) is
mathematically offset by active auxiliary excavation (V_{cut}) enforcing a 1.20x safety factor:
V_{cut} >= 1.20 * V_{fill} => V_{net} = V_{fill} - V_{cut} <= 0

## 4. Quick Start & Deployment Guide

### Prerequisites
* Python 3.11+ with reportlab, fastapi, uvicorn, and requests installed.
* Node.js 18+ (for React dashboard components).
* Docker & Docker Compose (for Sovereign Edge caching infrastructure).

### Step 1: Initialize Infrastructure
Spin up the local Redis caching and ChromaDB memory vector layers:
`docker-compose -f infra/docker-compose.yml up -d`

### Step 2: Run the Sovereign Mathematical Core
Execute the master physics backend and statutory governor:
`python archimedes_sovereign_core.py`

### Step 3: Launch the 3D Spatial Simulator
Open `01_visual_twin/tri_river_simulator.html` directly in any modern browser to interact with the
Google Photorealistic 3D Tiles proxy and the live flood stage slider.

## 5. Regulatory Compliance & Submission Roadmap
1. FEMA MT-1 LOMA Wizard: Access the FEMA Mapping Application portal, select the LOMA pathway (avoiding LOMR-F fill classifications), and input the certified Lowest Adjacent Grade (LAG) of 377.2 ft MSL against the Base Flood Elevation (BFE) of 375.0 ft MSL.
2. IDNR Division of Water: File an electronic Construction in a Floodway (CIF) permit referencing 312 IAC 10-5 compensatory storage calculations.
3. P.E. Transmittal Seal: Attach the generated 01_PE_Transmittal_Letter.pdf bearing an Indiana Registered Professional Engineer seal under IC 25-31-1. Cryptographically Sealed & Verified by Tucker Cognitive OS (v32).
