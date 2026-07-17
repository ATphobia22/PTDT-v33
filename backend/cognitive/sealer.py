import hmac
import hashlib
import json
import logging
from typing import Dict, Any

logger = logging.getLogger("ptdt.cognitive.sealer")

class CryptographicSealer:
    """Verifiably signs dynamic execution states and logs."""
    def __init__(self, key: str = "TUCKER-SOVEREIGN-SEAL-KEY-V32"):
        self.key = key.encode("utf-8")

    def sign_results_payload(self, payload: Dict[str, Any]) -> str:
        serialized = json.dumps(payload, sort_keys=True)
        signature = hmac.new(self.key, serialized.encode("utf-8"), hashlib.sha256)
        return signature.hexdigest()

    def verify_signature(self, payload: Dict[str, Any], token: str) -> bool:
        target_token = self.sign_results_payload(payload)
        return hmac.compare_digest(target_token, token)
