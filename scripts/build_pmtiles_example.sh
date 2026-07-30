#!/usr/bin/env bash
# Example: GeoJSON → MBTiles/PMTiles for MapLibre (requires tippecanoe + optional pmtiles CLI)
# Usage: ./scripts/build_pmtiles_example.sh path/to/footprints.geojson out/site.pmtiles
set -euo pipefail
IN="${1:?GeoJSON input required}"
OUT="${2:-out/site.pmtiles}"
mkdir -p "$(dirname "$OUT")"
TMP="$(mktemp -d)"
echo "Building from $IN → $OUT"
tippecanoe -o "$TMP/site.mbtiles" -zg --drop-densest-as-needed --extend-zooms-if-still-dropping "$IN"
if command -v pmtiles >/dev/null 2>&1; then
  pmtiles convert "$TMP/site.mbtiles" "$OUT"
  echo "Wrote $OUT"
else
  cp "$TMP/site.mbtiles" "${OUT%.pmtiles}.mbtiles"
  echo "pmtiles CLI not found; wrote ${OUT%.pmtiles}.mbtiles — install go-pmtiles or tippecanoe pmtiles support"
fi
rm -rf "$TMP"
