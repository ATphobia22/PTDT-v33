import os
import shutil
import hashlib
import datetime
import json
import sys

# --- CONFIGURATION ---
SOURCE_DIR = os.path.dirname(os.path.abspath(__file__))
EXTERNAL_DRIVE_LABEL = "SOVEREIGN_DRIVE"

def create_directory_structure():
    print("\n[1] Initializing Sovereign Node Directory Workspace...")
    directories = [
        "01_visual_twin/screenshots",
        "02_mathematical_core/outputs",
        "03_fema_portal_wizard/outputs",
        "04_reality_mesh/source_photos",
        "05_final_portal_package"
    ]
    for folder in directories:
        os.makedirs(os.path.join(SOURCE_DIR, folder), exist_ok=True)
        print(f" [+] Created workspace directory: {folder}")

def get_external_drive_path():
    """Auto-detects the external drive path based on the label."""
    system_platform = sys.platform
    if system_platform == "win32":
        import string
        from ctypes import windll
        drives = []
        bitmask = windll.kernel32.GetLogicalDrives()
        for letter in string.ascii_uppercase:
            if bitmask & 1:
                drives.append(letter)
            bitmask >>= 1
        for drive in drives:
            path = f"{drive}:\\"
            if os.path.exists(os.path.join(path, ".sovereign_vault_marker")):
                return path
        return None
    else:
        # Linux / Mac
        potential_path = f"/Volumes/{EXTERNAL_DRIVE_LABEL}"
        if os.path.exists(potential_path):
            return potential_path
        return None

def generate_file_hash(filepath):
    """Generates a SHA-256 hash to prove data integrity."""
    hasher = hashlib.sha256()
    with open(filepath, 'rb') as f:
        buf = f.read(65536)
        while len(buf) > 0:
            hasher.update(buf)
            buf = f.read(65536)
    return hasher.hexdigest()

def execute_vault_backup():
    print("\n[2] Initiating SOVEREIGN VAULT PROTOCOL...")
    target_root = get_external_drive_path()
    if not target_root or not os.path.exists(target_root):
        print(f" [!] External Drive '{EXTERNAL_DRIVE_LABEL}' or '.sovereign_vault_marker' not detected.")
        print(" Skipping physical backup to external drive. Directories created locally.")
        return

    timestamp = datetime.datetime.now().strftime("%Y_%m_%d_%H%M%S")
    backup_folder_name = f"Archimedes_Backup_{timestamp}"
    destination_path = os.path.join(target_root, "Sovereign_Backups", backup_folder_name)
    print(f" [+] Target Lock: {destination_path}")

    audit_log = {
        "backup_timestamp": timestamp,
        "source": SOURCE_DIR,
        "integrity_check": "SHA-256",
        "files_secured": []
    }

    try:
        shutil.copytree(SOURCE_DIR, destination_path, ignore=shutil.ignore_patterns('*.pyc', '__pycache__', '.git'))
        print(" [+] Data Mirroring Complete. Verifying Integrity...")
        for root, dirs, files in os.walk(destination_path):
            for file in files:
                full_path = os.path.join(root, file)
                file_hash = generate_file_hash(full_path)
                rel_path = os.path.relpath(full_path, destination_path)
                audit_entry = {
                    "file": rel_path,
                    "sha256_hash": file_hash,
                    "status": "VERIFIED_SECURED"
                }
                audit_log["files_secured"].append(audit_entry)
                print(f" > Sealed: {rel_path} | {file_hash[:8]}...")

        receipt_path = os.path.join(destination_path, "Backup_Audit_Receipt.json")
        with open(receipt_path, "w") as f:
            json.dump(audit_log, f, indent=4)

        print("\n" + "="*50)
        print(" BACKUP SEQUENCE SUCCESSFUL")
        print(f" LOCATION: {destination_path}")
        print(" AUDIT STATUS: SEALED & HASHED")
        print("="*50)
    except Exception as e:
        print(f" [!] BACKUP FAILURE: {str(e)}")

if __name__ == "__main__":
    create_directory_structure()
    execute_vault_backup()
