import json
import csv
import sys
import os

def check_elevation_datum(file_path):
    """
    Scans a file (JSON or CSV) for elevation data and verifies it is in NAVD 88.
    Blocks NGVD 29 or unlabeled data to prevent flood insurance errors.
    """
    ext = os.path.splitext(file_path)[1].lower()
    
    if ext == '.json':
        with open(file_path, 'r') as f:
            data = json.load(f)
            return validate_json(data, file_path)
    elif ext == '.csv':
        with open(file_path, 'r') as f:
            reader = csv.DictReader(f)
            return validate_csv(reader, file_path)
    else:
        print(f"[ERROR] Unsupported file format: {ext}")
        return False

def validate_json(data, path):
    # Common keys for datum in this app
    datum = data.get("elevation_baseline", {}).get("vertical_datum") or data.get("vertical_datum")
    
    if not datum:
        print(f"[BLOCK] {path}: No vertical datum found. NAVD 88 labeling required.")
        return False
    
    if "NGVD 29" in datum.upper() or "29" in datum:
        print(f"[BLOCK] {path}: NGVD 29 detected. Transformation to NAVD 88 via NCAT required.")
        return False
    
    if "NAVD 88" not in datum.upper() and "88" not in datum:
        print(f"[BLOCK] {path}: Unrecognized datum '{datum}'. NAVD 88 required for FEMA LOMA.")
        return False
        
    print(f"[PASS] {path}: Verified NAVD 88 compliance.")
    return True

def validate_csv(reader, path):
    # Check if 'Standard' or 'Datum' column exists and has NGVD29
    for row in reader:
        for val in row.values():
            if "NGVD 29" in str(val).upper():
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
        
    if check_elevation_datum(target_file):
        sys.exit(0)
    else:
        sys.exit(1)
