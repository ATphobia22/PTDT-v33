# Archived / sanitized content notes

## src/data.ts (2026-08-01)

`CORE_CODE_FILES[].content` previously contained inline citation-style markers
such as `[4, 5]`, `[7-9]`, `[10-12]` that were leftover from document assembly.
Those markers were **not** valid in the embedded shell/Python/Swift/Verilog
samples and cluttered the UI when code was displayed.

They were removed. The sample snippets themselves are retained as illustrative
catalog entries (via `archivePath`) for the digital-twin layer browser; they
are not executed by the runtime.

No functional application logic was deleted.
