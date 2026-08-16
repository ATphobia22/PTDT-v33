# PTDT Keyless Provider Matrix

## Core defaults

| Capability | PTDT default | Credential required | Owned repository candidates |
|---|---|---:|---|
| Web map | MapLibre | No | `ATphobia22/maplibre-gl-js`, `ATphobia22/maplibre-compose`, `ATphobia22/maplibre-three-plugin` |
| Raster | COG/OGC | No | `ATphobia22/maplibre-cog-protocol`, `ATphobia22/maplibre-gl-usgs-lidar` |
| Tiles | PMTiles/self-hosted | No | `ATphobia22/tileserver-gl` |
| Spatial processing | PROJ/GDAL/PostGIS-compatible | No | PTDT core integration |
| Object storage | MinIO/S3-compatible | No | Self-hosted deployment interface |
| Realtime | gRPC/WebSocket | No | `ATphobia22/MagicOnion`, `ATphobia22/unity-realtime-networking-client` |
| Unity automation | Local editor adapter | No | `ATphobia22/unity-mcp` |
| Unreal tooling | Native C++ boundary | No | `ATphobia22/unrealcv`, `ATphobia22/UnrealEnginePython`, `ATphobia22/Unreal.js` |
| AI inference | llama.cpp/local runtime | No | `ATphobia22/llama.cpp`, `ATphobia22/LiteRT-LM`, `ATphobia22/SwiftLM`, `ATphobia22/web-llm` |
| Scene interchange | OpenUSD | No | `ATphobia22/OpenUSD`, `ATphobia22/UniversalSceneDescription`, `ATphobia22/openusd-mcp` |

## Integration policy

1. A repository is a capability source, not an automatic subtree merge target.
2. Before importing source code, verify license compatibility, dependency closure, runtime compatibility, security posture, and whether the capability duplicates an existing PTDT implementation.
3. Authoritative scientific and regulatory sources remain external provenance inputs. Keyless mode removes platform/account lock-in; it does not fabricate or replace authoritative source data.
4. Optional commercial adapters may exist, but they must be isolated behind interfaces and must never prevent PTDT core startup, validation, or deterministic tests.
5. Engine adapters consume validated `ptdt.engine.frame.v2` / `SceneState` payloads and cannot mutate authoritative evidence.
