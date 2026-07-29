# HEC-RAS integration details

## Official software

- Download and install **USACE HEC-RAS** from the Hydrologic Engineering Center.
- Use the **2D** capability when overbank / confluence geometry requires it.
- Record **version** in every report.

## Required regulatory pair

1. **Existing-conditions** plan (pre-project geometry).  
2. **Proposed-conditions** plan (project geometry only; same flows/stages assumptions unless PE justifies otherwise).  
3. Difference: ΔWSE at critical sections ≤ **0.00 ft** for Indiana No-Rise practice (confirm with reviewer).

## What the repo integrates

| Artifact | Role |
|----------|------|
| `python/hec_ras_coupler.py` | Optional **HDF5 open** via h5py; **Manning reach screen**; QA relative-error vs observed stage |
| `backend/physics/hecras_coupler.py` | Same honest scope inside backend tree |
| `docs/HEC_RAS_MODELING_REQUIREMENTS.md` | PE checklist |

Status field from coupler: always **`SCREENING_ONLY`**.

## Recommended file handoff

```text
HEC-RAS project folder/
  *.prj, *.g##, *.p##, *.hdf
  → archive with SHA-256 in evidence manifest (python/evidence_manifest_builder.py)
  → PE PDF report (external)
```

## Do not

- Label coupler velocity as “HEC-RAS 2D result.”  
- Auto-fill No-Rise certificates from screening numbers.  
- Skip existing vs proposed comparison.
