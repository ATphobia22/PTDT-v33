import pytest

from adapters.engine.core.scene_state import SceneState, SceneStateValidationError


def test_scene_state_requires_authority_contract() -> None:
    with pytest.raises(SceneStateValidationError, match="authority_snapshot_id"):
        SceneState.from_mapping(
            {
                "frame_id": "frame-1",
                "authority_snapshot_id": "",
                "timestamp_utc": "2026-08-16T15:00:00Z",
                "crs": "EPSG:2966",
                "vertical_datum": "NAVD88",
                "render_origin": [0.0, 0.0, 0.0],
                "content_hash": "a" * 64,
                "validation_status": "VALID",
            }
        )


def test_scene_state_round_trip_is_deterministic() -> None:
    payload = {
        "frame_id": "frame-1",
        "authority_snapshot_id": "snapshot-1",
        "timestamp_utc": "2026-08-16T15:00:00Z",
        "crs": "EPSG:2966",
        "vertical_datum": "NAVD88",
        "render_origin": [1.0, 2.0, 3.0],
        "content_hash": "a" * 64,
        "validation_status": "VALID",
    }

    state = SceneState.from_mapping(payload)
    restored = SceneState.from_mapping(state.to_mapping())

    assert state.canonical_bytes() == restored.canonical_bytes()
    assert len(state.content_hash) == 64
