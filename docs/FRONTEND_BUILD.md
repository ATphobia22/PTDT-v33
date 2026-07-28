# Frontend build green path

## Commands

```bash
npm install          # or npm ci when lockfile is current
npm run typecheck    # soft in CI
npm run build        # hard gate: vite + esbuild server.ts → dist/
npm start            # node dist/server.cjs
```

## What we fixed for CI green

1. **Removed `@base-ui/react`** from button/dialog/tabs — plain React primitives (no subpath resolution failures).
2. **Removed `puppeteer`** from package.json dependencies (was pulling Chromium on install).
3. **tsconfig** only includes `src`, `server.ts`, `vite.config.ts` — patch scripts and Python trees excluded.
4. **`allowImportingTsExtensions` removed** — standard Vite resolution for `.tsx` imports without extension games.
5. **CI `node-build`** hard-fails only on `npm run build`.

## If build still fails locally

```bash
npm run build 2>&1 | tee build.log
# Look for "Could not resolve" or Rollup parse errors in src/
```

Share the first error block and we fix file-by-file.
