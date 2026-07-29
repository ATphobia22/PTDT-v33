#!/usr/bin/env python3
"""Build evidence_manifest.json from files that actually exist on disk."""
from __future__ import annotations

import hashlib
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def build_manifest(paths: List[str], project_id: str = "PTDT_LOCAL") -> Dict:
    elements = {}
    for p in paths:
        path = Path(p)
        if not path.is_file():
            continue
        elements[path.name] = sha256_file(path)
    master = hashlib.sha256(
        json.dumps(elements, sort_keys=True).encode("utf-8")
    ).hexdigest()
    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "project_id": project_id,
        "status": "LOCAL_FILE_INTEGRITY_ONLY",
        "certified_elements": elements,
        "cryptographic_master_seal": master,
        "note": "Integrity of listed files only — not agency approval or PE certification",
    }


if __name__ == "__main__":
    import sys

    files = sys.argv[1:] or [
        "docs/NO_RISE_PACKAGE_DRAFT.md",
        "docs/BRIC_SUBAPPLICATION_CHECKLIST.md",
    ]
    print(json.dumps(build_manifest(files), indent=2))
