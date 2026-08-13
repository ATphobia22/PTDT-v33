# Manual fetch URLs (operator)

## BAFL Posey

1. Open https://www.in.gov/dnr/water/surface-water/indiana-floodplain-mapping/the-indiana-best-available-floodplain-mapping/
2. Select **Posey** county
3. Download FloodHazard + Flood_Elevation_Pts zip
4. Unzip to `data/geo/bafl_posey/`

## USGS FIM New Harmony

1. https://pubs.usgs.gov/sir/2016/5119/
2. Download `depth_grids.zip` and `shapefile.zip`
3. Unzip to `data/flood_xs/usgs_fim_new_harmony/`

## Verify

```bash
ls data/geo/bafl_posey
ls data/flood_xs/usgs_fim_new_harmony
```
