# Science stack gap analysis (tri-state)

## Already strong

- NAVD 88 enforcement in package generation  
- Manning screening + 1.20× storage calculator  
- Better-data comparison package for FEMA/IDNR  
- USGS multi-gage context (03378500, 03322000)  
- NFHL / BAFL map proxies  
- NCAT datum transform path  

## Added this pass

- `python/volumetric_calc.py` — depth-grid volume + cut/fill ratio  
- `python/telemetry_john_t_myers.py` — live NWIS for JT Myers  
- `python/hec_ras_coupler.py` — optional HDF5 open + explicit screening disclaimer  
- `protobuf/openmi_solver.proto` — coupling contract for future solvers  
- `docs/TRI_STATE_REGULATORY_SCIENCE.md` — IN/IL/KY matrix  

## Still required for peer-level hydraulic science

| Gap | Why it matters | Open-source path |
|-----|----------------|------------------|
| Real HEC-RAS 2D project for the reach | Only PE RAS runs carry No-Rise weight | USACE HEC-RAS (free) + commit `.hdf` hashes |
| Surveyed LAG points / contours | LOMA lives or dies on survey | Licensed surveyor deliverable |
| IL Part 3700/3708 storage tables | Compensatory volume by flood band | PE workbook export → CSV in package |
| KY 401 KAR 4:060 exhibit set | State stream permit | KDOW application drawings |
| Calibration metrics vs 03378500 | Error band documentation | Script comparing sim stage to NWIS IV |
| MODFLOW / SWMM if groundwater/storm claims | Multi-physics Daubert narrative | FloPy, PySWMM (optional, heavy) |
| Cesium ion token / free terrain | 3D photorealism | Prefer MapLibre + free DEM; avoid paid Cesium ion if no account |

## Recommended next PE workflow

1. Survey seals LAG/FFE on NAVD 88  
2. Build HEC-RAS 2D model of local reach; archive plan/geometry/HDF hashes  
3. Run `better_data_package.py` + Archimedes PDFs  
4. Attach FARA from INFIP  
5. File LOMA via Online LOMC; IDNR as required  
