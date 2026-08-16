from __future__ import annotations

import hashlib
import json
import tarfile
from pathlib import Path
from tempfile import TemporaryDirectory
from typing import Any

import rfc8785
from reportlab.lib.pagesizes import letter
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet


class FemaAppealPackager:
    """Generate an engineering evidence dossier; submission remains human/agency controlled."""

    def __init__(self, workspace_root: str = "build") -> None:
        self.root = Path(workspace_root)
        self.root.mkdir(parents=True, exist_ok=True)

    @staticmethod
    def _canonical_sha256(value: Any) -> str:
        return hashlib.sha256(rfc8785.dumps(value)).hexdigest()

    def _write_pdf(self, path: Path, manifest: dict[str, Any]) -> None:
        metrics = manifest["compliance_metrics"]
        doc = SimpleDocTemplate(str(path), pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
        styles = getSampleStyleSheet()
        body = styles["BodyText"]
        rows = [
            ["Building", str(metrics["building_id"])],
            ["LAG NAVD88 ft", str(metrics["lowest_adjacent_grade_ft"])],
            ["FFE NAVD88 ft", str(metrics["first_floor_elevation_ft"])],
            ["WSE NAVD88 ft", str(metrics["current_water_surface_ft"])],
            ["Freeboard ft", str(metrics["freeboard_ft"])],
            ["Threat status", str(metrics["threat_status"])],
            ["Manifest seal", str(manifest["manifest_metadata"]["cryptographic_manifest_seal"])],
        ]
        story = [Paragraph("PTDT Engineering Hazard-Mitigation Evidence Dossier", styles["Title"]), Spacer(1, 12)]
        story.append(Table(rows, colWidths=[150, 360], style=TableStyle([
            ("GRID", (0, 0), (-1, -1), 0.5, "#64748b"),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ])))
        story.extend([Spacer(1, 12), Paragraph(
            "This package is an engineering evidence artifact. It does not constitute a FEMA determination, legal opinion, or automatic federal submission.",
            body,
        )])
        doc.build(story)

    def compile(self, clearance_manifest: dict[str, Any]) -> Path | None:
        metrics = clearance_manifest.get("compliance_metrics", {})
        if metrics.get("policy_compliance_pass", True):
            return None

        building_id = str(metrics.get("building_id", "UNKNOWN_NODE"))
        safe_id = "".join(ch if ch.isalnum() or ch in "-_" else "_" for ch in building_id)
        archive_path = self.root / f"FEMA_HMA_APPEAL_DOSSIER_{safe_id}.tar.gz"

        with TemporaryDirectory(prefix="ptdt-appeal-") as temp_dir:
            staging = Path(temp_dir)
            manifest_path = staging / "structural_clearance_manifest.json"
            pdf_path = staging / "engineering_evidence_brief.pdf"
            package_manifest_path = staging / "package_manifest.json"
            manifest_path.write_bytes(rfc8785.dumps(clearance_manifest))
            self._write_pdf(pdf_path, clearance_manifest)
            package_manifest = {
                "schema": "ptdt.fema.dossier.v1",
                "components": {
                    manifest_path.name: hashlib.sha256(manifest_path.read_bytes()).hexdigest(),
                    pdf_path.name: hashlib.sha256(pdf_path.read_bytes()).hexdigest(),
                },
            }
            package_manifest_path.write_bytes(rfc8785.dumps(package_manifest))
            with tarfile.open(archive_path, "w:gz") as archive:
                for path in (manifest_path, pdf_path, package_manifest_path):
                    archive.add(path, arcname=path.name)
        return archive_path
