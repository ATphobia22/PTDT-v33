# BCR source conflict — resolution

| Label | Value | Provenance |
|---|---|---|
| Engineering / package constant | **1.41** | Internal BCA export / engineering workbook path |
| Legal Bonding PDF (PTDT v32) | **2.45** | Narrative legal brief figure |
| **Authoritative sealed BCR** | **Only FEMA BCA Toolkit run** signed by PE | BRIC / HMGP / LOMA support |

## Rules

1. Do **not** average 1.41 and 2.45.  
2. API field: `bcr_status = "UNVERIFIED_DUAL"` until Toolkit artifact is ingested.  
3. Package generator must refuse to print a single BCR on Form/BCA pages without `bcr_toolkit_sha256`.  
4. Once PE Toolkit JSON/PDF is sealed, set `bcr_sealed` and clear dual status.

## Related

- `docs/ptdt-v33/PRECISION_LOCK_AND_INCONSISTENCIES.md`
- `docs/ptdt-v33/GRANT_STACK_AND_BRIC.md`
