#!/usr/bin/env python3
"""
PTDT cryptographic sealer — SHA-256 + optional HMAC for provenance.
Does NOT replace a PE seal (IC 25-31-1). For Daubert chain-of-custody of data only.
"""
from __future__ import annotations

import hashlib
import hmac
import json
import os
from typing import Any, Dict


class PTDTDataSealer:
    def __init__(self, secret_key: str | None = None):
        # Prefer env; never commit production secrets
        self.secret_key = secret_key or os.environ.get("PTDT_HMAC_KEY", "LOCAL-DEV-ONLY-NOT-FOR-PROD")

    def seal_raw_payload(self, payload: Dict[str, Any]) -> str:
        serialized = json.dumps(payload, sort_keys=True, separators=(",", ":"))
        return hashlib.sha256(serialized.encode("utf-8")).hexdigest()

    def seal_raw_bytes(self, raw_bytes: bytes) -> str:
        return hashlib.sha256(raw_bytes).hexdigest()

    def sign_execution_hmac(self, payload: Dict[str, Any]) -> str:
        serialized = json.dumps(payload, sort_keys=True, separators=(",", ":"))
        return hmac.new(
            self.secret_key.encode("utf-8"),
            serialized.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()


if __name__ == "__main__":
    s = PTDTDataSealer()
    demo = {"site": "13101 Bonebank Road", "bfe": 375.0, "lag": 377.2}
    print("sha256", s.seal_raw_payload(demo))
    print("hmac", s.sign_execution_hmac(demo))
