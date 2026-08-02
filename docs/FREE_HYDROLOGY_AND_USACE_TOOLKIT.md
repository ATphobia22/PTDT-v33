# Free hydrology / geotech tools & USACE alignment (honest scope)

Scanned source note on free tools vs proprietary software. This doc records **what is useful** and **what the software must not claim**.

## Free / open tools (catalog)

| Domain | Tool | Role |
|--------|------|------|
| River / flood hydraulics | **HEC-RAS** (USACE, free) | Regulatory workhorse; PE still owns sealed runs |
| 2D shallow-water | **ANUGA** | Research/open 2D; not a drop-in sealed substitute for HEC-RAS without PE validation |
| Coastal / river | **TELEMAC-MASCARET** | Open suite; same PE/validation gate |
| Urban / stormwater | **EPA SWMM** | Catchment & pipe networks |
| Geotech continuum | **ADONIS** (and similar FOSS) | Slope/soil mechanics exploration — not a PLAXIS certificate |
| Groundwater | **MODFLOW 6** | Regional GW; couple only with documented interfaces |
| Coupling standard | **OpenMI 2.0** (OGC 11-014r3) | Architecture for model link contracts — not automatic legal compliance |

**Compliance is not conferred by using free software.** USACE/FEMA/IDNR acceptance still requires appropriate methods, documentation, and (where required) **PE seals** and agency process.

## What PTDT implements vs does not invent

| Claim in source text | Repo treatment |
|----------------------|----------------|
| Numerical Validation Engine vs HEC-RAS RMSE | **Not implemented as certified truth** — PE attaches sealed models |
| Custom HLL solver benchmarked to USACE | **Out of scope** unless PE delivers archive |
| FoS 1.40 static / 1.10 seismic | **Reference constants only** (`src/lib/usaceReferenceThresholds.ts`) |
| OpenMI 2.0 coupling | **Documented architecture** — no fake multi-model runtime |
| USACE NLD API | **Live public FeatureServer proxy** `/api/nld/levees` |
| Section 204 / BRIC “proof packs” | Grant narratives remain **human/PE**; software supplies data appendices |

## USACE National Levee Database (live)

Public services (no key):

- FeatureServer: https://geospatial.sec.usace.army.mil/dls/rest/services/NLD/Public/FeatureServer
- MapServer: https://geospatial.sec.usace.army.mil/dls/rest/services/NLD/Public/MapServer
- Portal: https://levees.sec.usace.army.mil/

Twin proxy: `GET /api/nld/levees?bbox=minLon,minLat,maxLon,maxLat` (defaults to Bonebank bbox).

NLD presence near the site **does not** mean a federal levee protects the parcel or that Archimedes berms are NLD systems.

## Suggested PE / grant workflow (software-supported only)

1. Hydraulics: HEC-RAS (or PE-approved alternative) sealed package  
2. Optional research parallel: ANUGA/TELEMAC with documented cross-check  
3. Stormwater laterals: SWMM if urban drainage in scope  
4. Slope / levee embankment: PE geotech (ADONIS may inform, not seal)  
5. Pull NLD context layers for regional awareness  
6. IDNR CIF + FEMA No-Rise/CLOMR + local permit as before  

## Sources

- User research note (free tools + PTDT governance narrative)  
- USACE NLD data services pages  
- Prior PTDT certification docs in `certification/`  
