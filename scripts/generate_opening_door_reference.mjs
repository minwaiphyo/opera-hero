import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { createServer } from "vite";

const { inputs, output } = parseArguments(process.argv.slice(2));
const server = await createServer({
  appType: "custom",
  logLevel: "error",
  server: { middlewareMode: true },
});

try {
  const { parseVisionReplayFixture } = await server.ssrLoadModule(
    "/src/vision/replay/visionReplayValidation.ts",
  );
  const { extractOpeningDoorTrajectory } = await server.ssrLoadModule(
    "/src/domain/gestures/features/openingDoorTrajectory.ts",
  );
  const { buildOpeningDoorReferenceEnvelope } = await server.ssrLoadModule(
    "/src/domain/gestures/scoring/openingDoorEnvelope.ts",
  );
  const fixtures = await Promise.all(
    inputs.map(async (path) =>
      parseVisionReplayFixture(JSON.parse(await readFile(path, "utf8"))),
    ),
  );
  const trajectories = fixtures.map(extractOpeningDoorTrajectory);
  const envelope = buildOpeningDoorReferenceEnvelope(trajectories);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, serialize(envelope), "utf8");

  console.log(`Wrote ${envelope.progressPoints} Opening Door points to ${output}.`);
  for (const trajectory of trajectories) {
    const poseCoverage = trajectory.totalFrames > 0
      ? trajectory.usablePoseFrames / trajectory.totalFrames
      : 0;
    const handCoverage = trajectory.totalFrames > 0
      ? trajectory.usableHandFrames / trajectory.totalFrames
      : 0;
    console.log(
      `  ${trajectory.fixtureId}: pose ${(poseCoverage * 100).toFixed(1)}%, hands ${(handCoverage * 100).toFixed(1)}%`,
    );
  }
} finally {
  await server.close();
}

function parseArguments(values) {
  const inputs = [];
  let output = null;
  for (let index = 0; index < values.length; index += 2) {
    const key = values[index];
    const value = values[index + 1];
    if (!key?.startsWith("--") || !value) {
      throw new Error("Expected repeated --input paths and one --output path.");
    }
    if (key === "--input") inputs.push(resolve(value));
    else if (key === "--output") output = resolve(value);
    else throw new Error(`Unknown argument: ${key}`);
  }
  if (inputs.length < 2) throw new Error("At least two --input fixtures are required.");
  if (!output) throw new Error("Missing required --output path.");
  return { inputs, output };
}

function serialize(value) {
  return `${JSON.stringify(value, (_key, item) =>
    typeof item === "number" ? Number(item.toFixed(6)) : item, 2)}\n`;
}
