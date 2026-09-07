from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True, slots=True)
class TemporalStateContract:
    timestamp: datetime
    valid_from: datetime
    valid_to: datetime | None = None
    timestep: str | None = None

    def validate(self) -> None:
        for value in (self.timestamp, self.valid_from, self.valid_to):
            if value is not None and value.tzinfo is None:
                raise ValueError("temporal values must be timezone-aware")
        if self.valid_to is not None and self.valid_to < self.valid_from:
            raise ValueError("valid_to must not precede valid_from")
        if self.timestep is not None and not self.timestep.strip():
            raise ValueError("timestep cannot be empty")
