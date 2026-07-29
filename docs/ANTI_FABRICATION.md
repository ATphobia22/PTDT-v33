# Anti-fabrication policy (hard rules)

## Forbidden claims in this repository

1. **Software cannot certify No-Rise or LOMA.** Only a licensed PE (and agency acceptance) can.
2. **No OAuth / automated submission to FEMA GO, IDNR, or KDOW.** Use official portals (Online LOMC, INFIP, eGrants).
3. **No status strings** such as `APPROVED_CERTIFIED_TRI_STATE_NO_RISE` written by code.
4. **No “Automated Administrative Dominance.”** Agencies review; applicants comply.
5. **No hard-coded SHA-256 of files that do not exist** on disk.
6. **No Daubert / FRE 702 “compliance” certificates** from SHA-256 alone.
7. **BCA numbers** are screening until produced by the **FEMA BCA Toolkit** with documented costs.
8. **Model calibration metrics** (NSE, R², RMSE) require actual HEC-RAS/SRH-2D run logs — do not invent.

## Allowed

- DRAFT worksheets with blank PE signature blocks
- Local SQLite screening ledgers
- Live USGS NWIS reads
- Manning / storage **screening** math labeled as such
- Better-data comparison packages for LOMA/FARA support
- Checklists mapping real statutes and portals
