# Scan of pasted free-tools / USACE note

## Kept (useful)

- Catalog of free tools: HEC-RAS, ANUGA, TELEMAC, SWMM, ADONIS, MODFLOW, OpenMI
- Reminder that free ≠ automatically USACE-accepted
- FoS **1.40 / 1.10** as **reference** discussion values
- NLD / USACE geospatial as live context data
- Grant packaging needs real math + PE — software assists, does not replace

## Rejected / not claimed in code

- Existing certified “Numerical Validation Engine” with HLL vs HEC-RAS RMSE as production truth
- Automatic OpenMI multi-solver legal defensibility
- Zero-tax-burden automatic Section 204/BRIC proof generation
- ADONIS as PLAXIS substitute for sealed levee design

## Implemented

- `docs/FREE_HYDROLOGY_AND_USACE_TOOLKIT.md`
- `src/lib/usaceReferenceThresholds.ts`
- `src/server-nld.ts` → `/api/nld/service`, `/api/nld/levees`
- Register NLD in server assembly path (see `server-main` / assemble notes)
