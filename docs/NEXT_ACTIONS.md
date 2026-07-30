# Next actions (after demo push)

## Done in-repo

- [x] Zero-key MapLibre demos with fixed CDNs  
- [x] GLSL custom layer demo (viz only)  
- [x] USGS IV button on sovereign demo  
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
| IDNR / FEMA filings | Applicant + PE |

## Optional engineering polish

1. Build site **PMTiles** from BAFL/footprint GeoJSON (tippecanoe).  
2. Self-host Terrarium from county/drone DEM (PDAL + rio-rgbify).  
3. Proxy USGS from Express if browser CORS blocks NWIS.  
4. Reduce React TS errors until typecheck can be hard.  
5. Optional PostGIS for asset inventory — not required for Archimedes drafts.  
