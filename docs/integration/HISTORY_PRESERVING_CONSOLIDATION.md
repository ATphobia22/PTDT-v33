# PTDT History-Preserving Consolidation

PTDT-v33 is the canonical `main` repository. The three engineering
repositories are imported as Git subtrees under `integrations/history/`,
preserving their source commit graphs and provenance.

PTDT-v33 feature branches are merged into `main` before subtree import.
Conflict resolution is deterministic and feature-branch biased; CI is
the acceptance gate for semantic correctness.

Unity and Unreal are adapter boundaries rather than core dependencies.
The corrected v35 evidence core uses RFC 8785 JCS and explicitly
distinguishes NAVD88 orthometric heights from EPSG:4978 ellipsoidal height.
