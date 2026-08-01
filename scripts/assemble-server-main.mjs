#!/usr/bin/env node
/**
 * Restores full legacy server routes into src/server-main.ts
 * Priority:
 *   1) git show of last-known-good commit (b61d7c8) + GIS wire patch
 *   2) raw.githubusercontent.com fetch of that commit (no local history needed)
 *   3) zlib+base64 parts under scripts/server-main-b64/ (optional)
 *   4) leave existing full file if already recovered
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
const RAW_URL = `https://raw.githubusercontent.com/ATphobia22/Tri-State-Family-Engineering-System-/${GOOD}/server.ts`;

function normalizeImports(src) {
  return src
    .replaceAll('from "./src/server-ai"', 'from "./server-ai"')
    .replaceAll('from "./src/schemas/ptdt"', 'from "./schemas/ptdt"')
    .replaceAll('from "./src/services/compliance"', 'from "./services/compliance"')
    .replaceAll('from "./src/server-gis-routes"', 'from "./server-gis-routes"')
    .replaceAll('from "./src/', 'from "./');
}

function wireGis(src) {
  src = normalizeImports(src);

  if (!src.includes("registerGisRoutes")) {
    const markers = [
      'from "./services/compliance";',
      'from "./server-ai";',
    ];
    let inserted = false;
    for (const m of markers) {
      if (src.includes(m)) {
        src = src.replace(
          m,
          m + '\nimport { registerGisRoutes } from "./server-gis-routes";'
        );
        inserted = true;
        break;
      }
    }
    if (!inserted) {
      src = 'import { registerGisRoutes } from "./server-gis-routes";\n' + src;
    }
  }

  if (!src.includes("registerGisRoutes(app)")) {
    if (src.includes("registerAIRoutes(app, getGenAI)")) {
      src = src.replace(
        "  registerAIRoutes(app, getGenAI);",
        "  // NCAT + IndianaMap parcels/BAFM + buildings + site (zero-key)\n  registerGisRoutes(app);\n\n  registerAIRoutes(app, getGenAI);"
      );
    } else if (src.includes("const app = express()")) {
      src = src.replace(
        "const app = express();",
        "const app = express();\n  // GIS routes registered after json middleware below"
      );
    }
  }

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
      console.log("[assemble] recovered via git show", GOOD);
      return wireGis(raw);
    }
  } catch (e) {
    console.warn("[assemble] git show failed:", e.message || e);
  }
  return null;
}

async function tryRawFetch() {
  try {
    const res = await fetch(RAW_URL, {
      headers: { "User-Agent": "ptdt-assemble/1.0" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const raw = await res.text();
    if (raw && raw.length > 20000 && raw.includes("startServer")) {
      console.log("[assemble] recovered via raw.githubusercontent.com");
      return wireGis(raw);
    }
  } catch (e) {
    console.warn("[assemble] raw fetch failed:", e.message || e);
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
    if (inflated.length > 20000) {
      console.log("[assemble] recovered via zlib parts");
      return wireGis(inflated);
    }
  } catch (e) {
    console.warn("[assemble] zlib parts failed:", e.message || e);
  }
  return null;
}

async function main() {
  if (fs.existsSync(out) && !force) {
    const body = fs.readFileSync(out, "utf8");
    const sz = body.length;
    if (
      sz > 20000 &&
      body.includes("registerGisRoutes") &&
      body.includes("/api/archimedes/generate")
    ) {
      console.log("[assemble] server-main.ts already full (" + sz + " bytes)");
      process.exit(0);
    }
  }

  const recovered =
    tryGitShow() || (await tryRawFetch()) || tryZlibParts();

  if (!recovered) {
    console.error(
      "[assemble] could not recover legacy server.ts — need git history, network, or zlib parts for " +
        GOOD
    );
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, recovered);
  console.log(
    "[assemble] wrote", out, fs.statSync(out).size, "bytes (legacy routes + GIS wire)"
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
