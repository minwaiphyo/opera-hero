import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { createServer } from "vite";

const { inputs, output } = parseArguments(process.argv.slice(2));
const server = await createServer({ appType: "custom", logLevel: "error", server: { middlewareMode: true } });
try {
  const { parseVisionReplayFixture } = await server.ssrLoadModule("/src/vision/replay/visionReplayValidation.ts");
  const { extractOrchidFingerTrajectory } = await server.ssrLoadModule("/src/domain/gestures/features/orchidFingerTrajectory.ts");
  const { buildOrchidFingerReferenceEnvelope } = await server.ssrLoadModule("/src/domain/gestures/scoring/orchidFingerEnvelope.ts");
  const fixtures = await Promise.all(inputs.map(async (path) => parseVisionReplayFixture(JSON.parse(await readFile(path, "utf8")))));
  const trajectories = fixtures.map(extractOrchidFingerTrajectory);
  const envelope = buildOrchidFingerReferenceEnvelope(trajectories);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(envelope, (_key, value) => typeof value === "number" ? Number(value.toFixed(6)) : value, 2)}\n`, "utf8");
  console.log(`Wrote ${envelope.progressPoints} Orchid Finger points to ${output}.`);
  for (const trajectory of trajectories) {
    const ratio = (count) => trajectory.totalFrames ? `${(count / trajectory.totalFrames * 100).toFixed(1)}%` : "0.0%";
    console.log(`  ${trajectory.fixtureId}: pose ${ratio(trajectory.usablePoseFrames)}, at least one hand ${ratio(trajectory.usableHandFrames)}`);
  }
} finally { await server.close(); }

function parseArguments(values) {
  const inputs = []; let output = null;
  for (let index = 0; index < values.length; index += 2) {
    const key = values[index]; const value = values[index + 1];
    if (!key?.startsWith("--") || !value) throw new Error("Expected repeated --input paths and one --output path.");
    if (key === "--input") inputs.push(resolve(value)); else if (key === "--output") output = resolve(value); else throw new Error(`Unknown argument: ${key}`);
  }
  if (inputs.length < 2) throw new Error("At least two --input fixtures are required.");
  if (!output) throw new Error("Missing required --output path.");
  return { inputs, output };
}
