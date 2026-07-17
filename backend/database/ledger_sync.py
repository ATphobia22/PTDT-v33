import logging
import json
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

logger = logging.getLogger("ptdt.database")

class RelationalLedgerSynchronizer:
    """
    PostgreSQL ledger sync layer.
    Manages active database schemas and logs simulation status details.
    """
    def __init__(self, connection_dsn: str):
        self.dsn = connection_dsn
        self.conn = None

    def connect(self):
        """Creates connection to the PostgreSQL cluster."""
        try:
            self.conn = psycopg2.connect(self.dsn)
            self.conn.autocommit = True
            logger.info("Connected to PostgreSQL database ledger.")
        except Exception as e:
            logger.error(f"PostgreSQL connection failed: {str(e)}")
            raise

    def bootstrap_schema(self):
        """Creates the simulation results schema tables."""
        query = """
        CREATE TABLE IF NOT EXISTS simulation_runs (
            run_id VARCHAR(64) PRIMARY KEY,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status VARCHAR(32) NOT NULL,
            peak_floodway_rise_ft NUMERIC(6, 4),
            economic_losses_usd NUMERIC(15, 2),
            compliance_status JSONB,
            signature VARCHAR(256)
        );
        """
        try:
            with self.conn.cursor() as cursor:
                cursor.execute(query)
            logger.info("Database schema initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to bootstrap PostgreSQL database: {str(e)}")
            raise

    def record_simulation_run(self, run_id: str, status: str, rise_ft: float, losses: float, compliance: dict, signature: str) -> bool:
        """Saves a simulation record."""
        query = """
        INSERT INTO simulation_runs (run_id, status, peak_floodway_rise_ft,
        economic_losses_usd, compliance_status, signature)
        VALUES (%s, %s, %s, %s, %s, %s)
        ON CONFLICT (run_id) DO UPDATE SET
            status = EXCLUDED.status,
            peak_floodway_rise_ft = EXCLUDED.peak_floodway_rise_ft,
            economic_losses_usd = EXCLUDED.economic_losses_usd,
            compliance_status = EXCLUDED.compliance_status,
            signature = EXCLUDED.signature;
        """
        try:
            with self.conn.cursor() as cursor:
                cursor.execute(query, (run_id, status, rise_ft, losses, json.dumps(compliance), signature))
            return True
        except Exception as e:
            logger.error(f"Failed to record simulation run: {str(e)}")
            return False

    def disconnect(self):
        if self.conn:
            self.conn.close()
            logger.info("Database ledger connection closed safely.")
