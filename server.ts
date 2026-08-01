/**
 * Bootstrap — assembles full legacy server-main (all routes) + GIS wire, then starts.
 * Government users: no API keys required for core GIS / twin / offline FEMA-USGS.
 */
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
try {
  execSync("node scripts/assemble-server-main.mjs --force", {
    cwd: __dirname,
    stdio: "inherit",
  });
} catch (e) {
  console.warn("[bootstrap] assemble skipped or failed — using existing src/server-main.ts", e);
}

await import("./src/server-main.ts");
