# Next suggestions — applied

1. **Permanent MapComponent Bonebank wire** — CI applies `scripts/apply_mapcomponent_bonebank_wire.py` and **commits** the result on `main` (GITHUB_TOKEN).
2. **npm scripts** — `bootstrap`, `wire:map`, `verify`, `smoke`.
3. **Version** — `0.33.1`.

Local one-liner:

```bash
git pull --ff-only && npm run wire:map && npm run verify && npm run dev
```
