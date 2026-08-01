#!/usr/bin/env node
/**
 * Assembles src/server-main.ts from zlib+base64 parts (full legacy routes + GIS wire).
 */
import fs from "fs";
import path from "path";
import zlib from "zlib";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const partsDir = path.join(__dirname, "server-main-b64");
const out = path.join(__dirname, "..", "src", "server-main.ts");
const force = process.argv.includes("--force");

if (fs.existsSync(out) && !force) {
  const sz = fs.statSync(out).size;
  if (sz > 20000) {
    console.log("[assemble] server-main.ts already full (" + sz + " bytes)");
    process.exit(0);
  }
}

const files = fs
  .readdirSync(partsDir)
  .filter((f) => f.startsWith("part") && f.endsWith(".txt"))
  .sort((a, b) => parseInt(a.replace(/\D/g, ""), 10) - parseInt(b.replace(/\D/g, ""), 10));

const b64 = files.map((f) => fs.readFileSync(path.join(partsDir, f), "utf8")).join("");
const inflated = zlib.inflateSync(Buffer.from(b64, "base64"));
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, inflated);
console.log("[assemble] wrote", out, fs.statSync(out).size, "bytes (zlib inflated)");
