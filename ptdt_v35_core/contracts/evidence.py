from __future__ import annotations

import hashlib
import json
from dataclasses import asdict, dataclass, field
from typing import Any


@dataclass(frozen=True, slots=True)
class EvidenceArtifact:
    artifact_id: str
    source_ids: tuple[str, ...] = ()
    transformation: dict[str, Any] = field(default_factory=dict)
    authority_class: str = "derived"
    stored_hash: str = ""

    def canonical_bytes(self) -> bytes:
        payload = asdict(self)
        payload.pop("stored_hash", None)
        return json.dumps(
            payload,
            sort_keys=True,
            separators=(",", ":"),
            ensure_ascii=False,
        ).encode("utf-8")

    def content_hash(self) -> str:
        return hashlib.sha256(self.canonical_bytes()).hexdigest()

    def validate_chain(self) -> None:
        if not self.artifact_id.strip():
            raise ValueError("artifact_id is required")
        if self.authority_class not in {
            "authoritative", "engineering", "derived", "generated", "cinematic"
        }:
            raise ValueError("invalid authority_class")
        if any(not source.strip() for source in self.source_ids):
            raise ValueError("source_ids must contain non-empty identifiers")
        if self.stored_hash and self.stored_hash != self.content_hash():
            raise ValueError("stored_hash does not match canonical evidence content")
