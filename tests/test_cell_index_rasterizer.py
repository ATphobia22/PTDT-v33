import numpy as np
from backend.services.hecras_cell_index_rasterizer import rasterize_nearest_cell_index


def test_nearest_cell_assignment():
    cells = np.array([[0.0, 0.0], [10.0, 0.0], [0.0, -10.0], [10.0, -10.0]], dtype=np.float64)
    m = rasterize_nearest_cell_index(
        cells, origin_xy=(-5.0, 5.0), pixel_size=10.0, width=2, height=2
    )
    assert m.shape == (2, 2)
    assert m.dtype == np.uint32
    assert set(int(x) for x in m.ravel()) <= {0, 1, 2, 3}
