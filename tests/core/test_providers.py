from core.providers import ProviderRegistry


def test_absent_credentials_select_local_providers() -> None:
    registry = ProviderRegistry.from_environment({})

    assert registry.require_available("maps").implementation == "maplibre"
    assert registry.require_available("raster").implementation == "cog-ogc"
    assert registry.require_available("object_storage").implementation == "minio-compatible"
    assert registry.require_available("realtime").implementation == "grpc-websocket"
    assert registry.require_available("inference").implementation == "llama.cpp"


def test_optional_provider_requires_explicit_credentials() -> None:
    registry = ProviderRegistry.from_environment({"PTDT_MAP_PROVIDER": "commercial"})

    assert registry.require_available("maps").implementation == "maplibre"
    assert registry.capability("maps").requires_credentials is False
