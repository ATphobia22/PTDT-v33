# NAVD 88 datum consistency

## Why it matters

Mixing **NGVD 29** and **NAVD 88** can introduce multi-foot vertical errors and cause LOMA / permit rejection. This project **requires NAVD 88** on all elevation fields used for regulatory packages.

## Hard checks in code

`archimedes_engine.assert_navd88_datum()` rejects empty labels, NGVD 29, and unrecognized datum strings before package generation.

## Transform path

- API: `GET /api/transform-elevation?lat=&lon=&height=&inDatum=ngvd29&outDatum=navd88`
- Upstream: [NGS NCAT](https://geodesy.noaa.gov/NCAT/) / VERTCON-class services
- Fallback note in proxy uses an approximate Posey County shift only when NCAT is unreachable — **do not** file that fallback as survey truth

## Package fields

BCA JSON and PE letter templates emit `vertical_datum: "NAVD 88"` and LAG/BFE/FFE in feet on that datum.
