import pytest

from ptdt_v35_core.contracts.evidence import EvidenceArtifact


def test_canonical_hash_is_deterministic() -> None:
    first = EvidenceArtifact("a", ("source",), {"method": "x"}, "derived")
    second = EvidenceArtifact("a", ("source",), {"method": "x"}, "derived")
    assert first.canonical_bytes() == second.canonical_bytes()
    assert first.content_hash() == second.content_hash()


def test_changed_provenance_changes_hash() -> None:
    first = EvidenceArtifact("a", ("source-a",))
    second = EvidenceArtifact("a", ("source-b",))
    assert first.content_hash() != second.content_hash()


def test_invalid_stored_hash_rejected() -> None:
    artifact = EvidenceArtifact("a", stored_hash="not-a-hash")
    with pytest.raises(ValueError):
        artifact.validate_chain()


def test_invalid_authority_class_rejected() -> None:
    artifact = EvidenceArtifact("a", authority_class="surveyed-fact")
    with pytest.raises(ValueError):
        artifact.validate_chain()
