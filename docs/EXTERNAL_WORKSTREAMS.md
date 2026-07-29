# External workstreams (cannot be completed by software alone)

Items 1–3 from the gap list require **licensed humans and official tools**. This doc is the project control list so nothing is forgotten.

---

## 1. PE-sealed survey (LOMA path)

| Step | Owner | Status |
|------|-------|--------|
| Hire Indiana-licensed surveyor / PE familiar with floodplain work | Property | ☐ |
| Establish **NAVD 88** control (not NGVD 29) | Surveyor | ☐ |
| Record **LAG**, **FFE**, structure corners, benchmark used | Surveyor | ☐ |
| Compare to effective **BFE** from FIS / FARA / INFIP | PE | ☐ |
| Complete FEMA elevation forms for Online LOMC | PE | ☐ |
| File via [Online LOMC](https://www.fema.gov/flood-maps/change-your-flood-zone/online-lomc) | Owner/PE | ☐ |

**Repo support only:** draft PE transmittal (`python/pe_transmittal_draft.py`), elevation hypothesis table, NAVD88 hard-check script.  
**Repo cannot:** seal plans or issue a LOMA.

---

## 2. HEC-RAS existing vs proposed (No-Rise / floodway)

| Step | Owner | Status |
|------|-------|--------|
| Install **USACE HEC-RAS** (current release) | PE | ☐ |
| Build **existing-conditions** geometry (terrain NAVD 88, structures) | PE | ☐ |
| Build **proposed-conditions** geometry (same hydrology, project only) | PE | ☐ |
| Run design event(s); extract WSE difference maps/profiles | PE | ☐ |
| Document n-values, mesh, BC, version | PE | ☐ |
| PE seal No-Rise letter / IDNR package | PE | ☐ |
| Submit through IDNR process | Owner/PE | ☐ |

**Repo support only:** `python/hec_ras_coupler.py` (SCREENING_ONLY Manning + optional HDF open), `docs/HEC_RAS_MODELING_REQUIREMENTS.md`, volumetric 1.20× screen.  
**Repo cannot:** produce a regulatory 2D RAS solution or auto-approve No-Rise.

### Integration detail (honest)

```text
USACE HEC-RAS GUI / batch  →  .hdf / plans  →  PE report
        ↑ optional inspect
python/hec_ras_coupler.py (h5py open + Manning screen)
```

Do not wire coupler outputs into a certificate as “RAS results.”

---

## 3. Official FEMA BCA Toolkit run (HMA)

| Step | Owner | Status |
|------|-------|--------|
| Confirm eligible **subapplicant** (local government / state path via IDHS) | Sponsor | ☐ |
| Download current **BCA Toolkit** from FEMA | Analyst | ☐ |
| Enter structure / hazard / mitigation data per Toolkit guidance | Analyst | ☐ |
| Export BCR ≥ 1.0 package for HMA application | Analyst | ☐ |
| Attach Toolkit outputs to FEMA GO / state subapplication | Sponsor | ☐ |

**Repo support only:** `python/bca_screening_export.py`, `docs/FEMA_BCA_TOOLKIT.md` (SCREENING_ONLY).  
**Repo cannot:** replace the official Toolkit or invent a filing BCR.

---

## 4–7. Software / ops (addressed in-repo)

| Gap | Action |
|-----|--------|
| 4 Typecheck not hard in CI | Still **soft** (large TS surface); see `docs/FRONTEND_BUILD.md`. Local: `npm run typecheck`. |
| 5 pytest / readiness not in CI | **Added** hard steps in `build.yml` (math gates + readiness export). |
| 6 Full `backend/` optional | Documented in `docs/BACKEND_OPTIONAL.md` |
| 7 Databricks / Istio experimental | Documented in `docs/OPS_EXPERIMENTAL.md` |
