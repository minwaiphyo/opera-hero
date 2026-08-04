import { readFile, writeFile } from "node:fs/promises";

const input = new URL("../local-artifacts/landmark-fixtures/opening-door-normal-take-1.fixture.json", import.meta.url);
const output = new URL("../src/domain/gestures/references/openingDoor.guide.json", import.meta.url);
const source = JSON.parse(await readFile(input, "utf8"));
const pointCount = 41;
const lastIndex = source.frames.length - 1;
const durationMs = source.frames[lastIndex].offsetMs;
const frames = Array.from({ length: pointCount }, (_, index) => {
  const sourceFrame = source.frames[Math.round((index / (pointCount - 1)) * lastIndex)];
  return {
    offsetMs: Math.round((index / (pointCount - 1)) * durationMs),
    pose: sourceFrame.pose,
    hands: sourceFrame.hands,
  };
});
await writeFile(output, `${JSON.stringify({
  schemaVersion: 1,
  id: "opening-door-practitioner-guide",
  description: "Compact pose-and-hand Opening Door practitioner guide.",
  source: "practitioner-reference",
  containsRecordedImagery: false,
  frames,
})}\n`, "utf8");
console.log(`Wrote ${frames.length} Opening Door guide frames over ${durationMs} ms.`);
