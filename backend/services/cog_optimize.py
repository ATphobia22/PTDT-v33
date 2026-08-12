"""
COG / OptimizeRasters integration helper.
Converts site DEM/ortho to Cloud-Optimized GeoTIFF for MapLibre raster-dem + WebGPU.
Requires GDAL on PATH. Offline-first: operates only on local files.
"""
from __future__ import annotations

import hashlib
import logging
import subprocess
from pathlib import Path
from typing import Dict, List, Optional

logger = logging.getLogger("PTDT.COGOptimize")

DEFAULT_OUT = Path("data/cog")


def gdal_available() -> bool:
    try:
        r = subprocess.run(
            ["gdal_translate", "--version"],
            capture_output=True,
            text=True,
            timeout=10,
        )
        return r.returncode == 0
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False


def to_cog(
    src: Path,
    dst: Optional[Path] = None,
    compress: str = "DEFLATE",
    blocksize: int = 512,
    overview_resampling: str = "AVERAGE",
) -> Dict[str, str]:
    """
    Convert any GDAL-readable raster to COG.
    Equivalent intent to Esri OptimizeRasters (tif_cog mode).
    """
    src = Path(src)
    if not src.exists():
        raise FileNotFoundError(src)
    if dst is None:
        DEFAULT_OUT.mkdir(parents=True, exist_ok=True)
        dst = DEFAULT_OUT / f"{src.stem}_cog.tif"

    if not gdal_available():
        logger.error("gdal_translate not on PATH — cannot produce COG")
        return {"status": "GDAL_MISSING", "src": str(src)}

    cmd = [
        "gdal_translate",
        str(src),
        str(dst),
        "-of", "COG",
        "-co", f"COMPRESS={compress}",
        "-co", f"BLOCKSIZE={blocksize}",
        "-co", f"OVERVIEW_RESAMPLING={overview_resampling}",
        "-co", "NUM_THREADS=ALL_CPUS",
        "-co", "BIGTIFF=IF_SAFER",
    ]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
    if r.returncode != 0:
        logger.error("gdal_translate failed: %s", r.stderr)
        return {"status": "FAILED", "stderr": r.stderr[:500], "src": str(src)}

    digest = hashlib.sha256(dst.read_bytes()[: 1024 * 256]).hexdigest()
    return {
        "status": "OK",
        "src": str(src),
        "dst": str(dst),
        "sha256_prefix": digest[:16],
        "size_bytes": str(dst.stat().st_size),
        "authority": "presentation-only",
    }


def batch_site_cogs(
    dem: Optional[Path] = None,
    ortho: Optional[Path] = None,
    flood: Optional[Path] = None,
) -> List[Dict[str, str]]:
    results = []
    for label, p in (("dem", dem), ("ortho", ortho), ("flood", flood)):
        if p and Path(p).exists():
            results.append(to_cog(Path(p), DEFAULT_OUT / f"bonebank_{label}_navd88.tif"))
    return results
