import pytest
import pandas as pd
from src.pipeline_engine import mock_run_citadel_secured_engine # Adjusted for structural testing

def test_mock_citadel_engine_success():
    """Verifies successful simulation of the Citadel secure hashing indicators."""
    test_data = [pd.Series({"model_id": "GAGE_03378500", "geometry_file_path": "/mnt/test.json", "projection_epsg": 4326})]
    
    iterator = iter(test_data)
    results_iterator = mock_run_citadel_secured_engine(iterator)
    
    for df in results_iterator:
        assert df.iloc[0]["status"] == "SUCCESS"
        assert "sha256_mock_signature" in df.iloc[0]["citadel_hash_signature"]
        assert df.iloc[0]["execution_latency_sec"] == 0.189

def test_mock_citadel_engine_fault():
    """Verifies failure handling when model metadata is missing."""
    test_data = [pd.Series({"model_id": None})]
    
    iterator = iter(test_data)
    results_iterator = mock_run_citadel_secured_engine(iterator)
    
    for df in results_iterator:
        assert df.iloc[0]["status"] == "CITADEL_SECURE_FAULT"
        assert df.iloc[0]["citadel_hash_signature"] == "UNSIGNED_ERROR"
