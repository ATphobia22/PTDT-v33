#!/usr/bin/env python3
"""
Local SQLite audit ledger for No-Rise *screening* records.

This is an internal engineering log — not a government registry and not a certificate.
"""
from __future__ import annotations

import datetime as dt
import hashlib
import json
import sqlite3
from typing import Any, Dict

DB_NAME = "ptdt_engineering_ledger.db"


def initialize_database(db_path: str = DB_NAME) -> None:
    with sqlite3.connect(db_path) as conn:
        c = conn.cursor()
        c.execute(
            """
            CREATE TABLE IF NOT EXISTS norise_screenings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                project_name TEXT NOT NULL,
                fill_volume_cu_yd REAL NOT NULL,
                required_cut_cu_yd REAL NOT NULL,
                actual_cut_cu_yd REAL NOT NULL,
                achieved_ratio REAL NOT NULL,
                wse_rise_ft REAL NOT NULL,
                bishop_fos REAL,
                regulatory_status TEXT NOT NULL,
                content_sha256 TEXT UNIQUE NOT NULL
            )
            """
        )
        conn.commit()


def _seal(payload: Dict[str, Any]) -> str:
    canonical = json.dumps(payload, sort_keys=True, default=str)
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def register_norise_screening(data: Dict[str, Any], db_path: str = DB_NAME) -> str:
    """
    Insert a screening row. regulatory_status must be one of:
    SCREENING_ONLY | AWAITING_PE_REVIEW | PE_SIGNED_LOCAL_COPY
    Never write APPROVED_CERTIFIED_* without a human PE process outside this DB.
    """
    status = data.get("status", "SCREENING_ONLY")
    allowed = {"SCREENING_ONLY", "AWAITING_PE_REVIEW", "PE_SIGNED_LOCAL_COPY"}
    if status not in allowed:
        raise ValueError(f"status must be one of {allowed}; got {status}")

    payload = {
        "project_name": data["project_name"],
        "fill_volume": float(data["fill_volume"]),
        "required_cut": float(data["required_cut"]),
        "actual_cut": float(data["actual_cut"]),
        "achieved_ratio": float(data["achieved_ratio"]),
        "wse_rise": float(data["wse_rise"]),
        "bishop_fos": float(data.get("bishop_fos") or 0.0),
        "status": status,
    }
    seal = _seal(payload)
    ts = dt.datetime.now(dt.timezone.utc).isoformat()
    initialize_database(db_path)
    with sqlite3.connect(db_path) as conn:
        try:
            conn.execute(
                """
                INSERT INTO norise_screenings
                (timestamp, project_name, fill_volume_cu_yd, required_cut_cu_yd, actual_cut_cu_yd,
                 achieved_ratio, wse_rise_ft, bishop_fos, regulatory_status, content_sha256)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    ts,
                    payload["project_name"],
                    payload["fill_volume"],
                    payload["required_cut"],
                    payload["actual_cut"],
                    payload["achieved_ratio"],
                    payload["wse_rise"],
                    payload["bishop_fos"],
                    payload["status"],
                    seal,
                ),
            )
            conn.commit()
        except sqlite3.IntegrityError:
            return f"duplicate_seal:{seal}"
    return seal


if __name__ == "__main__":
    initialize_database()
    s = register_norise_screening(
        {
            "project_name": "Archimedes Line screening (local log only)",
            "fill_volume": 5000.0,
            "required_cut": 6000.0,
            "actual_cut": 6500.0,
            "achieved_ratio": 1.30,
            "wse_rise": 0.0,
            "bishop_fos": 1.68,
            "status": "SCREENING_ONLY",
        }
    )
    print(s)
