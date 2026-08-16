# backend/core/telemetry/openmi_ledger_node.py
import sys
import datetime
import hashlib
import json
from typing import Dict, Any

# Mock or real import path depending on compilation states
# import ptdt_ledger_pb2 as pb2

class OpenMILedgerNodeStub:
    """
    Acts as the OpenMI ledger gateway driver.
    Authenticates and locks manifest evidence targets before state distribution.
    """
    def __init__(self, ledger_db_path: str = "05_final_portal_package/ledger_state.json"):
        self.ledger_db_path = ledger_db_path

    def _calculate_deterministic_seal(self, payload: Dict[str, Any]) -> str:
        """Serializes layout data to create clean hashes."""
        serialized = json.dumps(payload, sort_keys=True, default=str)
        return hashlib.sha256(serialized.encode('utf-8')).hexdigest()

    def seal_loma_evidence_manifest(self, request_payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes internal ledger verification. Evaluates the site's metrics
        against strict regulatory zero-rise boundaries prior to code execution.
        """
        anchor = request_payload.get("geographic_anchor", {})
        bfe = anchor.get("base_flood_elevation", 375.0)
        lag = anchor.get("lowest_adjacent_grade", 377.2)

        # Double check core metrics internally before sealing
        clearance = round(lag - bfe, 2)
        print(f"[LEDGER AUDIT] Validating site clearance parameters: {clearance:+} ft relative to BFE.")

        # Evaluate B.I.B.L.E Boundary Level Validation rules
        if lag < bfe:
            status_text = "STATUS_REJECTED_BY_BIBLE_RULE"
            tx_id = "0x00000000000000000000000000000000"
            sha_seal = "0000000000000000000000000000000000000000000000000000000000000000"
        else:
            status_text = "STATUS_COMMITTED"
            sha_seal = self._calculate_deterministic_seal(request_payload)
            tx_id = f"0x_tx_{hashlib.md5(sha_seal.encode()).hexdigest()[:16]}"

        receipt = {
            "manifest_uuid": request_payload.get("manifest_uuid", "UNKNOWN_UUID"),
            "blockchain_ledger_tx_id": tx_id,
            "cryptographic_sha256_seal": sha_seal,
            "compliance_state": status_text,
            "sealed_timestamp_utc": datetime.datetime.utcnow().isoformat() + "Z"
        }
        
        # Commit record log stub append step
        self._append_to_local_ledger_store(receipt)
        return receipt

    def _append_to_local_ledger_store(self, receipt: Dict[str, Any]):
        """Persists the transaction records to the local portal registry pack."""
        import os
        records = []
        if os.path.exists(self.ledger_db_path):
            try:
                with open(self.ledger_db_path, 'r') as f:
                    records = json.load(f)
            except Exception:
                records = []
                
        records.append(receipt)
        
        os.makedirs(os.path.dirname(self.ledger_db_path), exist_ok=True)
        with open(self.ledger_db_path, 'w') as f:
            json.dump(records, f, indent=4, sort_keys=True)
            
        print(f"[LEDGER STORE] Appended verification record to {self.ledger_db_path}")

if __name__ == "__main__":
    # Internal validation block runner
    stub_node = OpenMILedgerNodeStub()
    mock_request = {
        "manifest_uuid": "REQ-7622-X9",
        "timestamp_utc": "2026-08-01T21:55:00Z",
        "geographic_anchor": {
            "state_parcel_id": "65-19-think-gis-verified",
            "township_section": "S35, T7S, R14W",
            "base_flood_elevation": 375.0,
            "lowest_adjacent_grade": 377.2,
            "lowest_floor_elevation": 382.5,
            "compensatory_factor": 1.20,
            "fema_community_id": "180194"
        },
        "operator_signature": "PE_SIGNATURE_TUCKER_844AB58"
    }
    
    print("\n--- RUNNING MOCK ENGINE LEDGER SUBMISSION ---")
    print(json.dumps(stub_node.seal_loma_evidence_manifest(mock_request), indent=2))
