# Next actions

## Done in-repo

- [x] Zero-key MapLibre demos (fixed CDNs)  
- [x] GLSL flow layer (viz only)  
- [x] USGS IV on sovereign demo  
- [x] **Photoreal path demo** — OSM 3D buildings + Three.js house + terrain  
- [x] Quantum stubs neutralized  
- [x] HEC-RAS Manning + sensitivity docs  
- [x] Readiness JSON + SHA-256  
- [x] CI: pytest + readiness + Archimedes package hard  

## External (cannot finish in git alone)

| Item | Owner |
|------|--------|
| PE-sealed survey (LAG/FFE NAVD 88) | Licensed surveyor / PE |
| HEC-RAS existing vs proposed + sensitivity | PE |
| Official FEMA BCA Toolkit run | PE / BCA analyst |
| Site drone mesh / ODM for true photoreal | Owner + pilot |
| IDNR / FEMA filings | Applicant + PE |

## Optional polish

1. Drop a real **GLB** farmhouse into `demos/assets/` and load via GLTFLoader.  
2. tippecanoe **PMTiles** for BAFL + footprints.  
3. PDAL + rio-rgbify local Terrarium from county LiDAR.  
4. Express proxy if Overpass/USGS CORS fails in some browsers.  
5. Reduce React TS errors until typecheck can be hard.  
