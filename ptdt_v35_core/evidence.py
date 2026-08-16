from __future__ import annotations

import hashlib
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any

import rfc8785


@dataclass(frozen=True, slots=True)
class EvidenceNode:
    node_id: str
    provenance_id: str
    authority: str
    validation_status: str
    payload: dict[str, Any]
    parent_ids: tuple[str, ...] = ()
    timestamp_utc: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z'))

    def canonical_bytes(self) -> bytes:
        return rfc8785.dumps({
            "authority": self.authority,
            "node_id": self.node_id,
            "parent_ids": list(self.parent_ids),
            "payload": self.payload,
            "provenance_id": self.provenance_id,
            "timestamp_utc": self.timestamp_utc,
            "validation_status": self.validation_status,
        })

    @property
    def payload_hash(self) -> str:
        return hashlib.sha256(self.canonical_bytes()).hexdigest()

class EvidenceLedger:
    def __init__(self) -> None:
        self._nodes: dict[str, EvidenceNode] = {}

    def append(self, node: EvidenceNode) -> None:
        if node.node_id in self._nodes:
            raise ValueError(f"duplicate evidence node: {node.node_id}")
        for parent in node.parent_ids:
            if parent not in self._nodes:
                raise ValueError(f"unknown evidence parent: {parent}")
        self._nodes[node.node_id] = node

    def verify(self) -> None:
        for node in self._nodes.values():
            for parent in node.parent_ids:
                if parent not in self._nodes:
                    raise ValueError(f"broken evidence edge: {parent}")
            if node.payload_hash != hashlib.sha256(node.canonical_bytes()).hexdigest():
                raise ValueError(f"evidence hash mismatch: {node.node_id}")

    def get(self, node_id: str) -> EvidenceNode:
        return self._nodes[node_id]
