from __future__ import annotations

import struct
from collections.abc import Sequence
from dataclasses import dataclass

_HEADER_STRUCT = struct.Struct("<4I")


@dataclass(frozen=True, slots=True)
class Float32GridPayload:
    """Little-endian WebGPU storage-buffer payload for a scalar raster/grid."""

    width: int
    height: int
    values: tuple[float, ...]
    nodata: float = float("nan")

    def __post_init__(self) -> None:
        if self.width <= 0 or self.height <= 0:
            raise ValueError("grid dimensions must be positive")
        if len(self.values) != self.width * self.height:
            raise ValueError("grid value count does not match dimensions")

    def pack(self) -> bytes:
        """Return a deterministic header + float32 payload.

        Header words are width, height, element byte size, and reserved=0.
        This is suitable for a WebGPU storage buffer; callers should use a
        storage buffer rather than a uniform buffer for arbitrarily large grids.
        """
        header = _HEADER_STRUCT.pack(self.width, self.height, 4, 0)
        values = struct.pack(f"<{len(self.values)}f", *self.values)
        return header + values

    @property
    def byte_length(self) -> int:
        return _HEADER_STRUCT.size + len(self.values) * 4

    @property
    def wgsl_struct(self) -> str:
        return "struct GridHeader { width: u32, height: u32, element_bytes: u32, reserved: u32, };"


def pack_float32_grid(width: int, height: int, values: Sequence[float]) -> bytes:
    """Validate and pack a scalar grid without retaining a mutable copy."""
    payload = Float32GridPayload(width=width, height=height, values=tuple(float(v) for v in values))
    return payload.pack()
