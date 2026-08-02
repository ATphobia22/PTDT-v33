-- database/migrations/V001__ptdt_core_spatial_schema.sql

-- Enable spatial catalog tooling if not explicitly active
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. BASE HYDRAULIC ELEVATION TIERS
CREATE TABLE IF NOT EXISTS ptdt_hydraulic_planes (
    plane_id SERIAL PRIMARY KEY,
    datum_standard VARCHAR(16) DEFAULT 'NAVD88',
    base_flood_elevation_ft NUMERIC(5, 2) NOT NULL DEFAULT 375.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. PROPERTY STRUCTURES & SITES TABLE
CREATE TABLE IF NOT EXISTS ptdt_spatial_parcels (
    parcel_id VARCHAR(64) PRIMARY KEY,
    owner_name VARCHAR(128),
    lowest_adjacent_grade_ft NUMERIC(5, 2) NOT NULL,
    geom GEOMETRY(Geometry, 32616) NOT NULL, -- SRID 32616: UTM Zone 16N (Indiana South / Tri-State Focus)
    CONSTRAINT chk_lowest_adjacent_grade CHECK (lowest_adjacent_grade_ft > 0)
);

CREATE INDEX IF NOT EXISTS idx_ptdt_parcels_spatial ON ptdt_spatial_parcels USING GIST(geom);

-- 3. REGULATORY FLOODWAY EXCLUSION BOUNDARIES
CREATE TABLE IF NOT EXISTS ptdt_floodway_exclusion_zones (
    zone_id SERIAL PRIMARY KEY,
    restriction_level VARCHAR(32) DEFAULT 'ZERO_RISE_PROHIBITED',
    geom GEOMETRY(Polygon, 32616) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ptdt_floodway_spatial ON ptdt_floodway_exclusion_zones USING GIST(geom);

-- 4. B.I.B.L.E. SYSTEM REGRESSION ENFORCEMENT ENGINE FUNCTION
CREATE OR REPLACE FUNCTION verify_bible_boundary_compliance()
RETURNS TRIGGER AS $$
DECLARE
    intersection_detected BOOLEAN;
    current_bfe NUMERIC(5, 2);
BEGIN
    -- Fetch the active base flood plane evaluation reference
    SELECT base_flood_elevation_ft INTO current_bfe FROM ptdt_hydraulic_planes ORDER BY plane_id DESC LIMIT 1;
    IF current_bfe IS NULL THEN
        current_bfe := 375.00;
    END IF;

    -- RULE 1: If the site's Lowest Adjacent Grade (LAG) drops below Base Flood Elevation,
    -- intersect checks against strict exclusion zones must be clean.
    IF NEW.lowest_adjacent_grade_ft < current_bfe THEN
        -- Evaluate physical spatial overlap with strict zero-rise floodways
        SELECT EXISTS (
            SELECT 1
            FROM ptdt_floodway_exclusion_zones f
            WHERE ST_Intersects(NEW.geom, f.geom)
        ) INTO intersection_detected;

        IF intersection_detected THEN
            RAISE EXCEPTION 'B.I.B.L.E. REJECTION: Spatial structure footprint intersects restricted zero-rise floodway boundaries under Indiana 312 IAC 10 regulations.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Hook structural verification rules straight onto database insertion loops
DROP TRIGGER IF EXISTS trg_ptdt_bible_compliance_check ON ptdt_spatial_parcels;

CREATE TRIGGER trg_ptdt_bible_compliance_check
BEFORE INSERT OR UPDATE ON ptdt_spatial_parcels
FOR EACH ROW
EXECUTE FUNCTION verify_bible_boundary_compliance();
