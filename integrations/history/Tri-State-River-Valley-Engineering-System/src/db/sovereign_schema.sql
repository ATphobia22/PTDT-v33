-- Enable PostGIS for geospatial sovereignty
create extension if not exists postgis;

-- The 'Truth' Table: Stores verified flood depths
create table public.sovereign_depth_grid (
  id uuid default gen_random_uuid() primary key,
  sensor_node text not null, -- e.g., "USGS-03378500"
  timestamp timestamptz default now(),
  
  -- The Affidavit Payload
  navd88_elevation numeric(10, 4),
  velocity_fps numeric(10, 4),
  horn_slope_deg numeric(10, 4),
  
  -- Geospatial Footprint (Point Township Parcel)
  geom geometry(Polygon, 4326),
  
  -- Validation Status (Daubert Standard)
  verification_status text check (verification_status in ('PENDING', 'AFFIRMED', 'REJECTED'))
);

-- Realtime Subscription Policy
alter publication supabase_realtime add table sovereign_depth_grid;
