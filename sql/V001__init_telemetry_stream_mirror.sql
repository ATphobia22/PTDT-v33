-- PTDT optional PostGIS seed (from PTDT 33.pdf)
-- Requires PostgreSQL + PostGIS. Not required for zero-key Node path.

CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS spatial_gauges (
    station_id VARCHAR(32) PRIMARY KEY,
    nws_station_code VARCHAR(16) NOT NULL,
    gauge_name VARCHAR(128) NOT NULL,
    vertical_datum VARCHAR(16) DEFAULT 'NAVD 88',
    base_flood_elevation_ft NUMERIC(6, 2),
    action_stage_ft NUMERIC(5, 2),
    minor_flood_ft NUMERIC(5, 2),
    moderate_flood_ft NUMERIC(5, 2),
    major_flood_ft NUMERIC(5, 2),
    geom geometry(Point, 4326)
);

INSERT INTO spatial_gauges (
    station_id, nws_station_code, gauge_name, base_flood_elevation_ft,
    action_stage_ft, minor_flood_ft, moderate_flood_ft, major_flood_ft, geom
) VALUES
(
    '03378500', 'WABI2', 'WABASH RIVER AT NEW HARMONY, IN',
    375.00, 33.00, 37.00, 49.00, 60.00,
    ST_SetSRID(ST_MakePoint(-87.9414, 38.1309), 4326)
),
(
    '03322000', 'UNWK2', 'JOHN T. MYERS LOCK AND DAM',
    330.50, 33.00, 37.00, 49.00, 60.00,
    ST_SetSRID(ST_MakePoint(-87.95, 37.9), 4326)
)
ON CONFLICT (station_id) DO NOTHING;
