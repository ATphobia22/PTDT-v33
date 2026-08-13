from backend.services.hecras_unstructured_coupler import seal_payload, verify_seal


def test_seal_excludes_seal_field():
    p = {"sequence": 1, "wse_1d_mm": [1, 2, 3]}
    p["state_cryptographic_seal"] = seal_payload(p)
    assert verify_seal(p)
    p["sequence"] = 2
    assert not verify_seal(p)


def test_hash_independent_of_seal_value():
    base = {"a": 1}
    assert seal_payload({**base, "state_cryptographic_seal": "aaa"}) == seal_payload(
        {**base, "state_cryptographic_seal": "bbb"}
    )
