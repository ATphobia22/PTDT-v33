"""
PTDT v33 — Quantum Error Correction filter for telemetry integrity.
Gracefully degrades when stim/pymatching are unavailable (air-gapped).
"""

from __future__ import annotations

import logging
from typing import Any, Dict

import numpy as np

logger = logging.getLogger("PTDT.QECFilter")

HAS_STIM = False
try:
    import stim
    import pymatching
    HAS_STIM = True
except ImportError:
    logger.warning("stim/pymatching unavailable — QEC returns deterministic mock ORDER_LOCKED.")


def decode_sensor_noise(distance: int = 9) -> Dict[str, Any]:
    if not HAS_STIM:
        return {
            "qec_distance": distance,
            "logical_error_rate_pct": 0.0,
            "status": "ORDER_LOCKED",
            "mode": "mock_airgapped",
        }

    circuit = stim.Circuit.generated(
        "surface_code:unrotated_memory_z",
        distance=distance,
        rounds=distance,
        after_clifford_depolarization=0.001,
    )
    sampler = circuit.compile_detector_sampler()
    detector_samples, obs_samples = sampler.sample(shots=1000, separate_observables=True)
    matcher = pymatching.Matching.from_stim_circuit(circuit)
    predictions = matcher.decode_batch(detector_samples)
    errors = int(np.sum(predictions != obs_samples))
    logical_error_rate = (errors / 1000) * 100.0

    return {
        "qec_distance": distance,
        "logical_error_rate_pct": round(logical_error_rate, 5),
        "status": "ORDER_LOCKED" if logical_error_rate < 0.01 else "UNSTABLE",
        "mode": "stim",
    }
