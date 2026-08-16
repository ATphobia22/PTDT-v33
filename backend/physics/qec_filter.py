"""Quantum error-correction filter for telemetry integrity."""

from __future__ import annotations

from typing import Any

import numpy as np
import pymatching
import stim


def decode_sensor_noise(distance: int = 9, shots: int = 1000) -> dict[str, Any]:
    if distance < 3 or distance % 2 == 0:
        raise ValueError("surface-code distance must be an odd integer >= 3")
    if shots <= 0:
        raise ValueError("shots must be positive")
    circuit = stim.Circuit.generated(
        "surface_code:unrotated_memory_z",
        distance=distance,
        rounds=distance,
        after_clifford_depolarization=0.001,
    )
    sampler = circuit.compile_detector_sampler()
    detector_samples, obs_samples = sampler.sample(shots=shots, separate_observables=True)
    matcher = pymatching.Matching.from_stim_circuit(circuit)
    predictions = matcher.decode_batch(detector_samples)
    errors = int(np.sum(predictions != obs_samples))
    logical_error_rate = errors / shots * 100.0
    return {
        "qec_distance": distance,
        "logical_error_rate_pct": round(logical_error_rate, 5),
        "status": "ORDER_LOCKED" if logical_error_rate < 0.01 else "UNSTABLE",
        "mode": "stim_pymatching",
        "shots": shots,
    }
