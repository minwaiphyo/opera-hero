import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { createServer } from "vite";

const argumentsMap = parseArguments(process.argv.slice(2));
const inputPath = requiredPath(argumentsMap, "input");
const outputPath = requiredPath(argumentsMap, "output");
const comparisonPath = optionalPath(argumentsMap, "compare");

const server = await createServer({
  appType: "custom",
  logLevel: "error",
  server: { middlewareMode: true },
});

try {
  const { parseVisionReplayFixture } = await server.ssrLoadModule(
    "/src/vision/replay/visionReplayValidation.ts",
  );
  const { extractWaterSleevesTrajectory } = await server.ssrLoadModule(
    "/src/domain/gestures/features/waterSleevesTrajectory.ts",
  );
  const { buildWaterSleevesReferenceEnvelope, compareWaterSleevesTrajectory } =
    await server.ssrLoadModule(
      "/src/domain/gestures/scoring/waterSleevesEnvelope.ts",
    );

  const fixture = await loadFixture(inputPath, parseVisionReplayFixture);
  const trajectory = extractWaterSleevesTrajectory(fixture);
  const envelope = buildWaterSleevesReferenceEnvelope(trajectory);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, serialize(envelope), "utf8");
  console.log(
    `Wrote ${envelope.progressPoints} reference points to ${outputPath}.`,
  );

  if (comparisonPath) {
    const comparisonFixture = await loadFixture(
      comparisonPath,
      parseVisionReplayFixture,
    );
    const comparison = compareWaterSleevesTrajectory(
      extractWaterSleevesTrajectory(comparisonFixture),
      envelope,
    );
    console.log(
      `Supporting fixture fit: ${(comparison.overallFit * 100).toFixed(1)}%`,
    );
    for (const [signal, fit] of Object.entries(comparison.signalFit)) {
      console.log(`  ${signal}: ${(fit * 100).toFixed(1)}%`);
    }
  }
} finally {
  await server.close();
}

async function loadFixture(path, parse) {
  const value = JSON.parse(await readFile(path, "utf8"));
  return parse(value);
}

function serialize(value) {
  return `${JSON.stringify(value, (_key, item) =>
    typeof item === "number" ? Number(item.toFixed(6)) : item, 2)}\n`;
}

function parseArguments(values) {
  const parsed = new Map();
  for (let index = 0; index < values.length; index += 2) {
    const key = values[index];
    const value = values[index + 1];
    if (!key?.startsWith("--") || !value) {
      throw new Error("Expected --input, --output, and optional --compare paths.");
    }
    parsed.set(key.slice(2), value);
  }
  return parsed;
}

function requiredPath(argumentsMap, name) {
  const value = argumentsMap.get(name);
  if (!value) throw new Error(`Missing required --${name} path.`);
  return resolve(value);
}

function optionalPath(argumentsMap, name) {
  const value = argumentsMap.get(name);
  return value ? resolve(value) : null;
}
