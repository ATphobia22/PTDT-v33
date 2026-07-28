import json
import csv
import sys
import os
import re


def _normalize(s: str) -> str:
    return re.sub(r"\s+", " ", str(s).strip().upper())


def _is_ngvd29(label: str) -> bool:
    u = _normalize(label)
    return "NGVD29" in u.replace(" ", "") or "NGVD 29" in u or u == "NGVD29"


def _is_navd88(label: str) -> bool:
    u = _normalize(label)
    compact = u.replace(" ", "")
    return "NAVD88" in compact or "NAVD 88" in u or compact in ("NAVD88", "NAVD1988")


def check_elevation_datum(file_path: str) -> bool:
    """Scan JSON/CSV elevation exports; require NAVD 88; block NGVD 29."""
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".json":
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return validate_json(data, file_path)
    if ext == ".csv":
        with open(file_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            return validate_csv(reader, file_path)
    print(f"[ERROR] Unsupported file format: {ext}")
    return False


def validate_json(data, path: str) -> bool:
    datum = None
    if isinstance(data, dict):
        datum = (
            data.get("elevation_baseline", {}).get("vertical_datum")
            if isinstance(data.get("elevation_baseline"), dict)
            else None
        ) or data.get("vertical_datum")
    if not datum:
        print(f"[BLOCK] {path}: No vertical datum found. NAVD 88 labeling required.")
        return False
    if _is_ngvd29(str(datum)):
        print(f"[BLOCK] {path}: NGVD 29 detected. Transform via NGS NCAT to NAVD 88.")
        return False
    if not _is_navd88(str(datum)):
        print(f"[BLOCK] {path}: Unrecognized datum '{datum}'. NAVD 88 required for FEMA LOMA.")
        return False
    print(f"[PASS] {path}: Verified NAVD 88 compliance.")
    return True


def validate_csv(reader, path: str) -> bool:
    for row in reader:
        for val in row.values():
            if _is_ngvd29(str(val)):
                print(f"[BLOCK] {path}: NGVD 29 detected in records. Conversion mandatory.")
                return False
    print(f"[PASS] {path}: Verified CSV compliance.")
    return True


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python navd88_hard_check.py <file_to_check>")
        sys.exit(1)
    target_file = sys.argv[1]
    if not os.path.exists(target_file):
        print(f"[ERROR] File not found: {target_file}")
        sys.exit(1)
    sys.exit(0 if check_elevation_datum(target_file) else 1)
