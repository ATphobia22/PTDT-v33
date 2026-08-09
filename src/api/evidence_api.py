from __future__ import annotations

from typing import Any, Dict

from fastapi import FastAPI, HTTPException

from ..evidence.evidence_graph import EvidenceGraph

app = FastAPI(title="Tri-County Evidence Graph", version="1.0.0")
graph = EvidenceGraph()


@app.get("/api/v1/evidence/{provenance_id}")
async def get_evidence(provenance_id: str) -> Dict[str, Any]:
    try:
        result = graph.selection(provenance_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Unknown provenance ID") from exc
    return result


@app.get("/api/v1/evidence/manifest")
async def get_manifest() -> Dict[str, Any]:
    return graph.manifest()
