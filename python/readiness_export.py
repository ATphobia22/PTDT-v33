#!/usr/bin/env python3
"""
Project-tracking readiness export for AGENCY_SUBMISSION_READINESS gates.

Does NOT file, seal, or approve anything.
Edit gate statuses in this script (or pass a JSON overlay) as work progresses.
"""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import os
from typing import Any, Dict, List


# ---------------------------------------------------------------------------
# Default gate definitions (A = LOMA, B = IDNR, C = BRIC)
# status: not_started | in_progress | blocked | done
# ---------------------------------------------------------------------------
DEFAULT_GATES: List[Dict[str, Any]] = [
    # A. FEMA LOMA
    {"id": "A1", "section": "A_LOMA", "label": "Natural ground (no fill under structure)", "status": "not_started", "owner": "survey/owner"},
    {"id": "A2", "section": "A_LOMA", "label": "LAG > BFE on NAVD 88 (verify survey)", "status": "not_started", "owner": "survey_PE"},
    {"id": "A3", "section": "A_LOMA", "label": "Deed / tax plat", "status": "not_started", "owner": "county"},
    {"id": "A4", "section": "A_LOMA", "label": "PE-sealed topo / elevation exhibit", "status": "not_started", "owner": "indiana_PE"},
    {"id": "A5", "section": "A_LOMA", "label": "MT-EZ / Online LOMC fields complete", "status": "not_started", "owner": "applicant+PE"},
    {"id": "A6", "section": "A_LOMA", "label": "FARA archived if Zone A / unmapped / drainage trigger", "status": "not_started", "owner": "INFIP"},
    {"id": "A7", "section": "A_LOMA", "label": "Community # / FIRM panel re-checked on MSC", "status": "not_started", "owner": "applicant"},
    # B. IDNR floodway
    {"id": "B1", "section": "B_IDNR", "label": "INFIP query for site BFE / stream", "status": "not_started", "owner": "applicant"},
    {"id": "B2", "section": "B_IDNR", "label": "Drainage area >= 1 sq mi assessed", "status": "not_started", "owner": "PE"},
    {"id": "B3", "section": "B_IDNR", "label": "Floodway vs fringe (BAFL + FIRM)", "status": "not_started", "owner": "PE"},
    {"id": "B4", "section": "B_IDNR", "label": "FARA generated + archived", "status": "not_started", "owner": "INFIP"},
    {"id": "B5", "section": "B_IDNR", "label": "Technical worksheets (HEC-RAS model-of-record)", "status": "not_started", "owner": "PE"},
    {"id": "B6", "section": "B_IDNR", "label": "No-Rise PE-signed (0.000 ft language as PE states)", "status": "not_started", "owner": "indiana_PE"},
    {"id": "B7", "section": "B_IDNR", "label": "Compensatory storage method accepted by reviewer", "status": "not_started", "owner": "PE"},
    {"id": "B8", "section": "B_IDNR", "label": "Public notice / adjacent owners", "status": "not_started", "owner": "applicant"},
    {"id": "B9", "section": "B_IDNR", "label": "Affirmation / state forms signed", "status": "not_started", "owner": "applicant"},
    # C. BRIC / mitigation funding
    {"id": "C1", "section": "C_BRIC", "label": "IDHS eGrants path identified", "status": "not_started", "owner": "applicant"},
    {"id": "C2", "section": "C_BRIC", "label": "FEMA BCA Toolkit run (official; not invented BCR)", "status": "not_started", "owner": "PE/BCA_analyst"},
    {"id": "C3", "section": "C_BRIC", "label": "Scope/budget/SOW consistent with PE models", "status": "not_started", "owner": "project_team"},
]

PROJECT_NOTES = {
    "property": "13101 Bonebank Road, Point Township, Posey County, IN",
    "elevation_hypotheses": {
        "bfe_ft": 375.0,
        "lag_ft": 377.2,
        "ffe_ft": 382.5,
        "datum": "NAVD88",
        "note": "Verify with licensed survey/PE before any federal or state filing.",
    },
    "disclaimer": (
        "This JSON is project tracking only. It does not constitute PE certification, "
        "IDNR approval, FEMA LOMA determination, or BRIC award."
    ),
}


def _summarize(gates: List[Dict[str, Any]]) -> Dict[str, Any]:
    by_section: Dict[str, Dict[str, int]] = {}
    for g in gates:
        sec = g["section"]
        by_section.setdefault(sec, {"total": 0, "done": 0, "in_progress": 0, "blocked": 0, "not_started": 0})
        by_section[sec]["total"] += 1
        st = g.get("status", "not_started")
        if st in by_section[sec]:
            by_section[sec][st] += 1
        else:
            by_section[sec]["not_started"] += 1
    return by_section


def build_payload(gates: List[Dict[str, Any]] | None = None) -> Dict[str, Any]:
    gates = gates or [dict(g) for g in DEFAULT_GATES]
    payload = {
        "schema": "ptdt.readiness.v1",
        "generated_at_utc": dt.datetime.now(dt.timezone.utc).isoformat(),
        "project": PROJECT_NOTES,
        "gates": gates,
        "summary_by_section": _summarize(gates),
        "official_portals": {
            "fema_online_lomc": "https://www.fema.gov/flood-maps/change-your-flood-zone/online-lomc",
            "fema_bca": "https://www.fema.gov/grants/tools/benefit-cost-analysis",
            "infip": "https://www.in.gov/dnr/water/surface-water/indiana-floodplain-mapping/indiana-floodplain-information-portal",
            "indiana_elevation": "https://elevation.gio.in.gov/",
            "indianamap": "https://www.indianamap.org/",
            "usgs_3dep": "https://apps.nationalmap.gov/downloader/",
        },
    }
    raw = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    payload["integrity_sha256"] = hashlib.sha256(raw).hexdigest()
    return payload


def export(output_dir: str = "05_better_data_agency_package", filename: str = "09_readiness_gates.json") -> str:
    os.makedirs(output_dir, exist_ok=True)
    path = os.path.join(output_dir, filename)
    payload = build_payload()
    with open(path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)
        f.write("\n")
    return path


def main() -> None:
    parser = argparse.ArgumentParser(description="Export A/B/C readiness gates JSON (tracking only).")
    parser.add_argument("--out-dir", default="05_better_data_agency_package")
    parser.add_argument("--overlay", help="Optional JSON file with {\"gates\": [{\"id\":\"A1\",\"status\":\"done\"}, ...]}")
    args = parser.parse_args()

    gates = [dict(g) for g in DEFAULT_GATES]
    if args.overlay:
        with open(args.overlay, encoding="utf-8") as f:
            overlay = json.load(f)
        updates = {item["id"]: item for item in overlay.get("gates", []) if "id" in item}
        for g in gates:
            if g["id"] in updates:
                g.update({k: v for k, v in updates[g["id"]].items() if k != "id"})

    path = os.path.join(args.out_dir, "09_readiness_gates.json")
    os.makedirs(args.out_dir, exist_ok=True)
    payload = build_payload(gates)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)
        f.write("\n")
    print(path)
    print(json.dumps(payload["summary_by_section"], indent=2))


if __name__ == "__main__":
    main()
