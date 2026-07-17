import math
import logging
from typing import List, Tuple

logger = logging.getLogger("ptdt.gis.terrain")

class HornTerrainEngine:
    def __init__(self, cell_size_x: float = 1.0, cell_size_y: float = 1.0):
        self.dx = cell_size_x
        self.dy = cell_size_y

    def compute_slope_aspect(self, matrix_3x3: List[List[float]]) -> Tuple[float, float]:
        if len(matrix_3x3) != 3 or any(len(row) != 3 for row in matrix_3x3):
            raise ValueError("Input grid matrix must be exactly 3x3 cells.")
        a, b, c = matrix_3x3[0]
        d, e, f = matrix_3x3[1]
        g, h, i = matrix_3x3[2]

        dz_dx = ((c + 2*f + i) - (a + 2*d + g)) / (8 * self.dx)
        dz_dy = ((g + 2*h + i) - (a + 2*b + c)) / (8 * self.dy)

        grad = math.sqrt(dz_dx**2 + dz_dy**2)
        slope_rad = math.atan(grad)
        slope_deg = math.degrees(slope_rad)

        aspect_deg = 0.0
        if dz_dx != 0 or dz_dy != 0:
            aspect_rad = math.atan2(dz_dy, -dz_dx)
            aspect_deg = math.degrees(aspect_rad)
            aspect_deg = (450.0 - aspect_deg) % 360.0

        return round(slope_deg, 4), round(aspect_deg, 4)
