"""USDA-NRCS Soil Data Access (SDA) helper for Posey County / Point Township.

Public REST: POST https://SDMDataAccess.sc.egov.usda.gov/Tabular/post.rest
No API key. Optional offline support for Archimedes narrative metrics.
"""
from __future__ import annotations

import json
import urllib.error
import urllib.parse
import urllib.request
from typing import Any, Dict, List, Optional

SDA_URL = "https://SDMDataAccess.sc.egov.usda.gov/Tabular/post.rest"


def query_sda(sql: str, fmt: str = "json+columnname", timeout: int = 12) -> Any:
    body = urllib.parse.urlencode({"query": sql, "format": fmt}).encode("utf-8")
    req = urllib.request.Request(
        SDA_URL,
        data=body,
        headers={
            "User-Agent": "PTDT-v33-Tri-State-Twin",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        raw = resp.read().decode("utf-8")
        if fmt.startswith("json"):
            return json.loads(raw)
        return raw


def posey_mapunits(limit: int = 25) -> List[Dict[str, Any]]:
    """Best-effort SSURGO mapunit sample for Indiana / Posey.

    SDA schema varies; this query is intentionally conservative.
    On failure returns a documented offline row.
    """
    # Legend-area join is the usual pattern; keep TOP N for latency.
    sql = f"""
SELECT TOP {int(limit)}
  mu.mukey, mu.muname
FROM mapunit mu
INNER JOIN legend l ON mu.lkey = l.lkey
WHERE l.areasymbol LIKE 'IN%' 
ORDER BY mu.mukey
""".strip()
    try:
        data = query_sda(sql)
        rows = _normalize_sda_table(data)
        if rows:
            return rows
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, json.JSONDecodeError, ValueError) as e:
        print(f"NRCS SDA warning: {e}")
    return [
        {
            "mukey": "LOCAL-POSEY",
            "muname": "Wabash floodplain complex (offline)",
            "hydgrpdcd": "C/D",
            "drainagecl": "Somewhat poorly drained",
            "source": "LOCAL_SOIL_FALLBACK",
        }
    ]


def _normalize_sda_table(data: Any) -> List[Dict[str, Any]]:
    """SDA JSON shapes vary (array-of-arrays vs objects)."""
    if isinstance(data, list) and data and isinstance(data[0], dict):
        return list(data)
    if isinstance(data, dict):
        for key in ("Table", "table", "rows", "data"):
            if key in data and isinstance(data[key], list):
                return _normalize_sda_table(data[key])
    if isinstance(data, list) and len(data) >= 2 and isinstance(data[0], list):
        headers = [str(h) for h in data[0]]
        out: List[Dict[str, Any]] = []
        for row in data[1:]:
            if not isinstance(row, list):
                continue
            out.append({headers[i]: row[i] if i < len(row) else None for i in range(len(headers))})
        return out
    return []


if __name__ == "__main__":
    sample = posey_mapunits(5)
    print(json.dumps(sample, indent=2)[:2000])
