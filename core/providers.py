from __future__ import annotations

from dataclasses import dataclass
from os import environ
from typing import Mapping


class ProviderConfigurationError(RuntimeError):
    """Raised when a provider cannot satisfy the sovereign runtime contract."""


@dataclass(frozen=True, slots=True)
class ProviderCapability:
    name: str
    implementation: str
    requires_credentials: bool = False
    enabled: bool = True


_DEFAULTS: dict[str, ProviderCapability] = {
    "maps": ProviderCapability("maps", "maplibre"),
    "raster": ProviderCapability("raster", "cog-ogc"),
    "object_storage": ProviderCapability("object_storage", "minio-compatible"),
    "realtime": ProviderCapability("realtime", "grpc-websocket"),
    "inference": ProviderCapability("inference", "llama.cpp"),
    "telemetry": ProviderCapability("telemetry", "local-otlp"),
}


class ProviderRegistry:
    """Deterministic provider selection with OSS implementations as the floor."""

    def __init__(self, capabilities: Mapping[str, ProviderCapability]) -> None:
        self._capabilities = dict(capabilities)

    @classmethod
    def from_environment(cls, env: Mapping[str, str] | None = None) -> "ProviderRegistry":
        values = dict(environ if env is None else env)
        capabilities = dict(_DEFAULTS)

        requested = {
            "maps": values.get("PTDT_MAP_PROVIDER", "local"),
            "raster": values.get("PTDT_RASTER_PROVIDER", "local"),
            "object_storage": values.get("PTDT_OBJECT_STORAGE_PROVIDER", "local"),
            "realtime": values.get("PTDT_REALTIME_PROVIDER", "local"),
            "inference": values.get("PTDT_INFERENCE_PROVIDER", "local"),
            "telemetry": values.get("PTDT_TELEMETRY_PROVIDER", "local"),
        }

        for name, provider in requested.items():
            if provider in {"", "local", "oss", "self-hosted"}:
                continue
            # Commercial/hosted providers are optional adapters. They never
            # become the core implementation without explicit credentials.
            credentials = values.get(f"PTDT_{name.upper()}_API_KEY", "").strip()
            if credentials:
                capabilities[name] = ProviderCapability(
                    name=name,
                    implementation=provider,
                    requires_credentials=True,
                    enabled=True,
                )

        return cls(capabilities)

    def capability(self, name: str) -> ProviderCapability:
        try:
            return self._capabilities[name]
        except KeyError as exc:
            raise ProviderConfigurationError(f"unknown provider capability: {name}") from exc

    def require_available(self, name: str) -> ProviderCapability:
        capability = self.capability(name)
        if not capability.enabled:
            raise ProviderConfigurationError(f"provider capability disabled: {name}")
        return capability
