"""
BCA Data Exporter Module
PTDT v32 / Tucker Cognitive OS – Sovereign Node

Generates structured data packages suitable for input into the FEMA Benefit-Cost Analysis (BCA)
Toolkit used for BRIC, HMGP, and FMA grant applications.

All elevations referenced to NAVD88.
Property: 13101 Bonebank Road, Mount Vernon, IN 47620 (Posey County / Point Township)
"""

import os
import json
import csv
import datetime
import hashlib
from dataclasses import dataclass, asdict
from typing import Dict, Any, Optional

# ---------------------------------------------------------------------------
# Constants – Point Township / Section 35
# ---------------------------------------------------------------------------
PROPERTY_ADDRESS = "13101 Bonebank Road"
CITY_STATE_ZIP = "Mount Vernon, IN 47620"
COUNTY = "Posey"
TOWNSHIP = "Point Township"
LATITUDE = 37.845900
LONGITUDE = -88.005100
PROPERTY_AREA_ACRES = 2.0
BASE_FLOOD_ELEVATION_FT = 375.0          # FEMA BFE
LOWEST_ADJACENT_GRADE_FT = 377.2         # Verified 5 cm LiDAR LAG
CLEARANCE_FT = LOWEST_ADJACENT_GRADE_FT - BASE_FLOOD_ELEVATION_FT
USGS_GAUGE_ID = "03378500"               # Wabash River at New Harmony
DATUM = "NAVD88"
MANNING_N = 0.045
RIVER_SLOPE = 0.00015
COMPENSATORY_SAFETY_FACTOR = 1.20


@dataclass
class BCAElevationRecord:
    """Core elevation data required by FEMA BCA Toolkit and LOMA packages."""
    property_address: str
    latitude: float
    longitude: float
    base_flood_elevation_ft: float
    lowest_adjacent_grade_ft: float
    clearance_above_bfe_ft: float
    datum: str
    source_lag: str
    source_bfe: str
    usgs_gauge_id: str
    timestamp_utc: str


@dataclass
class BCAStorageRecord:
    """Compensatory storage metrics for Zero-Rise / IDNR 312 IAC 10 compliance."""
    berm_length_ft: float
    berm_width_ft: float
    berm_height_ft: float
    displacement_cu_yds: float
    excavation_cu_yds: float
    net_balance_cu_yds: float
    safety_factor: float
    status: str


def calculate_compensatory_storage(
    berm_length_ft: float = 300.0,
    berm_width_ft: float = 10.0,
    berm_height_ft: float = 3.0,
    safety_factor: float = COMPENSATORY_SAFETY_FACTOR,
) -> BCAStorageRecord:
    """Deterministic Net-Zero volumetric balance with safety factor."""
    displacement_cu_ft = berm_length_ft * berm_width_ft * berm_height_ft
    excavation_cu_ft = displacement_cu_ft * safety_factor
    displacement_cu_yds = displacement_cu_ft / 27.0
    excavation_cu_yds = excavation_cu_ft / 27.0
    net_balance = excavation_cu_yds - displacement_cu_yds

    return BCAStorageRecord(
        berm_length_ft=berm_length_ft,
        berm_width_ft=berm_width_ft,
        berm_height_ft=berm_height_ft,
        displacement_cu_yds=round(displacement_cu_yds, 2),
        excavation_cu_yds=round(excavation_cu_yds, 2),
        net_balance_cu_yds=round(net_balance, 2),
        safety_factor=safety_factor,
        status="NET-POSITIVE / COMPLIANT" if net_balance >= 0 else "NON-COMPLIANT",
    )


def build_elevation_record() -> BCAElevationRecord:
    """Assemble the primary elevation record used by BCA and LOMA workflows."""
    return BCAElevationRecord(
        property_address=f"{PROPERTY_ADDRESS}, {CITY_STATE_ZIP}",
        latitude=LATITUDE,
        longitude=LONGITUDE,
        base_flood_elevation_ft=BASE_FLOOD_ELEVATION_FT,
        lowest_adjacent_grade_ft=LOWEST_ADJACENT_GRADE_FT,
        clearance_above_bfe_ft=round(CLEARANCE_FT, 2),
        datum=DATUM,
        source_lag="5 cm LiDAR survey (verified)",
        source_bfe="FEMA Flood Insurance Study / Effective FIRM",
        usgs_gauge_id=USGS_GAUGE_ID,
        timestamp_utc=datetime.datetime.utcnow().isoformat() + "Z",
    )


def generate_bca_package(
    output_dir: str = "05_final_portal_package",
    berm_length_ft: float = 300.0,
    berm_width_ft: float = 10.0,
    berm_height_ft: float = 3.0,
) -> Dict[str, Any]:
    """
    Produce a complete BCA-ready data package.

    Outputs:
    - bca_elevation_data.json
    - bca_storage_data.json
    - bca_summary.csv
    - bca_package_manifest.json (with SHA-256 integrity hash)
    """
    os.makedirs(output_dir, exist_ok=True)

    elev = build_elevation_record()
    storage = calculate_compensatory_storage(berm_length_ft, berm_width_ft, berm_height_ft)

    # --- JSON outputs ---
    elev_path = os.path.join(output_dir, "bca_elevation_data.json")
    with open(elev_path, "w", encoding="utf-8") as f:
        json.dump(asdict(elev), f, indent=2)

    storage_path = os.path.join(output_dir, "bca_storage_data.json")
    with open(storage_path, "w", encoding="utf-8") as f:
        json.dump(asdict(storage), f, indent=2)

    # --- CSV summary for easy import into spreadsheets / BCA Toolkit ---
    csv_path = os.path.join(output_dir, "bca_summary.csv")
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["Field", "Value", "Unit / Notes"])
        writer.writerow(["Property Address", elev.property_address, ""])
        writer.writerow(["Latitude", elev.latitude, "decimal degrees"])
        writer.writerow(["Longitude", elev.longitude, "decimal degrees"])
        writer.writerow(["Base Flood Elevation (BFE)", elev.base_flood_elevation_ft, "ft NAVD88"])
        writer.writerow(["Lowest Adjacent Grade (LAG)", elev.lowest_adjacent_grade_ft, "ft NAVD88"])
        writer.writerow(["Clearance above BFE", elev.clearance_above_bfe_ft, "ft"])
        writer.writerow(["Datum", elev.datum, ""])
        writer.writerow(["LAG Source", elev.source_lag, ""])
        writer.writerow(["BFE Source", elev.source_bfe, ""])
        writer.writerow(["USGS Gauge", elev.usgs_gauge_id, "Wabash River at New Harmony"])
        writer.writerow(["Property Area", PROPERTY_AREA_ACRES, "acres"])
        writer.writerow(["Displacement Volume", storage.displacement_cu_yds, "cu yd"])
        writer.writerow(["Excavation Volume (1.20x)", storage.excavation_cu_yds, "cu yd"])
        writer.writerow(["Net Storage Balance", storage.net_balance_cu_yds, "cu yd"])
        writer.writerow(["Storage Status", storage.status, ""])
        writer.writerow(["Generated UTC", elev.timestamp_utc, ""])

    # --- Manifest with integrity hash ---
    package = {
        "package_id": f"BCA-{datetime.datetime.utcnow().strftime('%Y%m%d-%H%M%S')}",
        "node": "13101_BONEBANK_RD",
        "purpose": "FEMA BRIC / HMA Benefit-Cost Analysis input package",
        "elevation": asdict(elev),
        "compensatory_storage": asdict(storage),
        "files": [
            "bca_elevation_data.json",
            "bca_storage_data.json",
            "bca_summary.csv",
        ],
        "notes": [
            "Clearance of +2.2 ft on natural grade supports pure LOMA path.",
            "Compensatory storage uses 1.20x safety factor for IDNR 312 IAC 10 alignment.",
            "All elevations referenced to NAVD88.",
            "Feed elevation and damage fields into FEMA BCA Toolkit.",
        ],
    }

    # Compute simple integrity hash of the package content
    package_str = json.dumps(package, sort_keys=True)
    package["sha256"] = hashlib.sha256(package_str.encode()).hexdigest()

    manifest_path = os.path.join(output_dir, "bca_package_manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(package, f, indent=2)

    print(f"[BCA] Elevation data  → {elev_path}")
    print(f"[BCA] Storage data    → {storage_path}")
    print(f"[BCA] Summary CSV     → {csv_path}")
    print(f"[BCA] Package manifest→ {manifest_path}")
    print(f"[BCA] SHA-256         → {package['sha256'][:16]}...")
    print("[BCA] Package ready for FEMA BCA Toolkit / BRIC sub-application.")

    return package


if __name__ == "__main__":
    print("Generating FEMA BCA data package for 13101 Bonebank Road...")
    generate_bca_package()
