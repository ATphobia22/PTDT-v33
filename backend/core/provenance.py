import hashlib
import json
from datetime import datetime

def create_evidence_manifest(data: dict) -> dict:
    payload = {
        "timestamp": datetime.utcnow().isoformat(),
        "version": "v32.0.0",
        **data
    }
    canonical = json.dumps(payload, sort_keys=True)
    payload["hash"] = hashlib.sha256(canonical.encode()).hexdigest()
    return payload
