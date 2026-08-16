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
    timestamp_utc: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"))

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
        visiting: set[str] = set()
        visited: set[str] = set()

        def visit(node_id: str) -> None:
            if node_id in visiting:
                raise ValueError(f"evidence DAG cycle detected at: {node_id}")
            if node_id in visited:
                return
            node = self._nodes[node_id]
            visiting.add(node_id)
            for parent in node.parent_ids:
                if parent not in self._nodes:
                    raise ValueError(f"broken evidence edge: {parent}")
                visit(parent)
            visiting.remove(node_id)
            visited.add(node_id)
            if node.payload_hash != hashlib.sha256(node.canonical_bytes()).hexdigest():
                raise ValueError(f"evidence hash mismatch: {node.node_id}")

        for node_id in self._nodes:
            visit(node_id)

    def get(self, node_id: str) -> EvidenceNode:
        return self._nodes[node_id]
