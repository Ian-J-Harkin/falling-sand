import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const rootDir = resolve(import.meta.dirname, "..");
const sourceDir = resolve(rootDir, "apps", "mobile");
const targetDir = resolve(rootDir, "dist", "mobile");

if (!existsSync(sourceDir)) {
  throw new Error(`Mobile app source not found: ${sourceDir}`);
}

rmSync(targetDir, { recursive: true, force: true });
mkdirSync(targetDir, { recursive: true });
cpSync(sourceDir, targetDir, { recursive: true });

console.log(`Synced mobile app to ${targetDir}`);