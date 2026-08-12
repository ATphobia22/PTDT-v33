"""Locked sovereign constants. Single source of truth for all elevation logic."""
from __future__ import annotations

BFE_NAVD88_FT: float = 375.00
LAG_NAVD88_FT: float = 377.20
BERM_CREST_NAVD88_FT: float = 379.80
HOUSE_FLOOR_NAVD88_FT: float = 378.45
FREEBOARD_VECTOR_FT: float = 4.80
COMPENSATORY_STORAGE_FACTOR: float = 1.20
BCR: float = 1.41
DATUM: str = "NAVD88"
CRS: str = "EPSG:2966"
SITE_NAME: str = "13101 Bonebank Road"
SITE_LAT: float = 37.9035
SITE_LON: float = -88.0007
USGS_STATION: str = "03378500"

AUTHORITY_PRESENTATION: str = "Presentation plate only — never hydraulic"
AUTHORITY_HYDRO: str = "Archimedes + HEC-RAS exclusive"
AUTHORITY_GROUNDWATER: str = "MODFLOW6 exclusive"
AUTHORITY_GEOTECH: str = "Bishop exclusive"

NOT_EVALUATED = "NOT_EVALUATED"
COUPLED_SIMULATION_INVALID = "COUPLED_SIMULATION_INVALID"
