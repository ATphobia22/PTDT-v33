from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass
from typing import Any


def _canonical(value: Any) -> bytes:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False, allow_nan=False).encode("utf-8")


def canonical_sha256(value: Any) -> str:
    return hashlib.sha256(_canonical(value)).hexdigest()


@dataclass(frozen=True, slots=True)
class SourceRecord:
    source_id: str
    kind: str
    uri: str | None = None
    sha256: str | None = None
    observed_at: str | None = None

    def __post_init__(self) -> None:
        if not self.source_id or not self.kind:
            raise ValueError("source_id and kind are required")
        if self.sha256 is not None and (len(self.sha256) != 64 or any(c not in "0123456789abcdef" for c in self.sha256)):
            raise ValueError("sha256 must be a lowercase SHA-256 digest")

    def to_mapping(self) -> dict[str, Any]:
        return {"source_id": self.source_id, "kind": self.kind, "uri": self.uri, "sha256": self.sha256, "observed_at": self.observed_at}


@dataclass(frozen=True, slots=True)
class TransformRecord:
    transform_id: str
    operation: str
    input_hashes: tuple[str, ...]
    output_hash: str
    parameters: dict[str, Any]

    def __post_init__(self) -> None:
        if not self.transform_id or not self.operation or not self.output_hash:
            raise ValueError("transform identity and output hash are required")
        if len(self.output_hash) != 64 or any(c not in "0123456789abcdef" for c in self.output_hash):
            raise ValueError("output_hash must be a lowercase SHA-256 digest")
        for digest in self.input_hashes:
            if len(digest) != 64 or any(c not in "0123456789abcdef" for c in digest):
                raise ValueError("input_hashes must contain SHA-256 digests")

    def to_mapping(self) -> dict[str, Any]:
        return {"transform_id": self.transform_id, "operation": self.operation, "input_hashes": list(self.input_hashes), "output_hash": self.output_hash, "parameters": self.parameters}


@dataclass(frozen=True, slots=True)
class ProvenanceManifest:
    sources: tuple[SourceRecord, ...]
    transforms: tuple[TransformRecord, ...]

    @property
    def content_sha256(self) -> str:
        return canonical_sha256({"sources": [s.to_mapping() for s in self.sources], "transforms": [t.to_mapping() for t in self.transforms]})

    def to_mapping(self) -> dict[str, Any]:
        return {"sources": [s.to_mapping() for s in self.sources], "transforms": [t.to_mapping() for t in self.transforms], "content_sha256": self.content_sha256}
