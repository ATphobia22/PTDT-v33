#!/usr/bin/env bash
set -euo pipefail

# OSS point-cloud -> raster -> COG path.
# Requires: PDAL + GDAL. No vendor API or proprietary SDK is used.
INPUT="${1:?input LAS/LAZ/point-cloud file required}"
OUTPUT="${2:?output COG path required}"
RESOLUTION="${3:-3}"
TMP="${OUTPUT%.tif}.tmp.tif"

mkdir -p "$(dirname "$OUTPUT")"

pdal pipeline --stdin <<JSON
{
  "pipeline": [
    {"type":"readers.las","filename":"$INPUT"},
    {"type":"filters.range","limits":"Classification[2:2]"},
    {"type":"writers.gdal","filename":"$TMP","resolution":$RESOLUTION,"radius":$((RESOLUTION * 2)),"output_type":"mean","data_type":"float32","gdaldriver":"GTiff","window_size":8}
  ]
}
JSON

gdal_translate "$TMP" "$OUTPUT" \
  -of COG \
  -co COMPRESS=DEFLATE \
  -co PREDICTOR=3 \
  -co BLOCKSIZE=512 \
  -co OVERVIEWS=IGNORE_EXISTING \
  -co RESAMPLING=AVERAGE

rm -f "$TMP"
echo "Wrote COG: $OUTPUT"
