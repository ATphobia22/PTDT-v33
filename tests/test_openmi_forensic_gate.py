from backend.services.openmi_forensic_gate import OpenMIForensicGate


def test_divergence_triggers_fail_closed():
    gate = OpenMIForensicGate(tolerance_percent=0.1)
    assert gate.validate_flux_exchange(100.0, 99.95) is True
    assert gate.validate_flux_exchange(100.0, 105.0) is False
    assert gate.system_locked is True
    assert gate.validate_flux_exchange(100.0, 100.0) is False


def test_lock_records_event():
    gate = OpenMIForensicGate(tolerance_percent=0.1)
    gate.validate_flux_exchange(500.0, 1000.0)
    assert len(gate.lock_events) == 1
