#!/usr/bin/env bash
# Example offline pipeline: LAS/LAZ → DEM → Terrarium-style RGB (requires PDAL + rio-rgbify)
# Usage: ./scripts/lidar_to_terrarium_example.sh input.laz dem.tif terrarium_dir/
set -euo pipefail
IN="${1:?LAS/LAZ required}"
DEM="${2:-dem.tif}"
OUTDIR="${3:-terrarium_tiles}"
echo "PDAL translate $IN → $DEM"
pdal translate "$IN" "$DEM" terrain --writers.gdal.output_type=idw --writers.gdal.resolution=1.0 || {
  echo "Adjust PDAL pipeline for your CRS/resolution; this is a template only"
  exit 1
}
echo "rio rgbify → $OUTDIR"
mkdir -p "$OUTDIR"
rio rgbify -b -10000 -i 0.1 "$DEM" "$OUTDIR/" || {
  echo "Install: pip install rio-rgbify rasterio"
  exit 1
}
echo "Serve tiles and point MapLibre raster-dem tiles to http://localhost:PORT/{z}/{x}/{y}.png"
echo "NOT survey-grade until PE validates vertical datum (NAVD 88)."
