# BCA Data Exporter Module

**Location:** `workspace/archimedes_console/02_mathematical_core/bca_data_exporter.py`

## Purpose
Produces structured, audit-ready data packages that can be fed directly into the **FEMA Benefit-Cost Analysis (BCA) Toolkit** for BRIC, HMGP, and FMA grant applications.

## Generated Outputs (in `05_final_portal_package/`)
| File | Description |
|------|-------------|
| `bca_elevation_data.json` | LAG, BFE, clearance, coordinates, datum, sources |
| `bca_storage_data.json` | Compensatory storage volumes (1.20× safety factor) |
| `bca_summary.csv` | Flat table for easy import into spreadsheets / BCA Toolkit |
| `bca_package_manifest.json` | Full package + SHA-256 integrity hash |

## Key Values (Point Township Node)
- **LAG** = 377.2 ft NAVD88 (5 cm LiDAR)
- **BFE** = 375.0 ft NAVD88
- **Clearance** = +2.2 ft (supports pure LOMA)
- **Compensatory storage** = 1.20× safety factor (IDNR 312 IAC 10 alignment)
- **USGS Gauge** = 03378500 (Wabash River at New Harmony)

## Usage
```bash
python workspace/archimedes_console/02_mathematical_core/bca_data_exporter.py
```

Or import:
```python
from bca_data_exporter import generate_bca_package
package = generate_bca_package(output_dir="05_final_portal_package")
```

## Integration Notes
- Use the elevation fields as inputs for structure/building records in the FEMA BCA Toolkit.
- Net storage balance supports Zero-Rise / no-adverse-impact claims.
- Manifest SHA-256 provides cryptographic chain-of-custody for grant reviewers and LOMA packages.
- Combine with the PE Transmittal Letter and Scientific Certification Sheet for a complete regulatory + grant submittal set.
