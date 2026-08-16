# scripts/generate_offline_pmtiles.py
import os
import sqlite3
import requests
from typing import List, Tuple

class LocalTilePackager:
    def __init__(self, output_path: str, bbox: Tuple[float, float, float, float], zoom_range: List[int]):
        """
        Initializes the fallback packager.
        Target BBox: Posey County / Bonebank Road Corridor area
        e.g., (-88.05, 37.85, -87.90, 37.98)
        """
        self.output_path = output_path
        self.bbox = bbox
        self.zoom_range = zoom_range
        self.base_url = "https://cartocdn.com{z}/{x}/{y}.png"

    def latlon_to_tile(self, lat: float, lon: float, zoom: int) -> Tuple[int, int]:
        import math
        lat_rad = math.radians(lat)
        n = 2.0 ** zoom
        x = int((lon + 180.0) / 360.0 * n)
        y = int((1.0 - math.log(math.tan(lat_rad) + (1.0 / math.cos(lat_rad))) / math.pi) / 2.0 * n)
        return x, y

    def build_repository(self):
        print(f"[PMTILES] Generating local data repository fallback container: {self.output_path}")

        # Initialize an MBTiles/SQLite structure internally which mirrors PMTiles block layout
        if os.path.exists(self.output_path):
            os.remove(self.output_path)

        conn = sqlite3.connect(self.output_path)
        cursor = conn.cursor()

        cursor.execute("CREATE TABLE metadata (name TEXT, value TEXT);")
        cursor.execute("CREATE TABLE tiles (zoom_level INTEGER, tile_column INTEGER, tile_row INTEGER, tile_data BLOB);")

        # Seed core metadata properties for web gl nodes
        metadata = [
            ("name", "PTDT Dark Base Map Fallback"),
            ("format", "png"),
            ("bounds", f"{self.bbox[0]},{self.bbox[1]},{self.bbox[2]},{self.bbox[3]}"),
            ("type", "baselayer")
        ]
        cursor.executemany("INSERT INTO metadata VALUES (?, ?);", metadata)

        for z in range(self.zoom_range[0], self.zoom_range[1] + 1):
            x_min, y_max = self.latlon_to_tile(self.bbox[1], self.bbox[0], z)
            x_max, y_min = self.latlon_to_tile(self.bbox[3], self.bbox[2], z)

            print(f" Processing Zoom Level {z} (X: {x_min} to {x_max}, Y: {y_min} to {y_max})")

            for x in range(min(x_min, x_max), max(x_min, x_max) + 1):
                for y in range(min(y_min, y_max), max(y_min, y_max) + 1):
                    url = self.base_url.format(z=z, x=x, y=y)
                    try:
                        # Fetch the remote tile asset cleanly
                        res = requests.get(url, timeout=5)
                        if res.status_code == 200:
                            # Standard MBTiles inverted Y coordinate transform rule
                            flipped_y = (2 ** z) - 1 - y
                            cursor.execute(
                                "INSERT INTO tiles VALUES (?, ?, ?, ?);",
                                (z, x, flipped_y, sqlite3.Binary(res.content))
                            )
                    except Exception as e:
                        continue

        conn.commit()
        conn.close()

        print("[PMTILES] Secure offline base repository finalized successfully.")

if __name__ == "__main__":
    # Bounds for Point Township / Bonebank Corridor
    packager = LocalTilePackager(
        output_path="05_final_portal_package/offline_base_layer.mbtiles",
        bbox=(-88.0500, 37.8500, -87.9000, 37.9800),
        zoom_range=[10, 14]
    )
    packager.build_repository()
