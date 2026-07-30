// Copies the MediaPipe WASM runtime out of node_modules and into public/ so
// Vite serves it locally. Written in Node rather than as a shell one-liner
// because CI runs on Windows, where `mkdir -p` and `cp` do not exist.
import { cpSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(
  projectRoot,
  "node_modules",
  "@mediapipe",
  "tasks-vision",
  "wasm",
);
const destination = join(projectRoot, "public", "mediapipe", "wasm");

if (!existsSync(source)) {
  console.error(
    `Cannot find the MediaPipe WASM runtime at ${source}.\n` +
      `Run "npm install" before building.`,
  );
  process.exit(1);
}

cpSync(source, destination, { recursive: true });
console.log(`Copied MediaPipe WASM runtime to ${destination}`);
