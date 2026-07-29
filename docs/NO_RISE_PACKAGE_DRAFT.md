# IDNR No-Rise Certification Package — DRAFT STRUCTURE

**Property:** 13101 Bonebank Road, Point Township, Posey County, IN 47620  
**Parcel:** 65-09-35-200-001.000-009  
**Coords (WGS84):** 37.9035°N, 88.0007°W  
**FIRM:** 18129C0225D | Zone A | BFE 375.0 ft **NAVD 88**  
**Status:** DRAFT — NOT SIGNED — NOT FILED

> This outline follows the structure of a professional No-Rise report.  
> **All hydraulic results, volumes, and calibration metrics must be replaced**  
> with outputs from PE-supervised HEC-RAS 2D / SRH-2D (or equivalent) and survey.

---

## 1. Purpose & authority

- IC 14-28-1; **312 IAC 10** (floodway construction)
- FEMA **44 CFR 60.3(d)** (floodway encroachment / no-rise)
- Supporting path for CLOMR/LOMR if map revision sought (**44 CFR 65**)

**Finding language for PE (template only):**  
Proposed work shall not increase the regulatory BFE. Volumetric compensatory storage and 2D model comparison (existing vs with-project) support that conclusion subject to PE seal.

### Important note on “0.15 ft”

Some draft materials cite an Indiana “0.15 ft backwater cap.” **Do not treat that as a substitute for pure No-Rise.**  
Many PE No-Rise certifications target **0.000 ft** increase. Confirm current IDNR practice with Division of Water and the PE of record.  
If a model shows **+0.05 ft**, that is **not** zero-rise; the PE must justify acceptance or redesign.

---

## 2. Site conditions (to verify with survey)

| Parameter | Draft value | Source requirement |
|-----------|-------------|-------------------|
| Ground / LAG | 377.2 ft NAVD 88 | Survey + LiDAR |
| BFE | 375.0 ft NAVD 88 | Effective FIRM / FIS |
| Natural freeboard | +2.2 ft | LAG − BFE |
| Zone | A (SFHA) | NFHL / FIRM 18129C0225D |
| Drainage area jurisdiction | Confirm vs IDNR (>1 sq mi often relevant) | FARA / INFIP |

---

## 3. Hydraulics (model-of-record required)

**Recommended stack (open / standard):**

- USACE **HEC-RAS 2D** (optionally SRH-2D solver path per PE preference)
- Terrain: USGS **3DEP** + site survey breaklines
- Gages: **03322000** (Ohio / J.T. Myers context), **03378500** (Wabash at New Harmony)
- Roughness: document n zones (draft n=0.045 overbank is common starting point only)

**Screening Manning check (not model-of-record):**

\\[
V = \\frac{1.486}{n} R^{2/3} S^{1/2}
\\]

with n≈0.045, S≈0.00015 — use only for order-of-magnitude velocity / Froude screening.

**Calibration:**  
NSE / R² / RMSE tables in marketing drafts are **invalid** until tied to archived plan files and observed hydrographs. Leave blank or “TBD — PE run.”

---

## 4. Cut / fill volumetric template

Only volumes **below BFE** typically count for floodway storage accounting (confirm with PE/IDNR).

**Illustrative structure only (replace with takeoffs):**

| Component | Type | Volume (cy) |
|-----------|------|-------------|
| Berms + keyway + swales | FILL | *PE takeoff* |
| Basins + channels + remediation cut | CUT | *PE takeoff* |
| **V_net = V_fill − V_cut** | | **Must be ≤ 0 for storage argument** |

Project engineering factor often used in this repo: **V_cut ≥ 1.20 × V_fill** (screening).  
Official factor is whatever IDNR/PE require for the permit.

Generate a draft PDF worksheet:

```bash
python python/norise_certificate_draft.py
```

---

## 5. Geotech (separate PE discipline)

Slope stability (Bishop / Spencer), seepage, and piping FS must come from geotechnical PE using boring logs and lab data — not from software defaults.

---

## 6. PE certification block (required)

Leave blank for wet seal:

- Name, Indiana PE license #, signature, date  
- Statement that model and volumes were prepared or supervised by the PE  
- Limitation: certification applies only to described geometry

See also `docs/PE_TRANSMITTAL_TEMPLATE.md`.

---

## 7. Attachments checklist

- [ ] Survey plat / LAG points (NAVD 88)
- [ ] HEC-RAS project (geometry, plan, HDF) + SHA-256 of files
- [ ] Existing vs with-project WSE comparison table
- [ ] Cut/fill calculations below BFE
- [ ] INFIP **FARA** for coordinates
- [ ] USGS gage list used for BC / calibration
- [ ] Geotech report if berms claimed
- [ ] Draft No-Rise PDF → PE-signed final

---

## 8. What this repo will not do

- Auto-approve or auto-file with IDNR/FEMA  
- Claim “administrative dominance”  
- Embed fake SRH-2D calibration scores  
