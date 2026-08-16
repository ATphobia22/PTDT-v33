# PTDT v33 Engine Integration Matrix

## Purpose

This document records the reviewed external engine/networking repositories and the integration boundary used by PTDT. External repositories are treated as upstream dependencies or vendored adapters rather than blindly merged into the PTDT application tree.

## Reviewed repositories

| Repository | Role | Integration decision | Primary risk |
|---|---|---|---|
| `ATphobia22/unity-mcp` | Unity Editor MCP automation | Adapter/package boundary | Fork of CoplayDev Unity MCP; default branch is `beta`; upstream changes must be tracked explicitly |
| `ATphobia22/unity-gaming-services-cli` | Unity Gaming Services CLI | Tooling/CI integration only | Repository README states source may not build because of internal dependencies |
| `ATphobia22/unity-realtime-networking-client` | Unity realtime transport client | Client adapter boundary | README is absent on default branch; implementation requires source-level inspection before adoption |
| `ATphobia22/MagicOnion` | .NET/Unity RPC and realtime streaming | Preferred .NET realtime transport candidate | Large upstream tree; server requires .NET 8+ and Unity support is version-sensitive |
| `20tab/UnrealEnginePython` | Unreal Python embedding | Legacy compatibility adapter only | Project is explicitly on hold and targets UE4-era versions; not suitable as the primary UE5/UE5.6 scripting layer |
| `ATphobia22/unrealcv` | Unreal CV/telemetry bridge | UE visualization/AI capture adapter | Default branch is `5.2`; current README advertises UE5.6 support, so version-specific validation is required |
| `ATphobia22/Unreal.js` | V8 JavaScript in Unreal | Optional legacy plugin boundary | README documents support through UE5.1 and older marketplace versions; do not make it a core UE5.6 dependency |

## PTDT integration rules

1. **Do not copy complete third-party repositories into PTDT.** Keep external code isolated behind explicit adapter/package boundaries.
2. **Do not replace authoritative PTDT hydraulic, spatial, or evidence contracts with engine-specific models.** Engine integrations consume PTDT contracts.
3. **Unity MCP is an authoring/automation integration, not an authority source.** It must never mutate evidence records without an auditable PTDT command boundary.
4. **MagicOnion is the preferred C# realtime abstraction where Unity/.NET streaming is required.** Existing protobuf/gRPC contracts remain authoritative for cross-language services.
5. **UnrealCV is the preferred Unreal visualization/telemetry capture boundary.** Python and JavaScript Unreal plugins remain optional compatibility layers.
6. **20tab/UnrealEnginePython is quarantined as legacy UE4 tooling.** It must not be introduced into a UE5.6 production runtime without a dedicated port and security review.
7. **Unreal.js is quarantined as an optional legacy scripting layer.** It must not become a hard runtime dependency for PTDT.
8. **All external dependencies require license, provenance, version, and security records before production release.**
9. **No claims of sub-2 ms transport latency or TLS 1.3 behavior are accepted without benchmark evidence from the deployed topology.**
10. **Cryptographic evidence seals must use a standards-compliant canonicalization implementation; ordinary `json.dumps(sort_keys=True)` is not by itself an RFC 8785 implementation.**

## Current PTDT branch state

The PTDT `main` branch already contains the previously merged HEC-RAS authority lock, HEC-RAS/WebGPU work, Tristate engine refactor, and CI validation fixes. The remaining feature branches were compared against `main`; branches that are already fully behind `main` require no merge.

## Validation gate

Before promoting an engine adapter to production:

- build and unit tests pass;
- static analysis passes;
- dependency/license audit passes;
- WebGPU shader validation passes where applicable;
- Unity/Unreal project compilation passes for the targeted engine version;
- transport integration tests pass;
- evidence/provenance invariants remain unchanged;
- no secrets, generated binaries, certificates, or cloud credentials enter Git history.
