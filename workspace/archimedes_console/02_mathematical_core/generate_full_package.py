#!/usr/bin/env python3
"""
Unified Live Package Generator
PTDT v32 / Tucker Cognitive OS – Sovereign Node

Wires together:
  - Archimedes Hydro Engine (elevations + compensatory storage)
  - BCA Data Exporter (FEMA Toolkit inputs)
  - PE Transmittal Letter + BRIC BCA Narrative

Single entry point produces the complete LOMA + grant-ready package.
"""

import os
import sys
import json
import datetime
import hashlib
from pathlib import Path

# ---------------------------------------------------------------------------
# Path setup so imports work whether run from repo root or this directory
# ---------------------------------------------------------------------------
THIS_DIR = Path(__file__).resolve().parent
CONSOLE_ROOT = THIS_DIR.parent
PACKAGE_DIR = CONSOLE_ROOT / "05_final_portal_package"
PACKAGE_DIR.mkdir(parents=True, exist_ok=True)

# Allow importing sibling modules
sys.path.insert(0, str(THIS_DIR))
sys.path.insert(0, str(CONSOLE_ROOT / "05_final_portal_package"))

try:
    from bca_data_exporter import generate_bca_package, build_elevation_record, calculate_compensatory_storage
except ImportError:
    # Fallback if run from a different working directory
    from workspace.archimedes_console.math_core.bca_data_exporter import (  # type: ignore
        generate_bca_package, build_elevation_record, calculate_compensatory_storage
    )

try:
    from build_pe_transmittal import build_pe_transmittal_letter, build_bric_bca_narrative
except ImportError:
    # Relative import fallback
    import importlib.util
    pe_path = CONSOLE_ROOT / "05_final_portal_package" / "build_pe_transmittal.py"
    spec = importlib.util.spec_from_file_location("build_pe_transmittal", pe_path)
    pe_mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(pe_mod)
    build_pe_transmittal_letter = pe_mod.build_pe_transmittal_letter
    build_bric_bca_narrative = pe_mod.build_bric_bca_narrative


def generate_full_regulatory_package(
    output_dir: str | Path = None,
    berm_length_ft: float = 300.0,
    berm_width_ft: float = 10.0,
    berm_height_ft: float = 3.0,
) -> dict:
    """
    Live orchestration:
    1. Generate BCA elevation + storage data (JSON/CSV + manifest)
    2. Generate PE Transmittal Letter (PDF)
    3. Generate BRIC BCA Narrative (PDF)
    4. Write a master package manifest with SHA-256
    """
    out = Path(output_dir) if output_dir else PACKAGE_DIR
    out.mkdir(parents=True, exist_ok=True)
    out_str = str(out)

    print("=" * 60)
    print("PTDT v32 – Full Regulatory + BCA Package Generation")
    print(f"Output directory: {out_str}")
    print("=" * 60)

    # 1. BCA data package
    print("\n[1/3] Generating BCA data package...")
    bca_pkg = generate_bca_package(
        output_dir=out_str,
        berm_length_ft=berm_length_ft,
        berm_width_ft=berm_width_ft,
        berm_height_ft=berm_height_ft,
    )

    # 2. PE Transmittal Letter
    print("\n[2/3] Generating PE Transmittal Letter...")
    build_pe_transmittal_letter(out_str)

    # 3. BRIC BCA Narrative
    print("\n[3/3] Generating BRIC BCA Narrative...")
    build_bric_bca_narrative(out_str)

    # Master manifest
    elev = build_elevation_record()
    storage = calculate_compensatory_storage(berm_length_ft, berm_width_ft, berm_height_ft)

    master = {
        "package_id": f"FULL-{datetime.datetime.utcnow().strftime('%Y%m%d-%H%M%S')}",
        "node": "13101_BONEBANK_RD",
        "generated_utc": datetime.datetime.utcnow().isoformat() + "Z",
        "purpose": "Complete LOMA + FEMA BRIC/HMA regulatory package",
        "elevation": {
            "lag_ft": elev.lowest_adjacent_grade_ft,
            "bfe_ft": elev.base_flood_elevation_ft,
            "clearance_ft": elev.clearance_above_bfe_ft,
            "datum": elev.datum,
        },
        "compensatory_storage": {
            "net_balance_cu_yds": storage.net_balance_cu_yds,
            "safety_factor": storage.safety_factor,
            "status": storage.status,
        },
        "artifacts": [
            "bca_elevation_data.json",
            "bca_storage_data.json",
            "bca_summary.csv",
            "bca_package_manifest.json",
            "01_PE_Transmittal_Letter.pdf",
            "02_FEMA_BRIC_BCA_Narrative.pdf",
        ],
        "notes": [
            "LAG 377.2 ft > BFE 375.0 ft (+2.2 ft) on natural grade → pure LOMA path",
            "Compensatory storage uses 1.20× safety factor (IDNR 312 IAC 10 alignment)",
            "All elevations NAVD88",
            "Apply Indiana PE seal to 01_PE_Transmittal_Letter.pdf before submission",
            "Feed bca_summary.csv / JSON into FEMA BCA Toolkit for BRIC/HMGP/FMA",
        ],
    }

    master_str = json.dumps(master, sort_keys=True)
    master["sha256"] = hashlib.sha256(master_str.encode()).hexdigest()

    master_path = out / "FULL_PACKAGE_MANIFEST.json"
    with open(master_path, "w", encoding="utf-8") as f:
        json.dump(master, f, indent=2)

    print("\n" + "=" * 60)
    print("FULL PACKAGE READY")
    print(f"Master manifest : {master_path}")
    print(f"SHA-256         : {master['sha256'][:24]}...")
    print("Artifacts written to:", out_str)
    print("=" * 60)
    print("Next steps:")
    print("  1. Apply Indiana PE seal to 01_PE_Transmittal_Letter.pdf")
    print("  2. Submit LOMA via Online LOMC / eLOMA")
    print("  3. Import bca_summary.csv into FEMA BCA Toolkit for BRIC")
    print("=" * 60)

    return master


if __name__ == "__main__":
    generate_full_regulatory_package()
