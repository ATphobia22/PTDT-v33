#!/usr/bin/env python3
"""
Project-tracking readiness export for AGENCY_SUBMISSION_READINESS gates.

Does NOT file, seal, or approve anything.

Examples:
  python python/readiness_export.py
  python python/readiness_export.py --set A2=in_progress --set B1=done
  python python/readiness_export.py --overlay status.json
  python python/readiness_export.py --validate 05_better_data_agency_package/09_readiness_gates.json
"""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import os
import sys
from typing import Any, Dict, List, Optional

VALID_STATUSES = ("not_started", "in_progress", "blocked", "done")

DEFAULT_GATES: List[Dict[str, Any]] = [
    {"id": "A1", "section": "A_LOMA", "label": "Natural ground (no fill under structure)", "status": "not_started", "owner": "survey/owner"},
    {"id": "A2", "section": "A_LOMA", "label": "LAG > BFE on NAVD 88 (verify survey)", "status": "not_started", "owner": "survey_PE"},
    {"id": "A3", "section": "A_LOMA", "label": "Deed / tax plat", "status": "not_started", "owner": "county"},
    {"id": "A4", "section": "A_LOMA", "label": "PE-sealed topo / elevation exhibit", "status": "not_started", "owner": "indiana_PE"},
    {"id": "A5", "section": "A_LOMA", "label": "MT-EZ / Online LOMC fields complete", "status": "not_started", "owner": "applicant+PE"},
    {"id": "A6", "section": "A_LOMA", "label": "FARA archived if Zone A / unmapped / drainage trigger", "status": "not_started", "owner": "INFIP"},
    {"id": "A7", "section": "A_LOMA", "label": "Community # / FIRM panel re-checked on MSC", "status": "not_started", "owner": "applicant"},
    {"id": "B1", "section": "B_IDNR", "label": "INFIP query for site BFE / stream", "status": "not_started", "owner": "applicant"},
    {"id": "B2", "section": "B_IDNR", "label": "Drainage area >= 1 sq mi assessed", "status": "not_started", "owner": "PE"},
    {"id": "B3", "section": "B_IDNR", "label": "Floodway vs fringe (BAFL + FIRM)", "status": "not_started", "owner": "PE"},
    {"id": "B4", "section": "B_IDNR", "label": "FARA generated + archived", "status": "not_started", "owner": "INFIP"},
    {"id": "B5", "section": "B_IDNR", "label": "Technical worksheets (HEC-RAS model-of-record)", "status": "not_started", "owner": "PE"},
    {"id": "B6", "section": "B_IDNR", "label": "No-Rise PE-signed (0.000 ft language as PE states)", "status": "not_started", "owner": "indiana_PE"},
    {"id": "B7", "section": "B_IDNR", "label": "Compensatory storage method accepted by reviewer", "status": "not_started", "owner": "PE"},
    {"id": "B8", "section": "B_IDNR", "label": "Public notice / adjacent owners", "status": "not_started", "owner": "applicant"},
    {"id": "B9", "section": "B_IDNR", "label": "Affirmation / state forms signed", "status": "not_started", "owner": "applicant"},
    {"id": "C1", "section": "C_HMA", "label": "State applicant path identified (IDHS / FEMA GO)", "status": "not_started", "owner": "applicant"},
    {"id": "C2", "section": "C_HMA", "label": "FEMA BCA Toolkit run (official; not invented BCR)", "status": "not_started", "owner": "PE/BCA_analyst"},
    {"id": "C3", "section": "C_HMA", "label": "Scope/budget/SOW consistent with PE models", "status": "not_started", "owner": "project_team"},
    {"id": "C4", "section": "C_HMA", "label": "FEMA-approved hazard mitigation plan coverage confirmed", "status": "not_started", "owner": "local_gov"},
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
        "IDNR approval, FEMA LOMA determination, or HMA/BRIC award."
    ),
}


def _summarize(gates: List[Dict[str, Any]]) -> Dict[str, Any]:
    by_section: Dict[str, Dict[str, int]] = {}
    for g in gates:
        sec = g["section"]
        by_section.setdefault(
            sec, {"total": 0, "done": 0, "in_progress": 0, "blocked": 0, "not_started": 0}
        )
        by_section[sec]["total"] += 1
        st = g.get("status", "not_started")
        if st in by_section[sec]:
            by_section[sec][st] += 1
        else:
            by_section[sec]["not_started"] += 1
    return by_section


def _canonical_bytes(payload: Dict[str, Any]) -> bytes:
    """Serialize payload without integrity field for stable hashing."""
    body = {k: v for k, v in payload.items() if k != "integrity_sha256"}
    return json.dumps(body, sort_keys=True, separators=(",", ":")).encode("utf-8")


def compute_sha256(payload: Dict[str, Any]) -> str:
    return hashlib.sha256(_canonical_bytes(payload)).hexdigest()


def attach_integrity(payload: Dict[str, Any]) -> Dict[str, Any]:
    payload = dict(payload)
    payload["integrity_sha256"] = compute_sha256(payload)
    return payload


def validate_integrity(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Return validation result for a loaded readiness JSON."""
    expected = payload.get("integrity_sha256")
    if not expected:
        return {
            "ok": False,
            "error": "missing integrity_sha256 field",
            "computed": compute_sha256(payload),
        }
    computed = compute_sha256(payload)
    ok = computed == expected
    return {
        "ok": ok,
        "expected": expected,
        "computed": computed,
        "match": ok,
        "note": "Integrity covers all fields except integrity_sha256 itself (canonical JSON).",
    }


def build_payload(gates: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
    gates = gates or [dict(g) for g in DEFAULT_GATES]
    for g in gates:
        if g.get("status") not in VALID_STATUSES:
            raise ValueError(f"Invalid status for {g.get('id')}: {g.get('status')}")
    payload: Dict[str, Any] = {
        "schema": "ptdt.readiness.v1",
        "generated_at_utc": dt.datetime.now(dt.timezone.utc).isoformat(),
        "project": PROJECT_NOTES,
        "gates": gates,
        "summary_by_section": _summarize(gates),
        "official_portals": {
            "fema_online_lomc": "https://www.fema.gov/flood-maps/change-your-flood-zone/online-lomc",
            "fema_bca": "https://www.fema.gov/grants/tools/benefit-cost-analysis",
            "fema_hma_guide": "https://www.fema.gov/grants/mitigation/learn/hazard-mitigation-assistance-guidance",
            "fema_bric": "https://www.fema.gov/grants/mitigation/building-resilient-infrastructure-communities",
            "fema_hmgp": "https://www.fema.gov/grants/mitigation/hazard-mitigation",
            "infip": "https://www.in.gov/dnr/water/surface-water/indiana-floodplain-mapping/indiana-floodplain-information-portal",
            "indiana_elevation": "https://elevation.gio.in.gov/",
            "indianamap": "https://www.indianamap.org/",
            "usgs_3dep": "https://apps.nationalmap.gov/downloader/",
        },
    }
    return attach_integrity(payload)


def apply_set_args(gates: List[Dict[str, Any]], set_args: List[str]) -> None:
    by_id = {g["id"]: g for g in gates}
    for item in set_args:
        if "=" not in item:
            raise ValueError(f"--set expects GATE=status, got: {item}")
        gid, status = item.split("=", 1)
        gid = gid.strip()
        status = status.strip()
        if gid not in by_id:
            raise ValueError(f"Unknown gate id: {gid}")
        if status not in VALID_STATUSES:
            raise ValueError(f"Invalid status '{status}'. Use one of: {', '.join(VALID_STATUSES)}")
        by_id[gid]["status"] = status


def apply_overlay(gates: List[Dict[str, Any]], overlay_path: str) -> None:
    with open(overlay_path, encoding="utf-8") as f:
        overlay = json.load(f)
    updates = {item["id"]: item for item in overlay.get("gates", []) if "id" in item}
    for g in gates:
        if g["id"] in updates:
            g.update({k: v for k, v in updates[g["id"]].items() if k != "id"})


def load_existing_gates(path: str) -> List[Dict[str, Any]]:
    """Load gates from a prior export so --set can persist across runs."""
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    result = validate_integrity(data)
    if not result["ok"]:
        print(f"WARNING: integrity check failed on {path}: {result}", file=sys.stderr)
    existing = {g["id"]: g for g in data.get("gates", [])}
    gates = [dict(g) for g in DEFAULT_GATES]
    for g in gates:
        if g["id"] in existing and "status" in existing[g["id"]]:
            g["status"] = existing[g["id"]]["status"]
            if "notes" in existing[g["id"]]:
                g["notes"] = existing[g["id"]]["notes"]
    return gates


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Export / validate A/B/C readiness gates JSON (tracking only)."
    )
    parser.add_argument("--out-dir", default="05_better_data_agency_package")
    parser.add_argument(
        "--out-file",
        default="09_readiness_gates.json",
        help="Filename inside --out-dir",
    )
    parser.add_argument(
        "--overlay",
        help='JSON overlay: {"gates": [{"id":"A1","status":"done"}, ...]}',
    )
    parser.add_argument(
        "--set",
        action="append",
        default=[],
        metavar="GATE=status",
        help="Set gate status (repeatable). Example: --set A2=done --set B1=in_progress",
    )
    parser.add_argument(
        "--validate",
        metavar="PATH",
        help="Validate integrity_sha256 of an existing readiness JSON and exit",
    )
    parser.add_argument(
        "--from-existing",
        action="store_true",
        help="Load statuses from existing out file before applying --set/--overlay",
    )
    args = parser.parse_args()

    if args.validate:
        with open(args.validate, encoding="utf-8") as f:
            data = json.load(f)
        result = validate_integrity(data)
        print(json.dumps(result, indent=2))
        sys.exit(0 if result["ok"] else 1)

    out_path = os.path.join(args.out_dir, args.out_file)
    if args.from_existing and os.path.exists(out_path):
        gates = load_existing_gates(out_path)
    else:
        gates = [dict(g) for g in DEFAULT_GATES]

    if args.overlay:
        apply_overlay(gates, args.overlay)
    if args.set:
        apply_set_args(gates, args.set)

    os.makedirs(args.out_dir, exist_ok=True)
    payload = build_payload(gates)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)
        f.write("\n")

    # Re-validate written file
    with open(out_path, encoding="utf-8") as f:
        written = json.load(f)
    check = validate_integrity(written)
    print(out_path)
    print(json.dumps(payload["summary_by_section"], indent=2))
    print(f"integrity_sha256: {payload['integrity_sha256']}")
    print(f"integrity_ok: {check['ok']}")
    if not check["ok"]:
        sys.exit(1)


if __name__ == "__main__":
    main()
