#!/usr/bin/env python3
"""Tri-State No-Rise ledger — SQLite archive for cut/fill and certifications."""

from __future__ import annotations

import datetime
import hashlib
import json
import sqlite3

DB_NAME = "ptdt_sovereign_registry.db"


def initialize_database() -> None:
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS levee_submissions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                target_zone TEXT NOT NULL,
                berm_length_ft REAL NOT NULL,
                berm_width_ft REAL NOT NULL,
                berm_height_ft REAL NOT NULL,
                calculated_volume_cu_yd REAL NOT NULL,
                cryptographic_seal TEXT UNIQUE NOT NULL
            )
            """
        )
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS norise_certifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                project_name TEXT NOT NULL,
                fill_volume_cu_yd REAL NOT NULL,
                cut_volume_cu_yd REAL NOT NULL,
                safety_factor REAL NOT NULL DEFAULT 1.20,
                surcharge_ft REAL NOT NULL DEFAULT 0.0,
                firm_panel TEXT,
                cryptographic_seal TEXT UNIQUE NOT NULL
            )
            """
        )
        conn.commit()


def seal_payload(payload: dict) -> str:
    blob = json.dumps(payload, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(blob.encode("utf-8")).hexdigest()


def record_norise(
    project_name: str,
    fill_cu_yd: float,
    cut_cu_yd: float,
    safety_factor: float = 1.20,
    surcharge_ft: float = 0.0,
    firm_panel: str = "18129C0215D",
) -> str:
    initialize_database()
    ts = datetime.datetime.utcnow().isoformat() + "Z"
    payload = {
        "ts": ts,
        "project": project_name,
        "fill": fill_cu_yd,
        "cut": cut_cu_yd,
        "sf": safety_factor,
        "surcharge": surcharge_ft,
        "panel": firm_panel,
    }
    seal = seal_payload(payload)
    with sqlite3.connect(DB_NAME) as conn:
        conn.execute(
            """
            INSERT INTO norise_certifications
            (timestamp, project_name, fill_volume_cu_yd, cut_volume_cu_yd,
             safety_factor, surcharge_ft, firm_panel, cryptographic_seal)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (ts, project_name, fill_cu_yd, cut_cu_yd, safety_factor, surcharge_ft, firm_panel, seal),
        )
        conn.commit()
    return seal


if __name__ == "__main__":
    initialize_database()
    s = record_norise(
        "13101 Bonebank Road Flood Defense",
        fill_cu_yd=100.0,
        cut_cu_yd=120.0,
        safety_factor=1.20,
        surcharge_ft=0.0,
    )
    print("norise seal", s)
