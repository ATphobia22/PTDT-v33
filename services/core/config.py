import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # App Settings
    PROJECT_NAME: str = "Point Township Sovereign Digital Twin (PTDT v23)"
    API_V1_STR: str = "/api/v1"
    
    # Database Settings
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/ptdt_spatial"
    TIMESCALEDB_URL: str = "postgresql://postgres:postgres@localhost:5432/ptdt_telemetry"
    
    # Security Settings
    JWT_SECRET_KEY: str = "08af7e29b1390d64e9a30cf1243db7842c23ebcd10ef2a3d0f0c0b0a8d7c6b5a"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 Hours
    
    # GIS Aggregation Endpoints
    IDNR_REST_ENDPOINT: str = "https://dnrmaps.dnr.in.gov/arcgis/rest/services"
    USGS_HYDRO_ENDPOINT: str = "https://hydro.nationalmap.gov/arcgis/rest/services"
    USGS_NED_3DEP_ENDPOINT: str = "https://elevation.nationalmap.gov/arcgis/rest/services"
    FEMA_HAZUS_API_ENDPOINT: str = "https://hazus.fema.gov/api/v1"
    
    # Multi-Physics Solver Parameters
    DEFAULT_GRID_NX: int = 256
    DEFAULT_GRID_NY: int = 256
    SOLVER_TIMESTEP_DT: float = 0.05
    GRAVITY_ACCEL: float = 9.812
    MANNINGS_N_BASE: float = 0.035
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
