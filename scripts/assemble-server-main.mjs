#!/usr/bin/env node
/**
 * Restores full legacy server routes into src/server-main.ts
 * Priority:
 *   1) git show of last-known-good commit (b61d7c8) + GIS wire patch
 *   2) zlib+base64 parts under scripts/server-main-b64/ (optional)
 *   3) leave existing file if already full
 */
import fs from "fs";
import path from "path";
import zlib from "zlib";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const out = path.join(root, "src", "server-main.ts");
const force = process.argv.includes("--force");
const GOOD = "b61d7c819ed9a09fee74dd1cd157225d4aaad38e";

function wireGis(src) {
  if (src.includes("registerGisRoutes")) return src;
  const imp =
    'import { OpenMICouplingEngine, ISO23247CompliantTwin, validateAndAssimilate, OpenMITimeHandler } from "./src/services/compliance";';
  const imp2 =
    'import { OpenMICouplingEngine, ISO23247CompliantTwin, validateAndAssimilate, OpenMITimeHandler } from "./services/compliance";';
  if (src.includes(imp)) {
    src = src.replace(
      imp,
      imp + '\nimport { registerGisRoutes } from "./src/server-gis-routes";'
    );
  } else if (src.includes(imp2)) {
    src = src.replace(
      imp2,
      imp2 + '\nimport { registerGisRoutes } from "./server-gis-routes";'
    );
  } else if (!src.includes("registerGisRoutes")) {
    src =
      'import { registerGisRoutes } from "./server-gis-routes";\n' + src;
  }
  if (!src.includes("registerGisRoutes(app)")) {
    src = src.replace(
      "  registerAIRoutes(app, getGenAI);",
      "  // NCAT + IndianaMap parcels/BAFM + buildings + site (zero-key)\n  registerGisRoutes(app);\n\n  registerAIRoutes(app, getGenAI);"
    );
  }
  // Normalize imports for src/server-main.ts location
  src = src
    .replaceAll('from "./src/server-ai"', 'from "./server-ai"')
    .replaceAll('from "./src/schemas/ptdt"', 'from "./schemas/ptdt"')
    .replaceAll('from "./src/services/compliance"', 'from "./services/compliance"')
    .replaceAll('from "./src/server-gis-routes"', 'from "./server-gis-routes"')
    .replaceAll('from "./src/', 'from "./');
  return src;
}

function tryGitShow() {
  try {
    const raw = execSync(`git show ${GOOD}:server.ts`, {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 5 * 1024 * 1024,
    });
    if (raw && raw.length > 20000 && raw.includes("startServer")) {
      return wireGis(raw);
    }
  } catch (e) {
    console.warn("[assemble] git show failed:", e.message || e);
  }
  return null;
}

function tryZlibParts() {
  const partsDir = path.join(__dirname, "server-main-b64");
  if (!fs.existsSync(partsDir)) return null;
  try {
    const files = fs
      .readdirSync(partsDir)
      .filter((f) => f.startsWith("part") && f.endsWith(".txt"))
      .sort(
        (a, b) =>
          parseInt(a.replace(/\D/g, ""), 10) -
          parseInt(b.replace(/\D/g, ""), 10)
      );
    if (files.length < 2) return null;
    const b64 = files
      .map((f) => fs.readFileSync(path.join(partsDir, f), "utf8"))
      .join("");
    const inflated = zlib.inflateSync(Buffer.from(b64, "base64")).toString("utf8");
    if (inflated.length > 20000) return wireGis(inflated);
  } catch (e) {
    console.warn("[assemble] zlib parts failed:", e.message || e);
  }
  return null;
}

if (fs.existsSync(out) && !force) {
  const sz = fs.statSync(out).size;
  if (sz > 20000 && fs.readFileSync(out, "utf8").includes("registerGisRoutes")) {
    console.log("[assemble] server-main.ts already full (" + sz + " bytes)");
    process.exit(0);
  }
}

const recovered = tryGitShow() || tryZlibParts();
if (!recovered) {
  console.error(
    "[assemble] could not recover legacy server.ts — ensure git history includes " + GOOD
  );
  process.exit(1);
}

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, recovered);
console.log(
  "[assemble] wrote", out, fs.statSync(out).size, "bytes (legacy routes + GIS wire)"
);
