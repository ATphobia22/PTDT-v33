from datetime import datetime, timezone

import pytest

from ptdt_v35_core.contracts.temporal_state import TemporalStateContract


def test_valid_interval() -> None:
    start = datetime(2026, 8, 16, tzinfo=timezone.utc)
    state = TemporalStateContract(start, start, start.replace(hour=1), "PT1H")
    state.validate()


def test_naive_datetime_rejected() -> None:
    now = datetime(2026, 8, 16)
    with pytest.raises(ValueError):
        TemporalStateContract(now, now).validate()


def test_reverse_interval_rejected() -> None:
    start = datetime(2026, 8, 16, tzinfo=timezone.utc)
    end = datetime(2026, 8, 15, tzinfo=timezone.utc)
    with pytest.raises(ValueError):
        TemporalStateContract(start, start, end).validate()
