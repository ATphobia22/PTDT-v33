"""
PTDT v33 — Recursive Path-Addressable Memory Tree
"""

from __future__ import annotations

import time
import uuid
from typing import Any, Dict, Optional


class MemoryNode:
    def __init__(self, path: str, content: str, embedding: list, parent_path: Optional[str] = None):
        self.node_id = str(uuid.uuid4())
        self.path = path
        self.content = content
        self.embedding = embedding
        self.parent_path = parent_path
        self.created_at = time.time()
        self.metadata: Dict[str, Any] = {}

    def serialize_to_chroma(self) -> Dict[str, Any]:
        return {
            "id": self.node_id,
            "document": self.content,
            "metadata": {
                "path": self.path,
                "parent_path": self.parent_path,
                "created_at": self.created_at,
                **{k: str(v) for k, v in self.metadata.items()},
            },
        }

    def attach_governance(self, decision: str, sha256: str) -> None:
        self.metadata["governance_decision"] = decision
        self.metadata["cryptographic_hash"] = sha256
