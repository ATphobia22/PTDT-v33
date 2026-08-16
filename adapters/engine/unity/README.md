# PTDT Unity adapter

The Unity boundary is transport-agnostic. A Unity-side client should deserialize the canonical `ptdt.engine.frame.v1` message, validate the SHA-256 evidence field, and publish the frame into an `IEngineFrameSink` implementation.

The adapter deliberately contains no flood, datum, or regulatory policy. Those remain PTDT-core responsibilities.
