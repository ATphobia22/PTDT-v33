from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "PTDT v32 Sovereign Node"
    API_VERSION: str = "v32.0.0"
    DEBUG: bool = False
    
    # Database
    SURREAL_URL: str = "ws://surrealdb:8000/rpc"
    POSTGRES_URL: str = "postgresql://ptdt:securepass123@postgres:5432/ptdt_ledger"
    
    # Security
    SECRET_KEY: str = "your-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Simulation
    DEFAULT_TIMESTEP_SECONDS: float = 30.0
    MAX_STEPS: int = 24
    CFL_MAX: float = 0.95
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
